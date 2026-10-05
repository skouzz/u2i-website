<?php
/**
 * U2I Process — CMS configuration & shared helpers (OVH shared hosting).
 *
 * ── Credentials (NEVER COMMIT THEM) ─────────────────────────────────────────
 * No database credential lives in this file. Values are resolved, in order:
 *   1. public/api/config.local.php  — git-ignored, blocked from HTTP by .htaccess
 *   2. Environment variables        — DB_HOST, DB_NAME, DB_USER, DB_PASS
 * Copy config.local.example.php to config.local.php and fill it in, or set the
 * environment variables. If neither provides a value, db() throws a clear error
 * instead of silently connecting with a default.
 *
 * ── MySQL (OVH) ─────────────────────────────────────────────────────────────
 * In the OVH Control Panel: Web Cloud → Databases → create a MySQL database.
 * It gives you: server (…mysql.db), database name, user, password.
 * Put those four values in config.local.php, then open /api/install.php
 * once in a browser to create the tables.
 */

declare(strict_types=1);

// All timestamps (published_at, NOW() comparisons in public queries) must use
// the same clock as MySQL — a PHP/MySQL timezone mismatch silently hides fresh
// content for up to one hour (published_at > NOW()).
if (function_exists('date_default_timezone_set')) {
    date_default_timezone_set('UTC');
}

// ── Credential sources ──────────────────────────────────────────────────────
// 1) config.local.php first (git-ignored, blocked from HTTP access by .htaccess).
//    It uses define() and may set ANY constant below.
if (is_file(__DIR__ . '/config.local.php')) {
    require __DIR__ . '/config.local.php';
}

// 2) Environment variables, used for any value the local file did not define.
foreach ([
    'DB_HOST' => 'U2I_DB_HOST',
    'DB_NAME' => 'U2I_DB_NAME',
    'DB_USER' => 'U2I_DB_USER',
    'DB_PASS' => 'U2I_DB_PASS',
] as $const => $envName) {
    if (defined($const)) {
        continue;
    }
    $envValue = getenv($envName);
    if ($envValue === false || $envValue === '') {
        $envValue = $_SERVER[$envName] ?? $_ENV[$envName] ?? '';
    }
    if (is_string($envValue) && $envValue !== '') {
        define($const, $envValue);
    }
}

// 3) No value anywhere: leave the constant undefined. db() reports it clearly
//    rather than attempting a connection with a placeholder host.
foreach (['DB_HOST', 'DB_NAME', 'DB_USER', 'DB_PASS'] as $required) {
    if (!defined($required)) {
        define($required, '');
    }
}

// Admin dashboard: create the account from the dashboard on first login
// (setup mode) — it stores a real password_hash() in the `admins` table.
// DEFAULT_ADMIN_* below is only a fallback used when the DB is unreachable;
// the hash must be generated with:
//   php -r "echo password_hash('yourpass', PASSWORD_DEFAULT);"
// Leave DEFAULT_ADMIN_HASH empty ('') to disable the fallback.
if (!defined('DEFAULT_ADMIN_USER')) {
    define('DEFAULT_ADMIN_USER', 'admin');
}
if (!defined('DEFAULT_ADMIN_HASH')) {
    define('DEFAULT_ADMIN_HASH', '');
}
if (!defined('PLUNK_API_KEY')) {
    define('PLUNK_API_KEY', '');
}

// ── Resolved runtime values (local override → production default) ───────────
if (!defined('U2I_DB_HOST')) {
    define('U2I_DB_HOST', DB_HOST);
}
if (!defined('U2I_DB_NAME')) {
    define('U2I_DB_NAME', DB_NAME);
}
if (!defined('U2I_DB_USER')) {
    define('U2I_DB_USER', DB_USER);
}
if (!defined('U2I_DB_PASS')) {
    define('U2I_DB_PASS', DB_PASS);
}
if (!defined('U2I_ADMIN_USER')) {
    define('U2I_ADMIN_USER', DEFAULT_ADMIN_USER);
}
if (!defined('U2I_ADMIN_HASH')) {
    define('U2I_ADMIN_HASH', DEFAULT_ADMIN_HASH);
}
if (!defined('U2I_PLUNK_API_KEY')) {
    define('U2I_PLUNK_API_KEY', PLUNK_API_KEY);
}

// ── Uploads (FIX: these constants were referenced but never defined) ────────
if (!defined('UPLOAD_DIR')) {
    define('UPLOAD_DIR', __DIR__ . '/uploads');
}
/** MIME type → safe extension. SVG is served with a hardened CSP header. */
if (!defined('ALLOWED_IMAGE_TYPES')) {
    define('ALLOWED_IMAGE_TYPES', [
        'image/jpeg' => 'jpg',
        'image/png' => 'png',
        'image/webp' => 'webp',
        'image/gif' => 'gif',
        'image/svg+xml' => 'svg',
    ]);
}
if (!defined('UPLOAD_MAX_BYTES')) {
    define('UPLOAD_MAX_BYTES', 12 * 1024 * 1024); // 12 MB
}

// ── Internal helpers ────────────────────────────────────────────────────────

function db(): PDO
{
    static $pdo = null;
    if ($pdo instanceof PDO) {
        return $pdo;
    }

    // Fail loudly and actionably instead of connecting to a placeholder host.
    foreach (['U2I_DB_HOST', 'U2I_DB_NAME', 'U2I_DB_USER'] as $required) {
        if (constant($required) === '') {
            throw new RuntimeException(
                'Configuration MySQL manquante (' . $required . '). '
                . 'Renseignez public/api/config.local.php (voir config.local.example.php) '
                . 'ou les variables d’environnement DB_HOST / DB_NAME / DB_USER / DB_PASS.'
            );
        }
    }

    $dsn = sprintf('mysql:host=%s;dbname=%s;charset=utf8mb4', U2I_DB_HOST, U2I_DB_NAME);
    $pdo = new PDO($dsn, U2I_DB_USER, U2I_DB_PASS, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);

    return $pdo;
}

function json_response(array $payload, int $status = 200): void
{
    while (ob_get_level() > 0) {
        ob_end_clean(); // drop any stray warnings/notices before the JSON body
    }
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    header('X-Content-Type-Options: nosniff');
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
    } catch (JsonException $e) {
        json_response(['ok' => false, 'message' => 'Invalid JSON payload.'], 400);
    }

    return is_array($data) ? $data : [];
}

function field(array $data, string $key): string
{
    return isset($data[$key]) && is_scalar($data[$key]) ? trim((string) $data[$key]) : '';
}

/** Fetch a boolean flag from a decoded JSON body. */
function flag(array $data, string $key): bool
{
    return !empty($data[$key]);
}/** Fetch a positive int from a decoded JSON body (0 when absent/invalid). */
function int_field(array $data, string $key): int
{
    return isset($data[$key]) && is_numeric($data[$key]) ? (int) $data[$key] : 0;
}

/** Reference kinds the site understands, in the order they are displayed. */
const U2I_REFERENCE_KINDS = ['client', 'partner', 'certification'];

/**
 * Make sure site_references matches what the code reads and writes.
 *
 * The table is created by install.php / database/schema.sql, but an existing
 * production database can predate any of its current columns or the third
 * `kind` value. That used to fail silently in the worst possible way: the
 * dashboard replaces the whole list on save, so a single row whose `kind` the
 * ENUM rejected aborted the INSERT halfway and left the table EMPTY — hence
 * "La liste est vide" with clients and partners gone from the site.
 *
 * So the references endpoints reconcile the table themselves instead of
 * assuming install.php was re-run after every schema change. Every step is
 * guarded on the current column definition, runs at most once per request, and
 * never throws: a hosting plan without ALTER privileges logs the reason and
 * lets the caller report it, rather than turning the whole page into a 500.
 *
 * Returns true when the table is usable as the code expects it.
 */
function ensure_reference_schema(): bool
{
    static $ready = null;
    if ($ready !== null) {
        return $ready;
    }

    $log = static function (string $step, Throwable $e): void {
        error_log(sprintf('[u2i] site_references: %s failed: %s', $step, $e->getMessage()));
    };

    try {
        $pdo = db();
        $pdo->exec(
            "CREATE TABLE IF NOT EXISTS site_references (
                id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
                kind ENUM('client','partner','certification') NOT NULL DEFAULT 'partner',
                title VARCHAR(255) NOT NULL,
                image_url VARCHAR(500) NULL,
                website_url VARCHAR(500) NULL,
                sort_order SMALLINT UNSIGNED NOT NULL DEFAULT 0,
                is_visible TINYINT(1) NOT NULL DEFAULT 1,
                i18n_json JSON NULL,
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_site_references (kind, is_visible, sort_order)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci"
        );

        $columns = $pdo->prepare(
            'SELECT COLUMN_NAME FROM information_schema.COLUMNS
             WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?'
        );
        $columns->execute(['site_references']);
        $present = array_map(
            static fn (array $row): string => strtolower((string) $row['COLUMN_NAME']),
            $columns->fetchAll()
        );
        $kindType = '';
        foreach ($present as $name) {
            if ($name !== 'kind') {
                continue;
            }
            $type = $pdo->prepare(
                'SELECT COLUMN_TYPE FROM information_schema.COLUMNS
                 WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?'
            );
            $type->execute(['site_references', 'kind']);
            $kindType = (string) ($type->fetch()['COLUMN_TYPE'] ?? '');
        }

        // Columns added after the first release of the table.
        foreach (['i18n_json' => 'JSON NULL', 'website_url' => 'VARCHAR(500) NULL'] as $col => $def) {
            if (!in_array($col, $present, true)) {
                $pdo->exec("ALTER TABLE site_references ADD COLUMN {$col} {$def}");
            }
        }

        // Widening an ENUM keeps every existing row valid, so this is safe on a
        // live database: the only thing it adds is the ability to store 'client'.
        if ($kindType === '' || strpos($kindType, "'client'") === false) {
            $pdo->exec(
                "ALTER TABLE site_references
                 MODIFY COLUMN kind ENUM('client','partner','certification') NOT NULL DEFAULT 'partner'"
            );
        }
    } catch (Throwable $e) {
        $log('reconcile', $e);
        $ready = false;
        return $ready;
    }

    $ready = true;
    return $ready;
}

/**
 * Re-file reference rows that were saved under the wrong kind.
 *
 * When this section was still two pages, the dashboard had no way to create a
 * `client` row, so every client logo was stored as `partner`. The page then
 * found nothing on the client side and showed partners only — with the clients
 * invisible no matter how many rows the database held.
 *
 * The bundled logo list is the authority on which register a logo belongs to,
 * so a row whose image matches a bundled CLIENT is moved back to `client`, and
 * one matching a bundled PARTNER is moved to `partner`. Rows whose image is
 * unknown to us (an upload the admin made) are left exactly as they are: we have
 * no basis to re-file those, and guessing would shuffle someone's content.
 *
 * Additive and idempotent: it only ever updates `kind` on rows it can identify
 * with certainty, never inserts, never deletes, and re-running it changes
 * nothing once the data is correct.
 *
 * Returns the number of rows re-filed, for logging.
 */
function repair_reference_kinds(): int
{
    $byStem = [];
    foreach (reference_kind_map() as $kind => $stems) {
        foreach ($stems as $stem) {
            $byStem[reference_stem_key($stem)] = $kind;
        }
    }

    try {
        $pdo = db();
        $rows = $pdo->query('SELECT id, kind, image_url FROM site_references')->fetchAll();
    } catch (Throwable $e) {
        error_log(sprintf('[u2i] site_references: kind repair read failed: %s', $e->getMessage()));
        return 0;
    }

    $fixed = 0;
    $update = null;
    foreach ($rows as $row) {
        $image = trim((string) ($row['image_url'] ?? ''));
        if ($image === '') {
            continue;
        }
        // Compare on the filename stem: a stored URL carries a build hash and
        // an extension, neither of which the bundled list knows about.
        $wanted = reference_kind_for_image($image, $byStem);
        if ($wanted === null || $wanted === (string) $row['kind']) {
            continue;
        }
        try {
            if ($update === null) {
                $update = $pdo->prepare('UPDATE site_references SET kind = ? WHERE id = ?');
            }
            $update->execute([$wanted, (int) $row['id']]);
            $fixed++;
        } catch (Throwable $e) {
            error_log(sprintf('[u2i] site_references: kind repair write failed: %s', $e->getMessage()));
            return $fixed;
        }
    }

    if ($fixed > 0) {
        error_log(sprintf('[u2i] site_references: re-filed %d row(s) into the right kind', $fixed));
    }

    return $fixed;
}

/**
 * Reduce a logo filename to the part that identifies it across builds.
 *
 * A stored URL looks like `/assets/Sanofi-Bx7f2a1.png` in a build and
 * `/src/assets/partners/Sanofi.png` in dev, while the bundled list only knows
 * the original name. Decoding, taking the basename and dropping the extension
 * leaves `sanofi` or `sanofi-bx7f2a1`; the build hash is appended by the
 * bundler and is not part of the logo's identity. Comparison is
 * case-insensitive because macOS and Windows report the same file either way.
 */
function reference_stem_key(string $nameOrUrl): string
{
    $decoded = $nameOrUrl;
    if (strpos($decoded, '%') !== false) {
        $decoded = rawurldecode($decoded);
    }
    $decoded = str_replace('\\\\', '/', $decoded);
    $base = basename($decoded);
    $stem = preg_replace('/\\.[a-z0-9]+$/i', '', $base);

    return mb_strtolower(trim((string) ($stem ?? $base)));
}

/**
 * Find the kind a stored image belongs to, by filename.
 *
 * The stored name may carry a build hash (`sanofi-bx7f2a1`), so an exact match
 * on the whole stem is not enough. Matching is therefore: the stored stem
 * EQUALS a known name, or the stored stem STARTS WITH a known name followed by a
 * separator — which is how Vite appends its hash. Anything else (an upload the
 * admin made, a logo we do not ship) matches nothing and is left untouched,
 * rather than being guessed into the wrong register.
 *
 * Returns the kind, or null when the image is not one of the bundled logos.
 */
function reference_kind_for_image(string $imageUrl, array $byStem): ?string
{
    $stem = reference_stem_key($imageUrl);
    if ($stem === '') {
        return null;
    }
    if (isset($byStem[$stem])) {
        return $byStem[$stem];
    }
    foreach ($byStem as $known => $kind) {
        if ($known !== '' && strncmp($stem, $known . '-', strlen($known) + 1) === 0) {
            return $kind;
        }
    }

    return null;
}

/**
 * Bundled logo images per kind, mirrored from src/lib/references-bundled.ts.
 *
 * The public logos are Vite asset imports, so their final URL is only known at
 * build time; the FILENAME is stable across builds and is what identifies a
 * logo. Matching on the trailing filename means a row saved from the dashboard
 * (`/assets/Sanofi-abc123.png` or `/src/assets/partners/Sanofi.png`) still
 * resolves to the same bundled client.
 *
 * Kept in sync by scripts/check-bundled-references.mjs, which fails if this
 * list and the TypeScript one drift apart.
 */
function reference_kind_map(): array
{
    static $map = null;
    if ($map !== null) {
        return $map;
    }

    return $map = [
        'client' => [
            'Sanofi', 'LOGO%20HIKMA', 'LOGO%20SAIPH', 'LOGO%20TERIAK', 'UNIMED%20LOGO',
            'Berg-Life-Sciences-295x300', 'LOGO-MEDIKA-300x269', 'LOGO-MediS-300x264',
            'logo-PHARMA-DEARM-296x300', 'logo-adwya--300x291', 'logo-thera-400-150x150',
            'opella-1-300x278', 'winthrop-1-300x296', 'LOGO-STERIPHARM-300x268',
            'Pierre-fabre-logo-1-300x288', 'LOGO%20DELICE', 'cogia-logo',
            'dorcas-logo-300x225', 'LOGO-DAR_ESSAYDALI_94d6073d8c-1-300x280',
            'logo-MEVA-150x150', 'logo-LMP-291x300',
        ],
        'partner' => [
            'AXXAIR-logo', 'Enex-we-know-how-logo-retina-300x262', 'BWT',
            'tetrapak-logo-screen-400-150x150', 'sartorius-logo-vector-2-300x288',
            'LOGO_CEVA_SANTE_ANIMALE', 'LOGO-ADVANCS-150x150',
        ],
    ];
}

/** URL-safe slug (accents folded, lowercase, dashes). */
function slugify(string $text): string
{
    $text = mb_strtolower(trim($text));
    // NFD + combining-marks strip: locale-independent accent folding. The old
    // iconv//TRANSLIT path dropped characters under C locales ("É" → "").
    if (class_exists('Normalizer')) {
        $normalized = normalizer_normalize($text, Normalizer::FORM_D);
        if ($normalized !== false) {
            $text = (string) preg_replace('~\p{M}+~u', '', $normalized);
        }
    }
    $text = preg_replace('~[^a-z0-9]+~', '-', $text) ?? '';
    $text = trim($text, '-');

    return $text !== '' ? $text : 'sans-titre';
}

/**
 * Guarantee a unique slug in $table. $table must come from the internal
 * allow-list — never from user input (identifier injection guard).
 */
function unique_slug(string $table, string $base, int $excludeId = 0, string $column = 'slug'): string
{
    static $allowed = ['pages', 'articles', 'categories', 'tags'];
    if (!in_array($table, $allowed, true)) {
        throw new InvalidArgumentException('Unknown table for slug generation.');
    }
    if (!in_array($column, ['slug', 'slug_en'], true)) {
        throw new InvalidArgumentException('Unknown slug column.');
    }

    $slug = $base;
    $i = 2;
    while (true) {
        $stmt = db()->prepare("SELECT COUNT(*) AS c FROM {$table} WHERE {$column} = ? AND id != ?");
        $stmt->execute([$slug, $excludeId]);
        if ((int) $stmt->fetch()['c'] === 0) {
            return $slug;
        }
        $slug = $base . '-' . $i++;
    }
}

// ── i18n ────────────────────────────────────────────────────────────────────

/** Source language: French. Never stored as a translation. */
const U2I_SRC_LANG = 'fr';
/** Languages the public site can serve. French stays at the root. */
const U2I_LANGS = ['fr', 'en'];

/**
 * Resolve the language to serve.
 *
 * Precedence: explicit ?lang= → ?/path prefix hint (the front-end sends
 * X-U2I-Lang) → Accept-Language → French. French is the source language and
 * always resolves, so the public site keeps working on an older build.
 */
function current_lang(): string
{
    static $resolved = null;
    if ($resolved !== null) {
        return $resolved;
    }

    $candidates = [];
    $explicit = $_GET['lang'] ?? null;
    if (is_string($explicit) && $explicit !== '') {
        $candidates[] = $explicit;
    }
    $header = $_SERVER['HTTP_X_U2I_LANG'] ?? null;
    if (is_string($header) && $header !== '') {
        $candidates[] = $header;
    }
    $accept = $_SERVER['HTTP_ACCEPT_LANGUAGE'] ?? '';
    if (is_string($accept) && $accept !== '') {
        foreach (explode(',', $accept) as $chunk) {
            $tag = strtolower(trim(explode(';', $chunk)[0]));
            if ($tag !== '') {
                $candidates[] = substr($tag, 0, 2);
            }
        }
    }

    foreach ($candidates as $candidate) {
        $candidate = strtolower(substr((string) $candidate, 0, 2));
        if (in_array($candidate, U2I_LANGS, true)) {
            return $resolved = $candidate;
        }
    }

    return $resolved = U2I_SRC_LANG;
}

/** Decode an i18n_json column into ['en' => [field => value], …]. */
function decode_i18n(?string $raw): array
{
    if ($raw === null || $raw === '') {
        return [];
    }
    $decoded = json_decode($raw, true);
    return is_array($decoded) ? $decoded : [];
}

/** Encode a translation map for storage, dropping empty values. */
function encode_i18n(array $byLang): string
{
    $clean = [];
    foreach ($byLang as $lang => $fields) {
        if (!is_array($fields)) {
            continue;
        }
        $fields = array_filter(
            $fields,
            static fn ($v) => $v !== null && $v !== '' && $v !== []
        );
        if ($fields) {
            $clean[$lang] = $fields;
        }
    }

    // An empty map must serialize as {} not []: this lands in a MySQL JSON
    // column and every consumer expects an object keyed by language.
    $json = json_encode(
        $clean === [] ? new stdClass() : $clean,
        JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES
    );

    return $json === false ? '{}' : $json;
}

/** One language's fields for an entity, always an array. */
function i18n_fields(array $i18n, string $lang): array
{
    $fields = $i18n[$lang] ?? null;
    return is_array($fields) ? $fields : [];
}

/**
 * Overlay the requested language onto a base (French) row.
 *
 * Each field is filled from the translation when present and non-empty,
 * otherwise it keeps the French value. $fieldMap is [dbColumn => jsonKey].
 * Returns the merged row plus a per-field list of what was actually
 * translated, so the admin can flag gaps.
 */
function apply_i18n(array $row, array $fieldMap, string $lang): array
{
    if ($lang === U2I_SRC_LANG || $fieldMap === []) {
        return $row;
    }

    $i18n = decode_i18n(isset($row['i18n_json']) ? (string) $row['i18n_json'] : null);
    $fields = i18n_fields($i18n, $lang);

    foreach ($fieldMap as $column => $key) {
        if (!array_key_exists($key, $fields)) {
            continue;
        }
        $value = $fields[$key];
        if ($value === null || $value === '' || $value === []) {
            continue;
        }
        $row[$column] = $value;
    }

    return $row;
}

/**
 * Which fields still lack a translation, for the admin warning badge.
 * Returns a flat list of JSON keys, e.g. ['title', 'body'].
 */
function i18n_missing(array $i18n, array $fieldMap, string $lang = 'en'): array
{
    $fields = i18n_fields($i18n, $lang);
    $missing = [];
    foreach ($fieldMap as $key) {
        if (!isset($fields[$key]) || $fields[$key] === '' || $fields[$key] === []) {
            $missing[] = $key;
        }
    }

    return $missing;
}

/** True when at least one field of the entity is translated. */
function i18n_is_translated(array $i18n, string $lang = 'en'): bool
{
    return i18n_fields($i18n, $lang) !== [];
}

/**
 * Resolve a public slug in the active language.
 * An untranslated entity is still reachable under its French slug, so old
 * links and shared URLs never 404.
 */
function find_by_slug(string $table, string $slug, string $lang, bool $publishedOnly, bool $preview)
{
    static $allowed = ['pages', 'articles'];
    if (!in_array($table, $allowed, true)) {
        throw new InvalidArgumentException('Unknown table.');
    }

    $statusClause = $publishedOnly ? " AND status = 'published'" : '';
    if (!$publishedOnly) {
        $statusClause = '';
    }

    $attempts = [];
    if ($lang !== U2I_SRC_LANG) {
        $attempts[] = 'slug_en';
    }
    $attempts[] = 'slug';

    foreach ($attempts as $column) {
        $sql = "SELECT * FROM {$table} WHERE {$column} = ?{$statusClause} LIMIT 1";
        $stmt = db()->prepare($sql);
        $stmt->execute([$slug]);
        $row = $stmt->fetch();
        if ($row) {
            return $row;
        }
    }

    return null;
}

function admin_session_start(): void
{
    if (session_status() !== PHP_SESSION_ACTIVE) {
        // Hardened session cookie (works on plain HTTP OVH hosting too).
        @ini_set('session.use_strict_mode', '1');
        @ini_set('session.use_only_cookies', '1');
        @ini_set('session.cookie_httponly', '1');
        @ini_set('session.cookie_samesite', 'Lax');
        if (($_SERVER['HTTPS'] ?? '') !== '' && ($_SERVER['HTTPS'] ?? 'off') !== 'off') {
            @ini_set('session.cookie_secure', '1');
        }
        session_name('u2i_admin_session');
        session_start();
    }
}

function admin_login(string $username, string $password): bool
{
    admin_session_start();

    $hash = admin_password_hash_for($username);
    if ($hash === null) {
        usleep(400000); // slow brute force
        return false;
    }

    // Guard against accounts seeded with a non-PHP placeholder hash (old
    // schema versions): password_verify() would always fail silently.
    if (!preg_match('/^\$2[aby]\$|^\$argon2/', $hash)) {
        json_response([
            'ok' => false,
            'message' => "Compte administrateur invalide (ancien schéma). Dans phpMyAdmin, exécutez « DELETE FROM admins; » puis rechargez /admin pour recréer le compte.",
        ], 409);
    }

    if (!password_verify($password, $hash)) {
        usleep(400000); // slow brute force
        return false;
    }

    session_regenerate_id(true);
    $_SESSION['admin'] = true;
    $_SESSION['admin_at'] = time();
    $_SESSION['admin_username'] = $username;

    return true;
}

/**
 * Look up a user's bcrypt hash: database `admins` table first (editable from
 * the dashboard), then the config/env credentials as fallback.
 */
function admin_password_hash_for(string $username): ?string
{
    try {
        $stmt = db()->prepare('SELECT password_hash FROM admins WHERE username = ? LIMIT 1');
        $stmt->execute([$username]);
        $row = $stmt->fetch();
        if (is_array($row) && $row['password_hash'] !== '') {
            return (string) $row['password_hash'];
        }
    } catch (Throwable $e) {
        // DB not installed/reachable — fall back to config credentials.
    }

    if (hash_equals(U2I_ADMIN_USER, $username) && U2I_ADMIN_HASH !== '') {
        return U2I_ADMIN_HASH;
    }

    return null;
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
    } catch (Throwable $e) {
        return false;
    }
}

/**
 * Lightweight file-backed rate limiter (used for login attempts).
 * @return bool true when the action is allowed this time.
 */
function rate_limit_ok(string $scope, int $max, int $windowSeconds): bool
{
    $ip = $_SERVER['REMOTE_ADDR'] ?? '';
    if ($ip === '') {
        return true;
    }
    $dir = __DIR__ . '/cache';
    if (!is_dir($dir) && !@mkdir($dir, 0755, true) && !is_dir($dir)) {
        return true; // cannot persist state; don't lock admins out
    }

    $file = $dir . '/rl-' . hash('sha256', $scope . '|' . $ip) . '.json';
    $now = time();
    $hits = [];
    if (is_file($file)) {
        $decoded = json_decode((string) @file_get_contents($file), true);
        if (is_array($decoded)) {
            $hits = $decoded;
        }
    }
    $hits = array_values(array_filter($hits, static fn ($t): bool => is_int($t) || is_numeric($t) ? (int) $t > $now - $windowSeconds : false));

    if (count($hits) >= $max) {
        return false;
    }

    $hits[] = $now;
    @file_put_contents($file, json_encode($hits));

    return true;
}

/**
 * Move an uploaded image into /api/uploads with a random, safe filename.
 * @return array{url:string,width:int|null,height:int|null}
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
    if ($tmp === '' || !is_uploaded_file($tmp)) {
        json_response(['ok' => false, 'message' => 'Fichier invalide.'], 400);
    }
    $mime = function_exists('mime_content_type') ? (mime_content_type($tmp) ?: '') : '';
    if ($mime === '' && function_exists('getimagesize')) {
        $info = @getimagesize($tmp);
        $mime = is_array($info) ? (string) $info['mime'] : '';
    }
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

/** Serve one upload with hardened headers (SVG gets a strict CSP). */
function serve_upload(string $filename): void
{
    $filename = basename($filename); // path-traversal guard
    $path = UPLOAD_DIR . '/' . $filename;
    if (!is_file($path)) {
        http_response_code(404);
        exit('Not found');
    }

    $ext = strtolower(pathinfo($path, PATHINFO_EXTENSION));
    $mimes = [
        'jpg' => 'image/jpeg',
        'jpeg' => 'image/jpeg',
        'png' => 'image/png',
        'webp' => 'image/webp',
        'gif' => 'image/gif',
        'svg' => 'image/svg+xml',
        'pdf' => 'application/pdf',
    ];
    $mime = $mimes[$ext] ?? 'application/octet-stream';

    header('Content-Type: ' . $mime);
    header('Content-Length: ' . (string) filesize($path));
    header('X-Content-Type-Options: nosniff');
    header('Cache-Control: public, max-age=2592000');
    if ($ext === 'svg' || $ext === 'pdf') {
        // SVG/PDF can carry scripts: forbid script execution when served.
        header("Content-Security-Policy: default-src 'none'; style-src 'unsafe-inline'; img-src data:");
        header('Content-Disposition: inline; filename="' . $filename . '"');
    }

    readfile($path);
    exit;
}
