<?php
/**
 * U2I Process — admin dashboard API (session + CSRF protected).
 * The dashboard UI (React at /admin) consumes these endpoints.
 */

declare(strict_types=1);
require_once __DIR__ . '/config.php';

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$action = $_GET['a'] ?? '';
$param = $_GET['p'] ?? '';

// Public (pre-login) actions

/** True when no admin account exists yet (first-run setup mode). */
function admin_setup_needed(): bool
{
    try {
        return (int) db()->query('SELECT COUNT(*) AS c FROM admins')->fetch()['c'] === 0;
    } catch (PDOException $e) {
        // Table missing = fresh install → allow first-run setup.
        if (($e->getCode() ?? '') === '42S02') {
            return true;
        }
        return false; // DB unreachable: don't expose setup
    }
}

if ($action === 'setup_status' && $method === 'GET') {
    json_response(['ok' => true, 'setup' => admin_setup_needed()]);
}

if ($action === 'setup' && $method === 'POST') {
    if (!admin_setup_needed()) {
        json_response(['ok' => false, 'message' => "L'administrateur existe déjà."], 409);
    }
    $data = read_json_body();
    $username = field($data, 'username') ?: 'admin';
    $password = field($data, 'password');
    if (strlen($password) < 8) {
        json_response(['ok' => false, 'message' => 'Le mot de passe doit contenir au moins 8 caractères.'], 400);
    }
    try {
        // Self-healing: create the table if the schema predates it.
        db()->exec("CREATE TABLE IF NOT EXISTS admins (
            id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
            username VARCHAR(100) NOT NULL UNIQUE,
            password_hash VARCHAR(255) NOT NULL,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
        $stmt = db()->prepare('INSERT INTO admins (username, password_hash) VALUES (?, ?)');
        $stmt->execute([$username, password_hash($password, PASSWORD_DEFAULT)]);
        admin_login($username, $password);
        json_response(['ok' => true, 'csrf' => csrf_token()]);
    } catch (Throwable $e) {
        json_response(['ok' => false, 'message' => 'Erreur base de données : ' . $e->getMessage()], 500);
    }
}

if ($action === 'login' && $method === 'POST') {
    $data = read_json_body();
    $ok = admin_login(field($data, 'username'), field($data, 'password'));
    json_response($ok
        ? ['ok' => true, 'csrf' => csrf_token()]
        : ['ok' => false, 'message' => 'Identifiants incorrects.'], $ok ? 200 : 401);
}

if ($action === 'me' && $method === 'GET') {
    admin_session_start();
    if (empty($_SESSION['admin'])) {
        json_response(['ok' => false], 401);
    }
    json_response(['ok' => true, 'csrf' => csrf_token()]);
}

if ($action === 'logout' && $method === 'POST') {
    admin_logout();
    json_response(['ok' => true]);
}

// Everything below requires an authenticated admin + CSRF token.
require_admin();

function csrf_or_fail(): void
{
    $token = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';
    if (!is_string($token) || $token === '') {
        json_response(['ok' => false, 'message' => 'Invalid CSRF token.'], 403);
    }
    verify_csrf($token);
}

function slugify(string $text): string
{
    $text = mb_strtolower(trim($text));
    $text = iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $text) ?: $text;
    $text = preg_replace('~[^a-z0-9]+~', '-', $text) ?? '';
    $text = trim($text, '-');

    return $text !== '' ? $text : 'sans-titre';
}

function unique_slug(string $table, string $base, int $excludeId = 0): string
{
    $slug = $base;
    $i = 2;
    while (true) {
        $stmt = db()->prepare("SELECT COUNT(*) AS c FROM {$table} WHERE slug = ? AND id != ?");
        $stmt->execute([$slug, $excludeId]);
        if ((int) $stmt->fetch()['c'] === 0) {
            return $slug;
        }
        $slug = $base . '-' . $i++;
    }
}

function fetch_page(int $id): ?array
{
    $stmt = db()->prepare('SELECT * FROM pages WHERE id = ? LIMIT 1');
    $stmt->execute([$id]);
    $row = $stmt->fetch();

    return $row ?: null;
}

/** Map a raw pages row to the camelCase shape the dashboard expects. */
function map_page_row(array $row): array
{
    return [
        'id' => (int) $row['id'],
        'slug' => (string) $row['slug'],
        'title' => (string) $row['title'],
        'eyebrow' => $row['eyebrow'] ?? null,
        'heroTitle' => $row['hero_title'] ?? null,
        'heroText' => $row['hero_text'] ?? null,
        'heroImageUrl' => $row['hero_image_url'] ?? null,
        'navLabel' => $row['nav_label'] ?? null,
        'navOrder' => (int) ($row['nav_order'] ?? 0),
        'isPublished' => (bool) ($row['is_published'] ?? 0),
    ];
}

/** Map a raw articles row to the camelCase shape the dashboard expects. */
function map_article_row(array $row): array
{
    return [
        'id' => (int) $row['id'],
        'slug' => (string) $row['slug'],
        'title' => (string) $row['title'],
        'excerpt' => $row['excerpt'] ?? null,
        'body' => $row['body'] ?? null,
        'coverImageUrl' => $row['cover_image_url'] ?? null,
        'author' => $row['author'] ?? null,
        'isPublished' => (bool) ($row['is_published'] ?? 0),
        'publishedAt' => $row['published_at'] ?? null,
    ];
}

/** Map a raw page_blocks row (images_json decoded into images[]). */
function map_block_row(array $row): array
{
    $images = null;
    if (!empty($row['images_json'])) {
        $decoded = json_decode((string) $row['images_json'], true);
        if (is_array($decoded)) {
            $images = array_values(array_map('strval', $decoded));
        }
    }

    return [
        'type' => (string) $row['type'],
        'title' => $row['title'] ?? null,
        'body' => $row['body'] ?? null,
        'imageUrl' => $row['image_url'] ?? null,
        'images' => $images,
    ];
}

/** Replace the blocks of a page with the provided payload. */
function save_blocks(int $pageId, array $blocks): void
{
    db()->prepare('DELETE FROM page_blocks WHERE page_id = ?')->execute([$pageId]);
    $stmt = db()->prepare(
        'INSERT INTO page_blocks (page_id, type, sort_order, title, body, image_url, images_json)
         VALUES (?, ?, ?, ?, ?, ?, ?)'
    );
    $order = 0;
    foreach ($blocks as $block) {
        if (!is_array($block)) {
            continue;
        }
        $type = field($block, 'type');
        if (!in_array($type, ['heading', 'text', 'image', 'gallery', 'contact_info'], true)) {
            continue;
        }
        $images = $block['images'] ?? null;
        $stmt->execute([
            $pageId,
            $type,
            $order++,
            field($block, 'title') !== '' ? field($block, 'title') : null,
            field($block, 'body') !== '' ? field($block, 'body') : null,
            field($block, 'imageUrl') !== '' ? field($block, 'imageUrl') : null,
            is_array($images) ? json_encode(array_values(array_filter(array_map('strval', $images)))) : null,
        ]);
    }
}

function list_articles(): array
{
    $rows = db()->query('SELECT id, slug, title, excerpt, cover_image_url, author, is_published, published_at FROM articles ORDER BY COALESCE(published_at, created_at) DESC')->fetchAll();
    return $rows;
}

function fetch_article(int $id): ?array
{
    $stmt = db()->prepare('SELECT * FROM articles WHERE id = ? LIMIT 1');
    $stmt->execute([$id]);

    return $stmt->fetch() ?: null;
}

function save_article(array $data, ?int $id): array
{
    $title = field($data, 'title');
    if ($title === '') {
        json_response(['ok' => false, 'message' => 'Le titre est obligatoire.'], 400);
    }

    $slug = slugify(field($data, 'slug') !== '' ? field($data, 'slug') : $title);
    $slug = unique_slug('articles', $slug, $id ?? 0);
    $published = !empty($data['isPublished']);
    $publishedAt = field($data, 'publishedAt');

    // For updates the SQL keeps the original publish date unless the payload
    // provides an explicit one; publishing a draft without a date stamps NOW.
    $publishedParam = $publishedAt !== '' ? str_replace('T', ' ', $publishedAt) : null;

    if ($id === null) {
        $stmt = db()->prepare(
            'INSERT INTO articles (slug, title, excerpt, body, cover_image_url, author, is_published, published_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
        );
        $stmt->execute([
            $slug,
            $title,
            field($data, 'excerpt') ?: null,
            field($data, 'body') ?: null,
            field($data, 'coverImageUrl') ?: null,
            field($data, 'author') ?: null,
            $published ? 1 : 0,
            $publishedAt !== '' ? str_replace('T', ' ', $publishedAt) : ($published ? date('Y-m-d H:i:s') : null),
        ]);
        $id = (int) db()->lastInsertId();
    } else {
        $stmt = db()->prepare(
            'UPDATE articles SET slug = ?, title = ?, excerpt = ?, body = ?, cover_image_url = ?, author = ?, is_published = ?, published_at = COALESCE(?, IF(? = 1, COALESCE(published_at, NOW()), published_at)) WHERE id = ?'
        );
        $stmt->execute([
            $slug,
            $title,
            field($data, 'excerpt') ?: null,
            field($data, 'body') ?: null,
            field($data, 'coverImageUrl') ?: null,
            field($data, 'author') ?: null,
            $published ? 1 : 0,
            $publishedParam,
            $published ? 1 : 0,
            $id,
        ]);
    }

    return fetch_article((int) $id);
}

try {
    switch ($action) {
        // ── Settings ─────────────────────────────────────────────────────
        case 'settings':
            csrf_or_fail();
            if ($method === 'GET') {
                $row = db()->query('SELECT * FROM settings WHERE id = 1')->fetch();
                json_response(['ok' => true, 'settings' => $row ?: null]);
            }
            if ($method === 'PUT' || $method === 'POST') {
                $data = read_json_body();
                db()->prepare('UPDATE settings SET site_name = ?, contact_email = ?, contact_phone = ?, address = ?, footer_note = ? WHERE id = 1')
                    ->execute([
                        field($data, 'siteName') ?: 'U2I Process',
                        field($data, 'contactEmail'),
                        field($data, 'contactPhone'),
                        field($data, 'address') ?: null,
                        field($data, 'footerNote') ?: null,
                    ]);
                json_response(['ok' => true]);
            }
            json_response(['ok' => false, 'message' => 'Method not allowed.'], 405);

        // ── Pages ────────────────────────────────────────────────────────
        case 'pages':
            csrf_or_fail();
            if ($method === 'GET') {
                $rows = db()->query('SELECT * FROM pages ORDER BY nav_order ASC, id ASC')->fetchAll();
                json_response(['ok' => true, 'items' => array_map('map_page_row', $rows)]);
            }
            if ($method === 'POST') {
                $data = read_json_body();
                $title = field($data, 'title');
                if ($title === '') {
                    json_response(['ok' => false, 'message' => 'Le titre est obligatoire.'], 400);
                }
                $slug = slugify(field($data, 'slug') !== '' ? field($data, 'slug') : $title);
                $stmt = db()->prepare(
                    'INSERT INTO pages (slug, title, eyebrow, hero_title, hero_text, hero_image_url, nav_label, nav_order, is_published)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
                );
                $stmt->execute([
                    $slug,
                    $title,
                    field($data, 'eyebrow') ?: null,
                    field($data, 'heroTitle') ?: null,
                    field($data, 'heroText') ?: null,
                    field($data, 'heroImageUrl') ?: null,
                    field($data, 'navLabel') ?: null,
                    // 0 = "not ordered yet": sort last (999) so a new page lands
                    // at the end of the menu and is included by the public nav.
                    (int) field($data, 'navOrder') ?: 999,
                    !empty($data['isPublished']) ? 1 : 0,
                ]);
                $pageId = (int) db()->lastInsertId();
                save_blocks($pageId, is_array($data['blocks'] ?? null) ? $data['blocks'] : []);
                $page = fetch_page($pageId);
                json_response(['ok' => true, 'page' => $page ? map_page_row($page) : null], 201);
            }
            json_response(['ok' => false, 'message' => 'Method not allowed.'], 405);

        case 'page':
            csrf_or_fail();
            $id = (int) $param;
            if ($id <= 0) {
                json_response(['ok' => false, 'message' => 'Missing id.'], 400);
            }
            if ($method === 'GET') {
                $page = fetch_page($id);
                if (!$page) {
                    json_response(['ok' => false, 'message' => 'Page introuvable.'], 404);
                }
                $blocks = db()->prepare('SELECT * FROM page_blocks WHERE page_id = ? ORDER BY sort_order ASC');
                $blocks->execute([$id]);
                json_response(['ok' => true, 'page' => map_page_row($page), 'blocks' => array_map('map_block_row', $blocks->fetchAll())]);
            }
            if ($method === 'PUT' || $method === 'POST') {
                $data = read_json_body();
                $title = field($data, 'title');
                if ($title === '') {
                    json_response(['ok' => false, 'message' => 'Le titre est obligatoire.'], 400);
                }
                $slug = slugify(field($data, 'slug') !== '' ? field($data, 'slug') : $title);
                $slug = unique_slug('pages', $slug, $id);
                db()->prepare(
                    'UPDATE pages SET slug = ?, title = ?, eyebrow = ?, hero_title = ?, hero_text = ?, hero_image_url = ?, nav_label = ?, nav_order = ?, is_published = ? WHERE id = ?'
                )->execute([
                    $slug,
                    $title,
                    field($data, 'eyebrow') ?: null,
                    field($data, 'heroTitle') ?: null,
                    field($data, 'heroText') ?: null,
                    field($data, 'heroImageUrl') ?: null,
                    field($data, 'navLabel') ?: null,
                    (int) field($data, 'navOrder') ?: 999,
                    !empty($data['isPublished']) ? 1 : 0,
                    $id,
                ]);
                save_blocks($id, is_array($data['blocks'] ?? null) ? $data['blocks'] : []);
                $page = fetch_page($id);
                json_response(['ok' => true, 'page' => $page ? map_page_row($page) : null]);
            }
            if ($method === 'DELETE') {
                db()->prepare('DELETE FROM pages WHERE id = ?')->execute([$id]);
                json_response(['ok' => true]);
            }
            json_response(['ok' => false, 'message' => 'Method not allowed.'], 405);

        // ── Articles ─────────────────────────────────────────────────────
        case 'articles':
            csrf_or_fail();
            if ($method === 'GET') {
                json_response(['ok' => true, 'items' => array_map('map_article_row', list_articles())]);
            }
            if ($method === 'POST') {
                json_response(['ok' => true, 'article' => map_article_row(save_article(read_json_body(), null) ?? [])], 201);
            }
            json_response(['ok' => false, 'message' => 'Method not allowed.'], 405);

        case 'article':
            csrf_or_fail();
            $id = (int) $param;
            if ($id <= 0) {
                json_response(['ok' => false, 'message' => 'Missing id.'], 400);
            }
            if ($method === 'GET') {
                $article = fetch_article($id);
                json_response($article ? ['ok' => true, 'article' => map_article_row($article)] : ['ok' => false, 'message' => 'Article introuvable.'], $article ? 200 : 404);
            }
            if ($method === 'PUT' || $method === 'POST') {
                json_response(['ok' => true, 'article' => map_article_row(save_article(read_json_body(), $id) ?? [])]);
            }
            if ($method === 'DELETE') {
                db()->prepare('DELETE FROM articles WHERE id = ?')->execute([$id]);
                json_response(['ok' => true]);
            }
            json_response(['ok' => false, 'message' => 'Method not allowed.'], 405);

        // ── Media ────────────────────────────────────────────────────────
        case 'media':
            csrf_or_fail();
            if ($method === 'GET') {
                $rows = db()->query('SELECT * FROM media ORDER BY created_at DESC')->fetchAll();
                json_response(['ok' => true, 'items' => $rows]);
            }
            if ($method === 'POST') {
                if (empty($_FILES['file'])) {
                    json_response(['ok' => false, 'message' => 'Aucun fichier reçu.'], 400);
                }
                $stored = store_uploaded_image($_FILES['file']);
                $stmt = db()->prepare('INSERT INTO media (url, original_name, width, height) VALUES (?, ?, ?, ?)');
                $stmt->execute([
                    $stored['url'],
                    (string) ($_FILES['file']['name'] ?? ''),
                    $stored['width'],
                    $stored['height'],
                ]);
                json_response(['ok' => true, 'media' => [
                    'id' => (int) db()->lastInsertId(),
                    'url' => $stored['url'],
                    'original_name' => (string) ($_FILES['file']['name'] ?? ''),
                    'width' => $stored['width'],
                    'height' => $stored['height'],
                ]], 201);
            }
            json_response(['ok' => false, 'message' => 'Method not allowed.'], 405);

        case 'media_delete':
            csrf_or_fail();
            if ($method !== 'DELETE') {
                json_response(['ok' => false, 'message' => 'Method not allowed.'], 405);
            }
            $id = (int) $param;
            $stmt = db()->prepare('SELECT url FROM media WHERE id = ?');
            $stmt->execute([$id]);
            $row = $stmt->fetch();
            if ($row) {
                $path = UPLOAD_DIR . '/' . basename((string) $row['url']);
                if (is_file($path)) {
                    @unlink($path);
                }
                db()->prepare('DELETE FROM media WHERE id = ?')->execute([$id]);
            }
            json_response(['ok' => true]);

        // ── Dashboard stats ──────────────────────────────────────────────
        case 'stats':
            csrf_or_fail();
            if ($method !== 'GET') {
                json_response(['ok' => false, 'message' => 'Method not allowed.'], 405);
            }
            json_response(['ok' => true, 'stats' => [
                'pages' => (int) db()->query('SELECT COUNT(*) AS c FROM pages')->fetch()['c'],
                'pagesPublished' => (int) db()->query('SELECT COUNT(*) AS c FROM pages WHERE is_published = 1')->fetch()['c'],
                'articles' => (int) db()->query('SELECT COUNT(*) AS c FROM articles')->fetch()['c'],
                'articlesPublished' => (int) db()->query('SELECT COUNT(*) AS c FROM articles WHERE is_published = 1')->fetch()['c'],
                'media' => (int) db()->query('SELECT COUNT(*) AS c FROM media')->fetch()['c'],
                'messages' => (int) db()->query('SELECT COUNT(*) AS c FROM contact_messages')->fetch()['c'],
                'messagesUnread' => (int) db()->query('SELECT COUNT(*) AS c FROM contact_messages WHERE is_read = 0')->fetch()['c'],
            ]]);

        // ── One-click publish / unpublish ────────────────────────────────
        case 'page_publish':
            csrf_or_fail();
            if ($method !== 'POST') {
                json_response(['ok' => false, 'message' => 'Method not allowed.'], 405);
            }
            $data = read_json_body();
            $published = !empty($data['published']) ? 1 : 0;
            db()->prepare('UPDATE pages SET is_published = ? WHERE id = ?')
                ->execute([$published, (int) $param]);
            json_response(['ok' => true]);

        case 'article_publish':
            csrf_or_fail();
            if ($method !== 'POST') {
                json_response(['ok' => false, 'message' => 'Method not allowed.'], 405);
            }
            $data = read_json_body();
            $published = !empty($data['published']);
            if ($published) {
                db()->prepare('UPDATE articles SET is_published = 1, published_at = COALESCE(published_at, NOW()) WHERE id = ?')
                    ->execute([(int) $param]);
            } else {
                db()->prepare('UPDATE articles SET is_published = 0 WHERE id = ?')
                    ->execute([(int) $param]);
            }
            json_response(['ok' => true]);

        // ── Reorder pages (menu order) ───────────────────────────────────
        case 'page_reorder':
            csrf_or_fail();
            if ($method !== 'POST') {
                json_response(['ok' => false, 'message' => 'Method not allowed.'], 405);
            }
            $data = read_json_body();
            $ids = isset($data['ids']) && is_array($data['ids']) ? array_map('intval', $data['ids']) : [];
            $stmt = db()->prepare('UPDATE pages SET nav_order = ? WHERE id = ?');
            foreach ($ids as $i => $id) {
                $stmt->execute([$i + 1, $id]);
            }
            json_response(['ok' => true]);

        // ── Account ──────────────────────────────────────────────────────
        case 'change_password':
            csrf_or_fail();
            if ($method !== 'POST') {
                json_response(['ok' => false, 'message' => 'Method not allowed.'], 405);
            }
            $data = read_json_body();
            $current = field($data, 'currentPassword');
            $new = field($data, 'newPassword');
            if (strlen($new) < 8) {
                json_response(['ok' => false, 'message' => 'Le nouveau mot de passe doit contenir au moins 8 caractères.'], 400);
            }

            admin_session_start();
            $username = U2I_ADMIN_USER;
            $hash = admin_password_hash_for($username);
            if ($hash === null || !password_verify($current, $hash)) {
                json_response(['ok' => false, 'message' => 'Mot de passe actuel incorrect.'], 400);
            }

            try {
                $stmt = db()->prepare('SELECT id FROM admins WHERE username = ? LIMIT 1');
                $stmt->execute([$username]);
                $row = $stmt->fetch();
                $newHash = password_hash($new, PASSWORD_DEFAULT);
                if ($row) {
                    db()->prepare('UPDATE admins SET password_hash = ? WHERE id = ?')
                        ->execute([$newHash, (int) $row['id']]);
                } else {
                    db()->prepare('INSERT INTO admins (username, password_hash) VALUES (?, ?)')
                        ->execute([$username, $newHash]);
                }
                json_response(['ok' => true]);
            } catch (Throwable $e) {
                json_response(['ok' => false, 'message' => 'Base de données indisponible : ' . $e->getMessage()], 500);
            }

        // ── Contact messages ─────────────────────────────────────────────
        case 'messages':
            csrf_or_fail();
            if ($method === 'GET') {
                $rows = db()->query('SELECT * FROM contact_messages ORDER BY created_at DESC LIMIT 500')->fetchAll();
                json_response(['ok' => true, 'items' => $rows]);
            }
            json_response(['ok' => false, 'message' => 'Method not allowed.'], 405);

        case 'message':
            csrf_or_fail();
            $id = (int) $param;
            if ($method === 'PATCH' || $method === 'POST') {
                db()->prepare('UPDATE contact_messages SET is_read = 1 WHERE id = ?')->execute([$id]);
                json_response(['ok' => true]);
            }
            if ($method === 'DELETE') {
                db()->prepare('DELETE FROM contact_messages WHERE id = ?')->execute([$id]);
                json_response(['ok' => true]);
            }
            json_response(['ok' => false, 'message' => 'Method not allowed.'], 405);

        default:
            json_response(['ok' => false, 'message' => 'Unknown action.'], 404);
    }
} catch (PDOException $e) {
    json_response(['ok' => false, 'message' => 'Erreur base de données : ' . $e->getMessage()], 500);
} catch (Throwable $e) {
    json_response(['ok' => false, 'message' => 'Erreur serveur : ' . $e->getMessage()], 500);
}
