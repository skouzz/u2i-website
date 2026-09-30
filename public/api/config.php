<?php
/**
 * U2I Process — CMS configuration & shared helpers (OVH shared hosting).
 *
 * ── MySQL (OVH) ─────────────────────────────────────────────────────────────
 * In the OVH Control Panel: Web Cloud → Databases → create a MySQL database.
 * It gives you: server (…mysql.db), database name, user, password.
 * Fill the four constants below with those values, then open /api/install.php
 * once in a browser to create the tables.
 */

declare(strict_types=1);

// ── Database (fill with the values OVH gives you) ───────────────────────────
const DB_HOST = 'u2iprocesscom.mysql.db';
const DB_NAME = 'u2iprocesscomdb';
const DB_USER = 'u2iprocesscomdb';
const DB_PASS = 'CHANGE_ME';

// ── Admin dashboard ─────────────────────────────────────────────────────────
// Created on first login — set it immediately after your first sign-in.
const DEFAULT_ADMIN_USER = 'admin';
const DEFAULT_ADMIN_HASH = '$2y$10$DzZbAgvGxZxWb1Yd6A6yYuJd3WQzZRFMCk2DPzVZG6JgDUmifCbwi'; // "changeme"

// ── Uploads ──────────────────────────────────────────────────────────────────
const UPLOAD_DIR = __DIR__ . '/uploads';
const UPLOAD_MAX_BYTES = 12 * 1024 * 1024; // 12 MB
const ALLOWED_IMAGE_TYPES = [
    'image/jpeg' => 'jpg',
    'image/png' => 'png',
    'image/webp' => 'webp',
    'image/gif' => 'gif',
    'image/svg+xml' => 'svg',
];

// ── Internal helpers ────────────────────────────────────────────────────────

function db(): PDO
{
    static $pdo = null;
    if ($pdo instanceof PDO) {
        return $pdo;
    }

    $dsn = sprintf('mysql:host=%s;dbname=%s;charset=utf8mb4', DB_HOST, DB_NAME);
    $pdo = new PDO($dsn, DB_USER, DB_PASS, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);

    return $pdo;
}

function json_response(array $payload, int $status = 200): void
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($payload, JSON_UNESCAPED_UNICODE);
    exit;
}

function read_json_body(): array
{
    $raw = file_get_contents('php://input');
    if (!is_string($raw) || trim($raw) === '') {
        return $_POST;
    }
    try {
        $data = json_decode($raw, true, 512, JSON_THROW_ON_ERROR);
    } catch (JsonException) {
        json_response(['ok' => false, 'message' => 'Invalid JSON payload.'], 400);
    }

    return is_array($data) ? $data : [];
}

function field(array $data, string $key): string
{
    return isset($data[$key]) && is_scalar($data[$key]) ? trim((string) $data[$key]) : '';
}

function admin_session_start(): void
{
    if (session_status() !== PHP_SESSION_ACTIVE) {
        session_name('u2i_admin_session');
        session_start();
    }
}

function admin_login(string $username, string $password): bool
{
    admin_session_start();

    $storedUser = getenv('U2I_ADMIN_USER') ?: DEFAULT_ADMIN_USER;
    $storedHash = getenv('U2I_ADMIN_HASH') ?: DEFAULT_ADMIN_HASH;

    if (!hash_equals($storedUser, $username) || !password_verify($password, $storedHash)) {
        usleep(400000); // slow brute force
        return false;
    }

    session_regenerate_id(true);
    $_SESSION['admin'] = true;
    $_SESSION['admin_at'] = time();

    return true;
}

function admin_logout(): void
{
    admin_session_start();
    $_SESSION = [];
    if (ini_get('session.use_cookies')) {
        $p = session_get_cookie_params();
        setcookie(session_name(), '', time() - 42000, $p['path'], $p['domain'], $p['secure'], $p['httponly']);
    }
    session_destroy();
}

function require_admin(): void
{
    admin_session_start();
    $timeout = 12 * 3600; // 12h idle logout
    if (empty($_SESSION['admin']) || (time() - (int) ($_SESSION['admin_at'] ?? 0)) > $timeout) {
        json_response(['ok' => false, 'message' => 'Not authenticated.'], 401);
    }
    $_SESSION['admin_at'] = time();
}

function csrf_token(): string
{
    admin_session_start();
    if (empty($_SESSION['csrf'])) {
        $_SESSION['csrf'] = bin2hex(random_bytes(32));
    }

    return (string) $_SESSION['csrf'];
}

function verify_csrf(string $token): void
{
    admin_session_start();
    if (empty($_SESSION['csrf']) || !hash_equals((string) $_SESSION['csrf'], $token)) {
        json_response(['ok' => false, 'message' => 'Invalid CSRF token.'], 403);
    }
}

function is_db_installed(): bool
{
    try {
        $tables = db()->query('SHOW TABLES')->fetchAll(PDO::FETCH_COLUMN);

        return count($tables) > 0;
    } catch (Throwable) {
        return false;
    }
}

/**
 * Move an uploaded image into /api/uploads with a random, safe filename.
 * @return array{url:string,width:array<int,int>|null}
 */
function store_uploaded_image(array $file): array
{
    if (($file['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) {
        json_response(['ok' => false, 'message' => "Échec de l'envoi du fichier."], 400);
    }
    if ((int) ($file['size'] ?? 0) > UPLOAD_MAX_BYTES) {
        json_response(['ok' => false, 'message' => 'Fichier trop volumineux (max 12 Mo).'], 400);
    }

    $tmp = (string) ($file['tmp_name'] ?? '');
    $mime = mime_content_type($tmp) ?: '';
    if (!isset(ALLOWED_IMAGE_TYPES[$mime])) {
        json_response(['ok' => false, 'message' => 'Type de fichier non autorisé (images uniquement).'], 400);
    }

    if (!is_dir(UPLOAD_DIR) && !mkdir(UPLOAD_DIR, 0755, true) && !is_dir(UPLOAD_DIR)) {
        json_response(['ok' => false, 'message' => "Impossible de créer le dossier d'upload."], 500);
    }

    $ext = ALLOWED_IMAGE_TYPES[$mime];
    $name = bin2hex(random_bytes(12)) . '.' . $ext;
    if (!move_uploaded_file($tmp, UPLOAD_DIR . '/' . $name)) {
        json_response(['ok' => false, 'message' => "Échec de l'enregistrement du fichier."], 500);
    }
    @chmod(UPLOAD_DIR . '/' . $name, 0644);

    $width = null;
    $height = null;
    if ($mime !== 'image/svg+xml') {
        $info = @getimagesize(UPLOAD_DIR . '/' . $name);
        if (is_array($info)) {
            $width = (int) $info[0];
            $height = (int) $info[1];
        }
    }

    return ['url' => '/api/uploads/' . $name, 'width' => $width, 'height' => $height];
}

function uuid(): string
{
    return bin2hex(random_bytes(8));
}
