<?php
/**
 * U2I Process — admin dashboard API (session + CSRF protected).
 * The dashboard UI (React at /admin) consumes these endpoints.
 *
 * Structure: ?a=<action>&p=<param>, JSON bodies, X-CSRF-Token header for all
 * mutating requests. v2 adds menus, categories, tags, content blocks (home
 * builder), revisions, activity log, media metadata, scheduling, duplicates.
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
    if (!rate_limit_ok('setup', 5, 3600)) {
        json_response(['ok' => false, 'message' => 'Trop de tentatives. Réessayez plus tard.'], 429);
    }
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
        error_log(sprintf('[u2i-admin] setup action=%s %s: %s', $action, get_class($e), $e->getMessage()));
        json_response(['ok' => false, 'message' => 'Erreur base de données : ' . $e->getMessage()], 500);
    }
}

if ($action === 'login' && $method === 'POST') {
    if (!rate_limit_ok('login', 10, 300)) {
        json_response(['ok' => false, 'message' => 'Trop de tentatives de connexion. Réessayez dans quelques minutes.'], 429);
    }
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
    json_response(['ok' => true, 'csrf' => csrf_token(), 'username' => (string) ($_SESSION['admin_username'] ?? U2I_ADMIN_USER)]);
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

/** Current admin username from the session (activity log actor). */
function current_actor(): string
{
    admin_session_start();

    return substr((string) ($_SESSION['admin_username'] ?? U2I_ADMIN_USER), 0, 120);
}

function log_activity(string $action, ?string $entityType = null, ?int $entityId = null, ?string $detail = null): void
{
    try {
        $stmt = db()->prepare('INSERT INTO activity_log (actor, action, entity_type, entity_id, detail) VALUES (?, ?, ?, ?, ?)');
        $stmt->execute([current_actor(), substr($action, 0, 60), $entityType, $entityId, $detail !== null ? substr($detail, 0, 500) : null]);
    } catch (Throwable $e) {
        // Logging must never break the actual operation.
    }
}

/** Prune old revisions, keeping only the newest N per entity. */
function prune_revisions(string $entityType, int $entityId, int $keep = 20): void
{
    try {
        db()->prepare(
            'DELETE FROM content_revisions
             WHERE entity_type = ? AND entity_id = ?
               AND id NOT IN (
                 SELECT id FROM (
                   SELECT id FROM content_revisions
                   WHERE entity_type = ? AND entity_id = ?
                   ORDER BY id DESC LIMIT ?
                 ) AS keep_rows
               )'
        )->execute([$entityType, $entityId, $entityType, $entityId, $keep]);
    } catch (Throwable $e) {
    }
}

/** Store a snapshot of a page (with blocks) before it is modified. */
function snapshot_page(int $pageId, string $author): void
{
    $page = db()->prepare('SELECT * FROM pages WHERE id = ?');
    $page->execute([$pageId]);
    $pageRow = $page->fetch();
    if (!$pageRow) {
        return;
    }
    $blocks = db()->prepare('SELECT type, sort_order, title, body, image_url, images_json, is_visible FROM page_blocks WHERE page_id = ? ORDER BY sort_order ASC');
    $blocks->execute([$pageId]);
    $snapshot = ['page' => $pageRow, 'blocks' => $blocks->fetchAll()];
    db()->prepare('INSERT INTO content_revisions (entity_type, entity_id, author, snapshot_json) VALUES (?, ?, ?, ?)')
        ->execute(['page', $pageId, $author, json_encode($snapshot, JSON_UNESCAPED_UNICODE)]);
    prune_revisions('page', $pageId);
}

/** Store a snapshot of an article before it is modified. */
function snapshot_article(int $articleId, string $author): void
{
    $stmt = db()->prepare('SELECT * FROM articles WHERE id = ?');
    $stmt->execute([$articleId]);
    $row = $stmt->fetch();
    if (!$row) {
        return;
    }
    $tags = db()->prepare('SELECT t.id FROM tags t JOIN article_tags at ON at.tag_id = t.id WHERE at.article_id = ?');
    $tags->execute([$articleId]);
    $snapshot = ['article' => $row, 'tagIds' => array_map('intval', $tags->fetchAll(PDO::FETCH_COLUMN))];
    db()->prepare('INSERT INTO content_revisions (entity_type, entity_id, author, snapshot_json) VALUES (?, ?, ?, ?)')
        ->execute(['article', $articleId, $author, json_encode($snapshot, JSON_UNESCAPED_UNICODE)]);
    prune_revisions('article', $articleId);
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
    $seo = null;
    if (!empty($row['seo_json'])) {
        $decoded = json_decode((string) $row['seo_json'], true);
        if (is_array($decoded)) {
            $seo = $decoded;
        }
    }

    return with_i18n_meta([
        'id' => (int) $row['id'],
        'slug' => (string) $row['slug'],
        'title' => (string) $row['title'],
        'eyebrow' => $row['eyebrow'] ?? null,
        'heroTitle' => $row['hero_title'] ?? null,
        'heroText' => $row['hero_text'] ?? null,
        'heroImageUrl' => $row['hero_image_url'] ?? null,
        'navLabel' => $row['nav_label'] ?? null,
        'navOrder' => (int) ($row['nav_order'] ?? 0),
        'parentId' => isset($row['parent_id']) && $row['parent_id'] !== null ? (int) $row['parent_id'] : null,
        'status' => (string) ($row['status'] ?? ($row['is_published'] ? 'published' : 'draft')),
        'isPublished' => (bool) ($row['is_published'] ?? 0),
        'publishedAt' => $row['published_at'] ?? null,
        'scheduledAt' => $row['scheduled_at'] ?? null,
        'seo' => $seo,
        'updatedAt' => $row['updated_at'] ?? null,
    ], $row, ['title', 'eyebrow', 'heroTitle', 'heroText', 'navLabel']);
}

/** Map a raw articles row to the camelCase shape the dashboard expects. */
function map_article_row(array $row): array
{
    $seo = null;
    if (!empty($row['seo_json'])) {
        $decoded = json_decode((string) $row['seo_json'], true);
        if (is_array($decoded)) {
            $seo = $decoded;
        }
    }

    return with_i18n_meta([
        'id' => (int) $row['id'],
        'slug' => (string) $row['slug'],
        'title' => (string) $row['title'],
        'excerpt' => $row['excerpt'] ?? null,
        'body' => $row['body'] ?? null,
        'coverImageUrl' => $row['cover_image_url'] ?? null,
        'author' => $row['author'] ?? null,
        'categoryId' => isset($row['category_id']) && $row['category_id'] !== null ? (int) $row['category_id'] : null,
        'status' => (string) ($row['status'] ?? (($row['is_published'] ?? 0) ? 'published' : 'draft')),
        'isPublished' => (bool) ($row['is_published'] ?? 0),
        'publishedAt' => $row['published_at'] ?? null,
        'scheduledAt' => $row['scheduled_at'] ?? null,
        'seo' => $seo,
        'updatedAt' => $row['updated_at'] ?? null,
    ], $row, ['title', 'excerpt', 'body', 'author']);
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

    $mapped = [
        'type' => (string) $row['type'],
        'title' => $row['title'] ?? null,
        'body' => $row['body'] ?? null,
        'imageUrl' => $row['image_url'] ?? null,
        'images' => $images,
        'isVisible' => !isset($row['is_visible']) || (int) $row['is_visible'] === 1,
    ];

    return with_i18n_meta($mapped, $row, ['title', 'body']);
}

/** Replace the blocks of a page with the provided payload. */
function save_blocks(int $pageId, array $blocks): void
{
    db()->prepare('DELETE FROM page_blocks WHERE page_id = ?')->execute([$pageId]);
    $stmt = db()->prepare(
        'INSERT INTO page_blocks (page_id, type, sort_order, title, body, image_url, images_json, is_visible, i18n_json)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
    );
    $order = 0;
    foreach ($blocks as $block) {
        if (!is_array($block)) {
            continue;
        }
        $type = field($block, 'type');
        if (!in_array($type, ['heading', 'text', 'image', 'gallery', 'contact_info', 'button', 'quote', 'spacer', 'video', 'html'], true)) {
            continue;
        }
        $images = $block['images'] ?? null;
        // Each block carries its own English overlay: only title/body are
        // translatable, images and layout stay shared.
        $en = is_array($block['i18n']['en'] ?? null) ? $block['i18n']['en'] : [];
        $i18n = [];
        foreach (['title', 'body'] as $key) {
            $value = is_string($en[$key] ?? null) ? trim($en[$key]) : '';
            if ($value !== '') {
                $i18n[$key] = $value;
            }
        }
        $stmt->execute([
            $pageId,
            $type,
            $order++,
            field($block, 'title') !== '' ? field($block, 'title') : null,
            field($block, 'body') !== '' ? field($block, 'body') : null,
            field($block, 'imageUrl') !== '' ? field($block, 'imageUrl') : null,
            is_array($images) ? json_encode(array_values(array_filter(array_map('strval', $images)))) : null,
            array_key_exists('isVisible', $block) && !$block['isVisible'] ? 0 : 1,
            $i18n ? encode_i18n(['en' => $i18n]) : null,
        ]);
    }
}

/**
 * Normalize an `i18n` payload from the admin into the storage shape.
 * Only known languages and only non-empty strings survive.
 */
function sanitize_i18n_payload($raw, array $allowedKeys = []): ?string
{
    if (!is_array($raw)) {
        return null;
    }
    $out = [];
    foreach (U2I_LANGS as $lang) {
        if ($lang === U2I_SRC_LANG || !isset($raw[$lang]) || !is_array($raw[$lang])) {
            continue;
        }
        $fields = [];
        foreach ($raw[$lang] as $key => $value) {
            if ($allowedKeys && !in_array($key, $allowedKeys, true)) {
                continue;
            }
            if (is_string($value)) {
                $value = trim($value);
            } elseif (!is_array($value)) {
                continue;
            }
            if ($value === '' || $value === []) {
                continue;
            }
            $fields[$key] = $value;
        }
        if ($fields) {
            $out[$lang] = $fields;
        }
    }

    return $out ? encode_i18n($out) : '{}';
}

/** Attach translation coverage metadata to a mapped row (admin badges). */
function with_i18n_meta(array $mapped, array $row, array $fieldMap): array
{
    $i18n = decode_i18n(isset($row['i18n_json']) ? (string) $row['i18n_json'] : null);
    $mapped['i18n'] = $i18n;
    $mapped['isTranslated'] = i18n_is_translated($i18n);
    $mapped['missingTranslation'] = i18n_missing($i18n, $fieldMap);
    if (isset($row['slug_en'])) {
        $mapped['slugEn'] = $row['slug_en'] !== null && $row['slug_en'] !== '' ? (string) $row['slug_en'] : null;
    }

    return $mapped;
}

function list_articles(): array
{
    $rows = db()->query('SELECT id, slug, slug_en, i18n_json, title, excerpt, cover_image_url, author, category_id, status, is_published, published_at, scheduled_at, updated_at FROM articles ORDER BY COALESCE(published_at, created_at) DESC')->fetchAll();

    return $rows;
}

function fetch_article(int $id): ?array
{
    $stmt = db()->prepare('SELECT * FROM articles WHERE id = ? LIMIT 1');
    $stmt->execute([$id]);

    return $stmt->fetch() ?: null;
}

/** Decode a JSON column safely into an array (or null). */
function decode_json_col(?string $raw): ?array
{
    if ($raw === null || $raw === '') {
        return null;
    }
    $decoded = json_decode($raw, true);

    return is_array($decoded) ? $decoded : null;
}

function fetch_settings_row(): array
{
    $row = db()->query('SELECT * FROM settings WHERE id = 1')->fetch();

    return $row ?: [];
}

function save_settings_payload(array $data): void
{
    $jsonCols = [
        'headerJson' => 'header_json',
        'footerJson' => 'footer_json',
        'seoJson' => 'seo_json',
        'socialJson' => 'social_json',
        'homeJson' => 'home_json',
    ];
    $sets = ['site_name = ?', 'contact_email = ?', 'contact_phone = ?', 'address = ?', 'footer_note = ?'];
    $values = [
        field($data, 'siteName') ?: 'U2I Process',
        field($data, 'contactEmail'),
        field($data, 'contactPhone'),
        field($data, 'address') ?: null,
        field($data, 'footerNote') ?: null,
    ];
    foreach ($jsonCols as $key => $col) {
        if (array_key_exists($key, $data)) {
            $raw = $data[$key];
            $sets[] = "{$col} = ?";
            $values[] = is_array($raw) ? json_encode($raw, JSON_UNESCAPED_UNICODE) : (is_string($raw) && $raw !== '' ? $raw : null);
        }
    }
    // NOTE: no extra bound value here — the WHERE id = 1 below is a literal.
    // A stray "$values[] = 1;" used to sit here and triggered
    // SQLSTATE[HY093] (Invalid parameter number) on every settings save.
    db()->prepare('UPDATE settings SET ' . implode(', ', $sets) . ' WHERE id = 1')->execute($values);
}

/** Map a content_blocks row for the dashboard/homepage renderer. */
function map_home_block(array $row): array
{
    return [
        'id' => (int) $row['id'],
        'type' => (string) $row['type'],
        'title' => $row['title'] ?? null,
        'subtitle' => $row['subtitle'] ?? null,
        'body' => $row['body'] ?? null,
        'imageUrl' => $row['image_url'] ?? null,
        'config' => decode_json_col($row['config_json'] ?? null),
        'sortOrder' => (int) $row['sort_order'],
        'isVisible' => (bool) $row['is_visible'],
    ];
}

/** Replace all homepage blocks (full replace on save). */
function save_home_blocks(array $blocks): void
{
    db()->exec('DELETE FROM content_blocks');
    $stmt = db()->prepare(
        'INSERT INTO content_blocks (type, title, subtitle, body, image_url, config_json, sort_order, is_visible)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    );
    $order = 0;
    foreach ($blocks as $block) {
        if (!is_array($block)) {
            continue;
        }
        $type = field($block, 'type');
        if (!in_array($type, ['hero','about','services','stats','features','projects','testimonials','team','articles','gallery','cta','contact','faq','html'], true)) {
            continue;
        }
        $config = $block['config'] ?? null;
        $stmt->execute([
            $type,
            field($block, 'title') ?: null,
            field($block, 'subtitle') ?: null,
            field($block, 'body') ?: null,
            field($block, 'imageUrl') ?: null,
            is_array($config) ? json_encode($config, JSON_UNESCAPED_UNICODE) : null,
            $order++,
            !empty($block['isVisible']) ? 1 : 0,
        ]);
    }
}

/** Map a site_references row for the dashboard. */
function map_reference(array $row): array
{
    $i18n = decode_i18n(isset($row['i18n_json']) ? (string) $row['i18n_json'] : null);

    return [
        'id' => (int) $row['id'],
        // A kind the enum did not know about (or a row saved before the table
        // was migrated) must not reach the editor: the <select> has no matching
        // option, so React renders an empty value and the row is then dropped
        // on the next save. Falling back to 'partner' keeps it editable.
        'kind' => in_array((string) $row['kind'], U2I_REFERENCE_KINDS, true) ? (string) $row['kind'] : 'partner',
        'title' => (string) $row['title'],
        'imageUrl' => $row['image_url'] ?? null,
        'websiteUrl' => $row['website_url'] ?? null,
        'sortOrder' => (int) $row['sort_order'],
        'isVisible' => (bool) $row['is_visible'],
        'i18n' => $i18n,
    ];
}

/**
 * Replace the whole references list from the dashboard payload.
 *
 * Same delete-then-insert shape as the homepage blocks: the editor always
 * submits the complete ordered list, so there is nothing to merge and no way
 * for a stale row to survive a delete performed in the UI.
 *
 * Wrapped in a transaction. Without it, one rejected row (a title longer than
 * the column, a kind the ENUM still rejects, a duplicate key) threw AFTER the
 * DELETE had already been committed, so the save reported a failure and left
 * the table empty — every client, partner and certification logo gone from the
 * site with no way back. Now the whole replacement either lands or does not.
 *
 * The kinds are grouped client → partner → certification before writing so the
 * stored sort_order matches the order the public pages and the editor both use;
 * the dashboard used to receive them in plain alphabetical order, which put
 * certifications first.
 */
function save_references(array $items): void
{
    if (!ensure_reference_schema()) {
        throw new RuntimeException(
            'Table site_references inaccessible. Re-run /api/install.php on the server, '
            . 'or check the MySQL user has CREATE/ALTER rights on the database.'
        );
    }

    $prepared = [];
    foreach ($items as $item) {
        if (!is_array($item)) {
            continue;
        }
        // An unknown kind is coerced rather than skipped: the row is real
        // content the admin added, and dropping it here is how logos
        // disappeared from the list without any error being shown.
        $kind = field($item, 'kind');
        if (!in_array($kind, U2I_REFERENCE_KINDS, true)) {
            $kind = 'partner';
        }
        $title = field($item, 'title');
        if ($title === '') {
            continue;
        }
        $i18n = $item['i18n'] ?? null;
        $prepared[] = [
            'kind' => $kind,
            'title' => $title,
            'image_url' => field($item, 'imageUrl') ?: null,
            'website_url' => field($item, 'websiteUrl') ?: null,
            'is_visible' => !empty($item['isVisible']) ? 1 : 0,
            'i18n_json' => is_array($i18n) ? encode_i18n($i18n) : '{}',
        ];
    }

    // The same certificate entered twice (once clean, once with the page
    // counter a scrape appended) would be written back as two entries and show
    // as two again. Collapsing here as well as on read means a dashboard tab
    // left open across the fix cannot reintroduce the duplicates.
    $prepared = array_values(dedupe_reference_rows($prepared));

    usort(
        $prepared,
        static fn (array $a, array $b): int => array_search($a['kind'], U2I_REFERENCE_KINDS, true)
            <=> array_search($b['kind'], U2I_REFERENCE_KINDS, true)
    );

    $pdo = db();
    $pdo->beginTransaction();
    try {
        $pdo->exec('DELETE FROM site_references');
        $stmt = $pdo->prepare(
            'INSERT INTO site_references (kind, title, image_url, website_url, sort_order, is_visible, i18n_json)
             VALUES (?, ?, ?, ?, ?, ?, ?)'
        );
        foreach ($prepared as $order => $row) {
            $stmt->execute([
                $row['kind'],
                $row['title'],
                $row['image_url'],
                $row['website_url'],
                $order,
                (int) $row['is_visible'],
                $row['i18n_json'],
            ]);
        }
        $pdo->commit();
    } catch (Throwable $e) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        throw $e;
    }
}

/** Sync article_tags for an article. */
function sync_article_tags(int $articleId, array $tagIds): void
{
    db()->prepare('DELETE FROM article_tags WHERE article_id = ?')->execute([$articleId]);
    $stmt = db()->prepare('INSERT IGNORE INTO article_tags (article_id, tag_id) VALUES (?, ?)');
    foreach ($tagIds as $tagId) {
        if (is_numeric($tagId) && (int) $tagId > 0) {
            $stmt->execute([$articleId, (int) $tagId]);
        }
    }
}

function fetch_article_tag_ids(int $articleId): array
{
    $stmt = db()->prepare('SELECT tag_id FROM article_tags WHERE article_id = ?');
    $stmt->execute([$articleId]);

    return array_map('intval', $stmt->fetchAll(PDO::FETCH_COLUMN));
}

/** Derive status ↔ is_published ↔ dates from the incoming payload. */
function derive_status(array $data, string $currentStatus = 'draft'): array
{
    $status = field($data, 'status');
    $valid = ['draft', 'pending', 'scheduled', 'published', 'archived'];
    if ($status !== '' && in_array($status, $valid, true)) {
        $status = $status;
    } elseif (array_key_exists('isPublished', $data)) {
        // Back-compat: isPublished=true maps to published, false to draft.
        $status = !empty($data['isPublished']) ? 'published' : 'draft';
    } else {
        $status = $currentStatus;
    }

    $scheduledAt = field($data, 'scheduledAt');
    if ($status === 'scheduled' && $scheduledAt === '') {
        json_response(['ok' => false, 'message' => 'Une date de programmation est requise.'], 400);
    }

    return [$status, $scheduledAt !== '' ? str_replace('T', ' ', $scheduledAt) : null];
}

try {
    switch ($action) {
        // ── Settings (incl. header/footer/SEO/social/home JSON) ──────────
        case 'settings':
            csrf_or_fail();
            if ($method === 'GET') {
                $row = fetch_settings_row();
                // Decode JSON columns so the dashboard receives objects, not
                // raw strings (the public cms.php already does the same).
                if ($row) {
                    foreach (['header_json', 'footer_json', 'seo_json', 'social_json', 'home_json'] as $col) {
                        $row[$col] = decode_json_col($row[$col] ?? null);
                    }
                }
                json_response(['ok' => true, 'settings' => $row ?: null]);
            }
            if ($method === 'PUT' || $method === 'POST') {
                save_settings_payload(read_json_body());
                log_activity('settings.update', 'settings', 1);
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
                $slug = unique_slug('pages', $slug);
                $stmt = db()->prepare(
                    'INSERT INTO pages (slug, title, eyebrow, hero_title, hero_text, hero_image_url, nav_label, nav_order, parent_id, status, is_published, published_at, scheduled_at, seo_json, updated_by)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
                );
                [$status, $scheduledAt] = derive_status($data);
                $publishedAt = $status === 'published' ? date('Y-m-d H:i:s') : null;
                $seo = isset($data['seo']) && is_array($data['seo']) ? json_encode($data['seo'], JSON_UNESCAPED_UNICODE) : null;
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
                    int_field($data, 'parentId') ?: null,
                    $status,
                    $status === 'published' ? 1 : 0,
                    $publishedAt,
                    $scheduledAt,
                    $seo,
                    current_actor(),
                ]);
                $pageId = (int) db()->lastInsertId();
                save_blocks($pageId, is_array($data['blocks'] ?? null) ? $data['blocks'] : []);
                log_activity('page.create', 'page', $pageId, $title);
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
                $page = fetch_page($id);
                if (!$page) {
                    json_response(['ok' => false, 'message' => 'Page introuvable.'], 404);
                }
                snapshot_page($id, current_actor());
                $data = read_json_body();
                $title = field($data, 'title');
                if ($title === '') {
                    json_response(['ok' => false, 'message' => 'Le titre est obligatoire.'], 400);
                }
                $slug = slugify(field($data, 'slug') !== '' ? field($data, 'slug') : $title);
                $slug = unique_slug('pages', $slug, $id);
                // English slug is optional: blank keeps the French one working
                // under /en so an untranslated page never 404s.
                $slugEnRaw = field($data, 'slugEn');
                $slugEn = $slugEnRaw !== '' ? unique_slug('pages', slugify($slugEnRaw), $id, 'slug_en') : null;
                [$status, $scheduledAt] = derive_status($data, (string) ($page['status'] ?? 'draft'));
                $publishedAt = $page['published_at'] ?? null;
                if ($status === 'published' && $publishedAt === null) {
                    $publishedAt = date('Y-m-d H:i:s');
                } elseif ($status !== 'published') {
                    $publishedAt = null;
                }
                $seo = isset($data['seo']) && is_array($data['seo']) ? json_encode($data['seo'], JSON_UNESCAPED_UNICODE) : null;
                $i18n = sanitize_i18n_payload(
                    $data['i18n'] ?? null,
                    ['title', 'eyebrow', 'heroTitle', 'heroText', 'navLabel']
                );
                db()->prepare(
                    'UPDATE pages SET slug = ?, slug_en = ?, title = ?, eyebrow = ?, hero_title = ?, hero_text = ?, hero_image_url = ?, nav_label = ?, nav_order = ?, parent_id = ?, status = ?, is_published = ?, published_at = ?, scheduled_at = ?, seo_json = COALESCE(?, seo_json), i18n_json = ?, updated_by = ? WHERE id = ?'
                )->execute([
                    $slug,
                    $slugEn,
                    $title,
                    field($data, 'eyebrow') ?: null,
                    field($data, 'heroTitle') ?: null,
                    field($data, 'heroText') ?: null,
                    field($data, 'heroImageUrl') ?: null,
                    field($data, 'navLabel') ?: null,
                    (int) field($data, 'navOrder') ?: 999,
                    int_field($data, 'parentId') ?: null,
                    $status,
                    $status === 'published' ? 1 : 0,
                    $publishedAt,
                    $scheduledAt,
                    $seo,
                    $i18n,
                    current_actor(),
                    $id,
                ]);
                save_blocks($id, is_array($data['blocks'] ?? null) ? $data['blocks'] : []);
                log_activity('page.update', 'page', $id, $title);
                $page = fetch_page($id);
                json_response(['ok' => true, 'page' => $page ? map_page_row($page) : null]);
            }
            if ($method === 'DELETE') {
                snapshot_page($id, current_actor());
                db()->prepare('DELETE FROM pages WHERE id = ?')->execute([$id]);
                log_activity('page.delete', 'page', $id);
                json_response(['ok' => true]);
            }
            json_response(['ok' => false, 'message' => 'Method not allowed.'], 405);

        // ── Duplicate a page (with blocks) ───────────────────────────────
        case 'page_duplicate':
            csrf_or_fail();
            if ($method !== 'POST') {
                json_response(['ok' => false, 'message' => 'Method not allowed.'], 405);
            }
            $id = (int) $param;
            $page = fetch_page($id);
            if (!$page) {
                json_response(['ok' => false, 'message' => 'Page introuvable.'], 404);
            }
            $slug = unique_slug('pages', slugify($page['slug'] . '-copie'));
            $stmt = db()->prepare(
                'INSERT INTO pages (slug, title, eyebrow, hero_title, hero_text, hero_image_url, nav_label, nav_order, status, is_published, updated_by)
                 VALUES (?, ?, ?, ?, ?, ?, NULL, 999, \'draft\', 0, ?)'
            );
            $stmt->execute([
                $slug,
                $page['title'] . ' (copie)',
                $page['eyebrow'],
                $page['hero_title'],
                $page['hero_text'],
                $page['hero_image_url'],
                current_actor(),
            ]);
            $newId = (int) db()->lastInsertId();
            db()->prepare('INSERT INTO page_blocks (page_id, type, sort_order, title, body, image_url, images_json, is_visible)
                           SELECT ?, type, sort_order, title, body, image_url, images_json, is_visible FROM page_blocks WHERE page_id = ?')
                ->execute([$newId, $id]);
            log_activity('page.duplicate', 'page', $newId, $page['title']);
            json_response(['ok' => true, 'page' => map_page_row(fetch_page($newId) ?? [])], 201);

        // ── Articles ─────────────────────────────────────────────────────
        case 'articles':
            csrf_or_fail();
            if ($method === 'GET') {
                json_response(['ok' => true, 'items' => array_map('map_article_row', list_articles())]);
            }
            if ($method === 'POST') {
                $data = read_json_body();
                $title = field($data, 'title');
                if ($title === '') {
                    json_response(['ok' => false, 'message' => 'Le titre est obligatoire.'], 400);
                }
                $slug = slugify(field($data, 'slug') !== '' ? field($data, 'slug') : $title);
                $slug = unique_slug('articles', $slug);
                [$status, $scheduledAt] = derive_status($data);
                $publishedAt = $status === 'published' ? date('Y-m-d H:i:s') : null;
                $seo = isset($data['seo']) && is_array($data['seo']) ? json_encode($data['seo'], JSON_UNESCAPED_UNICODE) : null;
                $stmt = db()->prepare(
                    'INSERT INTO articles (slug, title, excerpt, body, cover_image_url, author, category_id, status, is_published, published_at, scheduled_at, seo_json, updated_by)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
                );
                $stmt->execute([
                    $slug,
                    $title,
                    field($data, 'excerpt') ?: null,
                    field($data, 'body') ?: null,
                    field($data, 'coverImageUrl') ?: null,
                    field($data, 'author') ?: null,
                    int_field($data, 'categoryId') ?: null,
                    $status,
                    $status === 'published' ? 1 : 0,
                    $publishedAt,
                    $scheduledAt,
                    $seo,
                    current_actor(),
                ]);
                $articleId = (int) db()->lastInsertId();
                sync_article_tags($articleId, is_array($data['tagIds'] ?? null) ? $data['tagIds'] : []);
                log_activity('article.create', 'article', $articleId, $title);
                json_response(['ok' => true, 'article' => map_article_row(fetch_article($articleId) ?? [])], 201);
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
                if (!$article) {
                    json_response(['ok' => false, 'message' => 'Article introuvable.'], 404);
                }
                $payload = map_article_row($article);
                $payload['tagIds'] = fetch_article_tag_ids($id);
                json_response(['ok' => true, 'article' => $payload]);
            }
            if ($method === 'PUT' || $method === 'POST') {
                $article = fetch_article($id);
                if (!$article) {
                    json_response(['ok' => false, 'message' => 'Article introuvable.'], 404);
                }
                snapshot_article($id, current_actor());
                $data = read_json_body();
                $title = field($data, 'title');
                if ($title === '') {
                    json_response(['ok' => false, 'message' => 'Le titre est obligatoire.'], 400);
                }
                $slug = slugify(field($data, 'slug') !== '' ? field($data, 'slug') : $title);
                $slug = unique_slug('articles', $slug, $id);
                $slugEnRaw = field($data, 'slugEn');
                $slugEn = $slugEnRaw !== '' ? unique_slug('articles', slugify($slugEnRaw), $id, 'slug_en') : null;
                [$status, $scheduledAt] = derive_status($data, (string) ($article['status'] ?? 'draft'));
                $publishedAt = $article['published_at'] ?? null;
                if ($status === 'published' && $publishedAt === null) {
                    $publishedAt = date('Y-m-d H:i:s');
                } elseif ($status !== 'published') {
                    $publishedAt = null;
                }
                $seo = isset($data['seo']) && is_array($data['seo']) ? json_encode($data['seo'], JSON_UNESCAPED_UNICODE) : null;
                $i18n = sanitize_i18n_payload(
                    $data['i18n'] ?? null,
                    ['title', 'excerpt', 'body', 'author']
                );
                db()->prepare(
                    'UPDATE articles SET slug = ?, slug_en = ?, title = ?, excerpt = ?, body = ?, cover_image_url = ?, author = ?, category_id = ?, status = ?, is_published = ?, published_at = ?, scheduled_at = ?, seo_json = COALESCE(?, seo_json), i18n_json = ?, updated_by = ? WHERE id = ?'
                )->execute([
                    $slug,
                    $slugEn,
                    $title,
                    field($data, 'excerpt') ?: null,
                    field($data, 'body') ?: null,
                    field($data, 'coverImageUrl') ?: null,
                    field($data, 'author') ?: null,
                    int_field($data, 'categoryId') ?: null,
                    $status,
                    $status === 'published' ? 1 : 0,
                    $publishedAt,
                    $scheduledAt,
                    $seo,
                    $i18n,
                    current_actor(),
                    $id,
                ]);
                if (array_key_exists('tagIds', $data) && is_array($data['tagIds'])) {
                    sync_article_tags($id, $data['tagIds']);
                }
                log_activity('article.update', 'article', $id, $title);
                $payload = map_article_row(fetch_article($id) ?? []);
                $payload['tagIds'] = fetch_article_tag_ids($id);
                json_response(['ok' => true, 'article' => $payload]);
            }
            if ($method === 'DELETE') {
                snapshot_article($id, current_actor());
                db()->prepare('DELETE FROM articles WHERE id = ?')->execute([$id]);
                log_activity('article.delete', 'article', $id);
                json_response(['ok' => true]);
            }
            json_response(['ok' => false, 'message' => 'Method not allowed.'], 405);

        // ── Duplicate an article ─────────────────────────────────────────
        case 'article_duplicate':
            csrf_or_fail();
            if ($method !== 'POST') {
                json_response(['ok' => false, 'message' => 'Method not allowed.'], 405);
            }
            $id = (int) $param;
            $article = fetch_article($id);
            if (!$article) {
                json_response(['ok' => false, 'message' => 'Article introuvable.'], 404);
            }
            $slug = unique_slug('articles', slugify($article['slug'] . '-copie'));
            $stmt = db()->prepare(
                "INSERT INTO articles (slug, title, excerpt, body, cover_image_url, author, category_id, status, is_published, updated_by)
                 SELECT ?, ?, excerpt, body, cover_image_url, author, category_id, 'draft', 0, ? FROM articles WHERE id = ?"
            );
            $stmt->execute([$slug, $article['title'] . ' (copie)', current_actor(), $id]);
            $newId = (int) db()->lastInsertId();
            db()->prepare('INSERT INTO article_tags (article_id, tag_id) SELECT ?, tag_id FROM article_tags WHERE article_id = ?')
                ->execute([$newId, $id]);
            log_activity('article.duplicate', 'article', $newId, $article['title']);
            json_response(['ok' => true, 'article' => map_article_row(fetch_article($newId) ?? [])], 201);

        // ── Media ────────────────────────────────────────────────────────
        case 'media':
            csrf_or_fail();
            if ($method === 'GET') {
                $rows = db()->query('SELECT * FROM media ORDER BY created_at DESC, id DESC')->fetchAll();
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
                // Capture the id BEFORE log_activity() inserts another row
                // (lastInsertId() would otherwise return the activity row id).
                $mediaId = (int) db()->lastInsertId();
                log_activity('media.upload', 'media', $mediaId, (string) ($_FILES['file']['name'] ?? ''));
                json_response(['ok' => true, 'media' => [
                    'id' => $mediaId,
                    'url' => $stored['url'],
                    'original_name' => (string) ($_FILES['file']['name'] ?? ''),
                    'width' => $stored['width'],
                    'height' => $stored['height'],
                ]], 201);
            }
            json_response(['ok' => false, 'message' => 'Method not allowed.'], 405);

        case 'media_meta':
            csrf_or_fail();
            if ($method !== 'PUT' && $method !== 'POST') {
                json_response(['ok' => false, 'message' => 'Method not allowed.'], 405);
            }
            $id = (int) $param;
            $data = read_json_body();
            db()->prepare('UPDATE media SET title = COALESCE(?, title), alt_text = COALESCE(?, alt_text), caption = COALESCE(?, caption), description = COALESCE(?, description) WHERE id = ?')
                ->execute([
                    field($data, 'title') ?: null,
                    field($data, 'altText') ?: null,
                    field($data, 'caption') ?: null,
                    field($data, 'description') ?: null,
                    $id,
                ]);
            json_response(['ok' => true]);

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
                // Prevent breaking pages/articles that still reference the file.
                $url = (string) $row['url'];
                try {
                    // Distinct named placeholders per subquery: native prepares
                    // (emulation off) cannot reuse one named param twice.
                    $usage = db()->prepare(
                        "SELECT (SELECT COUNT(*) FROM pages WHERE hero_image_url = :u1)"
                        . " + (SELECT COUNT(*) FROM articles WHERE cover_image_url = :u2)"
                        . " + (SELECT COUNT(*) FROM page_blocks WHERE image_url = :u3"
                        . " OR images_json LIKE CONCAT('%', :u4, '%')) AS c"
                    );
                    $usage->execute(['u1' => $url, 'u2' => $url, 'u3' => $url, 'u4' => $url]);
                    if ((int) ($usage->fetch()['c'] ?? 0) > 0) {
                        json_response([
                            'ok' => false,
                            'message' => 'Image encore utilisée par une page ou un article. Remplacez-la d\'abord dans ce contenu, puis supprimez-la ici.',
                        ], 409);
                    }
                } catch (Throwable $e) {
                    // Never block deletion on a lookup failure — but log it so
                    // the guard cannot silently disappear again.
                    error_log('[u2i-admin] media usage lookup failed: ' . $e->getMessage());
                }
                $path = UPLOAD_DIR . '/' . basename($url);
                if (is_file($path)) {
                    @unlink($path);
                }
                db()->prepare('DELETE FROM media WHERE id = ?')->execute([$id]);
                log_activity('media.delete', 'media', $id);
            }
            json_response(['ok' => true]);

        // ── Menus ────────────────────────────────────────────────────────
        case 'menus':
            csrf_or_fail();
            if ($method === 'GET') {
                $menus = db()->query('SELECT * FROM menus ORDER BY id ASC')->fetchAll();
                $itemsStmt = db()->prepare('SELECT * FROM menu_items WHERE menu_id = ? ORDER BY sort_order ASC, id ASC');
                $out = [];
                foreach ($menus as $menu) {
                    $itemsStmt->execute([(int) $menu['id']]);
                    // Raw rows carry snake_case columns and an i18n_json blob;
                    // the dashboard wants the same camelCase shape the public
                    // nav uses, with the overlay decoded so it can round-trip.
                    $items = [];
                    foreach ($itemsStmt->fetchAll() as $row) {
                        $row['i18n'] = decode_i18n(
                            isset($row['i18n_json']) ? (string) $row['i18n_json'] : null
                        );
                        $row['isEnabled'] = (bool) $row['is_enabled'];
                        $row['opensNewTab'] = (bool) $row['opens_new_tab'];
                        $row['parentId'] = $row['parent_id'] === null ? null : (int) $row['parent_id'];
                        $row['sortOrder'] = (int) $row['sort_order'];
                        $items[] = $row;
                    }
                    $out[] = [
                        'id' => (int) $menu['id'],
                        'location' => $menu['location'],
                        'label' => $menu['label'],
                        'items' => $items,
                    ];
                }
                json_response(['ok' => true, 'items' => $out]);
            }
            if ($method === 'POST') {
                $data = read_json_body();
                $location = slugify(field($data, 'location') ?: field($data, 'label'));
                $stmt = db()->prepare('SELECT id FROM menus WHERE location = ?');
                $stmt->execute([$location]);
                if ($stmt->fetch()) {
                    json_response(['ok' => false, 'message' => "Un menu existe déjà pour cet emplacement (« {$location} »)."], 409);
                }
                $stmt = db()->prepare('INSERT INTO menus (location, label) VALUES (?, ?)');
                $stmt->execute([$location, field($data, 'label') ?: $location]);
                $menuId = (int) db()->lastInsertId(); // before log_activity (see media)
                log_activity('menu.create', 'menu', $menuId, $location);
                json_response(['ok' => true, 'id' => $menuId], 201);
            }
            json_response(['ok' => false, 'message' => 'Method not allowed.'], 405);

        case 'menu':
            csrf_or_fail();
            $id = (int) $param;
            if ($method === 'DELETE') {
                db()->prepare('DELETE FROM menus WHERE id = ?')->execute([$id]);
                log_activity('menu.delete', 'menu', $id);
                json_response(['ok' => true]);
            }
            if ($method === 'PUT' || $method === 'POST') {
                $data = read_json_body();
                // Full replace of the item tree (simple + safe for small menus).
                db()->prepare('DELETE FROM menu_items WHERE menu_id = ?')->execute([$id]);
                $stmt = db()->prepare('INSERT INTO menu_items (menu_id, parent_id, label, url, sort_order, is_enabled, opens_new_tab, i18n_json) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
                $items = is_array($data['items'] ?? null) ? $data['items'] : [];
                $idMap = [];
                $order = 0;
                // Two passes: parents first, then children (one nesting level
                // deep, which is what dropdowns need).
                foreach ([0, 1] as $depth) {
                    foreach ($items as $item) {
                        if (!is_array($item)) {
                            continue;
                        }
                        // parentId may be a DB id (previous save) OR a client
                        // key like "b" — any non-empty value marks a child;
                        // resolution happens in the second pass below.
                        $rawParent = $item['parentId'] ?? null;
                        $isChild = $rawParent !== null && (string) $rawParent !== '';
                        if (($depth === 0) === $isChild) {
                            continue;
                        }
                        $parentDbId = null;
                        if ($isChild) {
                            $parentKey = (string) $rawParent;
                            $parentDbId = $idMap[$parentKey]
                                ?? $idMap[(string) (int) $parentKey]
                                ?? (ctype_digit($parentKey) && (int) $parentKey > 0 ? (int) $parentKey : null);
                            if ($parentDbId === null) {
                                continue;
                            }
                        }
                        // Per-item English label. Only the 'label' key is
                        // meaningful for a menu row (I18N_MENU_FIELDS maps
                        // exactly that), but the payload is stored as a full
                        // overlay so it matches every other translated entity.
                        $i18n = $item['i18n'] ?? null;
                        $stmt->execute([
                            $id,
                            $parentDbId,
                            field($item, 'label') ?: 'Sans titre',
                            field($item, 'url') !== '' ? field($item, 'url') : '/',
                            $order++,
                            !empty($item['isEnabled']) || !array_key_exists('isEnabled', $item) ? 1 : 0,
                            !empty($item['opensNewTab']) ? 1 : 0,
                            is_array($i18n) ? encode_i18n($i18n) : '{}',
                        ]);
                        $clientKey = (string) ($item['clientId'] ?? ('' . $order));
                        $idMap[$clientKey] = (int) db()->lastInsertId();
                    }
                }
                log_activity('menu.update', 'menu', $id);
                json_response(['ok' => true]);
            }
            json_response(['ok' => false, 'message' => 'Method not allowed.'], 405);

        // ── Categories ───────────────────────────────────────────────────
        case 'categories':
            csrf_or_fail();
            if ($method === 'GET') {
                $rows = db()->query(
                    'SELECT c.*, (SELECT COUNT(*) FROM articles a WHERE a.category_id = c.id) AS article_count
                     FROM categories c ORDER BY c.name ASC'
                )->fetchAll();
                json_response(['ok' => true, 'items' => $rows]);
            }
            if ($method === 'POST') {
                $data = read_json_body();
                $name = field($data, 'name');
                if ($name === '') {
                    json_response(['ok' => false, 'message' => 'Le nom est obligatoire.'], 400);
                }
                $slug = unique_slug('categories', slugify(field($data, 'slug') ?: $name));
                db()->prepare('INSERT INTO categories (slug, name, description) VALUES (?, ?, ?)')
                    ->execute([$slug, $name, field($data, 'description') ?: null]);
                $categoryId = (int) db()->lastInsertId(); // before log_activity (see media)
                log_activity('category.create', 'category', $categoryId, $name);
                json_response(['ok' => true, 'id' => $categoryId], 201);
            }
            json_response(['ok' => false, 'message' => 'Method not allowed.'], 405);

        case 'category':
            csrf_or_fail();
            $id = (int) $param;
            if ($method === 'PUT' || $method === 'POST') {
                $data = read_json_body();
                $name = field($data, 'name');
                if ($name === '') {
                    json_response(['ok' => false, 'message' => 'Le nom est obligatoire.'], 400);
                }
                $slug = unique_slug('categories', slugify(field($data, 'slug') ?: $name), $id);
                db()->prepare('UPDATE categories SET slug = ?, name = ?, description = ? WHERE id = ?')
                    ->execute([$slug, $name, field($data, 'description') ?: null, $id]);
                log_activity('category.update', 'category', $id, $name);
                json_response(['ok' => true]);
            }
            if ($method === 'DELETE') {
                db()->prepare('DELETE FROM categories WHERE id = ?')->execute([$id]);
                log_activity('category.delete', 'category', $id);
                json_response(['ok' => true]);
            }
            json_response(['ok' => false, 'message' => 'Method not allowed.'], 405);

        // ── Tags ─────────────────────────────────────────────────────────
        case 'tags':
            csrf_or_fail();
            if ($method === 'GET') {
                $rows = db()->query(
                    'SELECT t.*, (SELECT COUNT(*) FROM article_tags x WHERE x.tag_id = t.id) AS article_count
                     FROM tags t ORDER BY t.name ASC'
                )->fetchAll();
                json_response(['ok' => true, 'items' => $rows]);
            }
            if ($method === 'POST') {
                $data = read_json_body();
                $name = field($data, 'name');
                if ($name === '') {
                    json_response(['ok' => false, 'message' => 'Le nom est obligatoire.'], 400);
                }
                $slug = unique_slug('tags', slugify(field($data, 'slug') ?: $name));
                db()->prepare('INSERT INTO tags (slug, name) VALUES (?, ?)')
                    ->execute([$slug, $name]);
                $tagId = (int) db()->lastInsertId(); // before log_activity (see media)
                log_activity('tag.create', 'tag', $tagId, $name);
                json_response(['ok' => true, 'id' => $tagId], 201);
            }
            json_response(['ok' => false, 'message' => 'Method not allowed.'], 405);

        case 'tag':
            csrf_or_fail();
            $id = (int) $param;
            if ($method === 'PUT' || $method === 'POST') {
                $data = read_json_body();
                $name = field($data, 'name');
                if ($name === '') {
                    json_response(['ok' => false, 'message' => 'Le nom est obligatoire.'], 400);
                }
                $slug = unique_slug('tags', slugify(field($data, 'slug') ?: $name), $id);
                db()->prepare('UPDATE tags SET slug = ?, name = ? WHERE id = ?')
                    ->execute([$slug, $name, $id]);
                log_activity('tag.update', 'tag', $id, $name);
                json_response(['ok' => true]);
            }
            if ($method === 'DELETE') {
                db()->prepare('DELETE FROM tags WHERE id = ?')->execute([$id]);
                log_activity('tag.delete', 'tag', $id);
                json_response(['ok' => true]);
            }
            json_response(['ok' => false, 'message' => 'Method not allowed.'], 405);

        // ── Homepage builder blocks ──────────────────────────────────────
        case 'home_blocks':
            csrf_or_fail();
            if ($method === 'GET') {
                $rows = db()->query('SELECT * FROM content_blocks ORDER BY sort_order ASC, id ASC')->fetchAll();
                json_response(['ok' => true, 'items' => array_map('map_home_block', $rows)]);
            }
            if ($method === 'PUT' || $method === 'POST') {
                $data = read_json_body();
                save_home_blocks(is_array($data['blocks'] ?? null) ? $data['blocks'] : []);
                log_activity('home.update', 'home', 1);
                json_response(['ok' => true]);
            }
            json_response(['ok' => false, 'message' => 'Method not allowed.'], 405);

        // ── Client, partner & certification references ──────────────────
        case 'references':
            csrf_or_fail();
            if ($method === 'GET') {
                // Reconcile the table before reading it: a database created
                // before the references section existed would otherwise answer
                // "La liste est vide" instead of telling the admin to install.
                ensure_reference_schema();
                // Re-file rows stored under the wrong kind, so an admin who never
                // touches the import button still sees clients in the Clients
                // group instead of everything piled up under Partenaires.
                $refiled = repair_reference_kinds();
                // prepare(), not query(): PDO::query() takes no parameters, so
                // the U2I_REFERENCE_KINDS placeholders below would be passed as
                // a fetch mode and the call would fail.
                $stmt = db()->prepare(
                    'SELECT * FROM site_references ORDER BY FIELD(kind, ?, ?, ?), sort_order ASC, id ASC'
                );
                $stmt->execute(U2I_REFERENCE_KINDS);
                $rows = $stmt->fetchAll();
                // Same collapse the public page applies, so the editor shows the
                // list that is actually published instead of the raw rows.
                $collapsed = dedupe_reference_rows($rows);
                json_response([
                    'ok' => true,
                    'items' => array_map('map_reference', $collapsed),
                    'refiled' => $refiled,
                    'deduped' => count($rows) - count($collapsed),
                ]);
            }
            if ($method === 'PUT' || $method === 'POST') {
                $data = read_json_body();
                try {
                    save_references(is_array($data['items'] ?? null) ? $data['items'] : []);
                } catch (Throwable $e) {
                    error_log(sprintf('[u2i-admin] references save failed: %s', $e->getMessage()));
                    json_response([
                        'ok' => false,
                        'message' => 'Enregistrement impossible : ' . $e->getMessage()
                            . ' — la liste précédente a été conservée.',
                    ], 500);
                }
                log_activity('references.update', 'references', 1);
                json_response(['ok' => true]);
            }
            json_response(['ok' => false, 'message' => 'Method not allowed.'], 405);

        // ── Revisions ────────────────────────────────────────────────────
        case 'revisions':
            csrf_or_fail();
            if ($method !== 'GET') {
                json_response(['ok' => false, 'message' => 'Method not allowed.'], 405);
            }
            $type = field($_GET, 'type') ?: 'page';
            if (!in_array($type, ['page', 'article'], true)) {
                json_response(['ok' => false, 'message' => 'Unknown revision type.'], 400);
            }
            $entityId = (int) $param;
            $stmt = db()->prepare(
                'SELECT id, author, created_at FROM content_revisions WHERE entity_type = ? AND entity_id = ? ORDER BY id DESC LIMIT 50'
            );
            $stmt->execute([$type, $entityId]);
            json_response(['ok' => true, 'items' => $stmt->fetchAll()]);

        case 'revision':
            csrf_or_fail();
            $revId = (int) $param;
            if ($method === 'GET') {
                $stmt = db()->prepare('SELECT * FROM content_revisions WHERE id = ? LIMIT 1');
                $stmt->execute([$revId]);
                $rev = $stmt->fetch();
                if (!$rev) {
                    json_response(['ok' => false, 'message' => 'Révision introuvable.'], 404);
                }
                json_response(['ok' => true, 'revision' => [
                    'id' => (int) $rev['id'],
                    'entityType' => $rev['entity_type'],
                    'entityId' => (int) $rev['entity_id'],
                    'author' => $rev['author'],
                    'createdAt' => $rev['created_at'],
                    'snapshot' => decode_json_col($rev['snapshot_json']),
                ]]);
            }
            if ($method === 'POST') {
                // Restore: overwrite the live entity with the snapshot.
                $stmt = db()->prepare('SELECT * FROM content_revisions WHERE id = ? LIMIT 1');
                $stmt->execute([$revId]);
                $rev = $stmt->fetch();
                if (!$rev) {
                    json_response(['ok' => false, 'message' => 'Révision introuvable.'], 404);
                }
                $snapshot = decode_json_col($rev['snapshot_json']);
                if (!is_array($snapshot)) {
                    json_response(['ok' => false, 'message' => 'Snapshot invalide.'], 500);
                }
                if ($rev['entity_type'] === 'page') {
                    $pageData = $snapshot['page'] ?? null;
                    if (!is_array($pageData)) {
                        json_response(['ok' => false, 'message' => 'Snapshot invalide.'], 500);
                    }
                    snapshot_page((int) $rev['entity_id'], current_actor()); // snapshot current state first
                    db()->prepare(
                        'UPDATE pages SET slug = ?, title = ?, eyebrow = ?, hero_title = ?, hero_text = ?, hero_image_url = ?, nav_label = ?, nav_order = ? WHERE id = ?'
                    )->execute([
                        $pageData['slug'],
                        $pageData['title'],
                        $pageData['eyebrow'],
                        $pageData['hero_title'],
                        $pageData['hero_text'],
                        $pageData['hero_image_url'],
                        $pageData['nav_label'],
                        (int) $pageData['nav_order'],
                        (int) $rev['entity_id'],
                    ]);
                    if (isset($snapshot['blocks']) && is_array($snapshot['blocks'])) {
                        db()->prepare('DELETE FROM page_blocks WHERE page_id = ?')->execute([(int) $rev['entity_id']]);
                        $ins = db()->prepare('INSERT INTO page_blocks (page_id, type, sort_order, title, body, image_url, images_json, is_visible) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
                        $order = 0;
                        foreach ($snapshot['blocks'] as $b) {
                            if (!is_array($b)) {
                                continue;
                            }
                            $ins->execute([
                                (int) $rev['entity_id'],
                                (string) $b['type'],
                                $order++,
                                $b['title'],
                                $b['body'],
                                $b['image_url'],
                                $b['images_json'],
                                isset($b['is_visible']) ? (int) (bool) $b['is_visible'] : 1,
                            ]);
                        }
                    }
                    log_activity('page.restore', 'page', (int) $rev['entity_id'], 'révision #' . $revId);
                    json_response(['ok' => true]);
                } else {
                    $articleData = $snapshot['article'] ?? null;
                    if (!is_array($articleData)) {
                        json_response(['ok' => false, 'message' => 'Snapshot invalide.'], 500);
                    }
                    snapshot_article((int) $rev['entity_id'], current_actor());
                    db()->prepare(
                        'UPDATE articles SET slug = ?, title = ?, excerpt = ?, body = ?, cover_image_url = ?, author = ? WHERE id = ?'
                    )->execute([
                        $articleData['slug'],
                        $articleData['title'],
                        $articleData['excerpt'],
                        $articleData['body'],
                        $articleData['cover_image_url'],
                        $articleData['author'],
                        (int) $rev['entity_id'],
                    ]);
                    log_activity('article.restore', 'article', (int) $rev['entity_id'], 'révision #' . $revId);
                    json_response(['ok' => true]);
                }
            }
            json_response(['ok' => false, 'message' => 'Method not allowed.'], 405);

        // ── Activity log ─────────────────────────────────────────────────
        case 'activity':
            csrf_or_fail();
            if ($method !== 'GET') {
                json_response(['ok' => false, 'message' => 'Method not allowed.'], 405);
            }
            $rows = db()->query('SELECT * FROM activity_log ORDER BY id DESC LIMIT 100')->fetchAll();
            json_response(['ok' => true, 'items' => $rows]);

        // ── Translation coverage: what still needs an English version ────
        case 'i18n_coverage':
            csrf_or_fail();
            if ($method !== 'GET') {
                json_response(['ok' => false, 'message' => 'Method not allowed.'], 405);
            }
            $pageFields = ['title', 'eyebrow', 'heroTitle', 'heroText', 'navLabel'];
            $articleFields = ['title', 'excerpt', 'body', 'author'];
            $report = ['pages' => [], 'articles' => [], 'homeBlocks' => [], 'menus' => []];

            foreach (db()->query('SELECT id, slug, slug_en, i18n_json, title FROM pages ORDER BY title ASC')->fetchAll() as $row) {
                $missing = i18n_missing(decode_i18n((string) ($row['i18n_json'] ?? '')), $pageFields);
                $report['pages'][] = [
                    'id' => (int) $row['id'],
                    'title' => (string) $row['title'],
                    'slug' => (string) $row['slug'],
                    'slugEn' => $row['slug_en'] ?: null,
                    'isTranslated' => $missing !== $pageFields,
                    'missing' => $missing,
                ];
            }
            foreach (db()->query('SELECT id, slug, slug_en, i18n_json, title FROM articles ORDER BY COALESCE(published_at, created_at) DESC')->fetchAll() as $row) {
                $missing = i18n_missing(decode_i18n((string) ($row['i18n_json'] ?? '')), $articleFields);
                $report['articles'][] = [
                    'id' => (int) $row['id'],
                    'title' => (string) $row['title'],
                    'slug' => (string) $row['slug'],
                    'slugEn' => $row['slug_en'] ?: null,
                    'isTranslated' => $missing !== $articleFields,
                    'missing' => $missing,
                ];
            }
            foreach (db()->query('SELECT id, type, title, i18n_json FROM content_blocks ORDER BY sort_order ASC')->fetchAll() as $row) {
                $report['homeBlocks'][] = [
                    'id' => (int) $row['id'],
                    'type' => (string) $row['type'],
                    'title' => (string) ($row['title'] ?? ''),
                    'isTranslated' => i18n_is_translated(decode_i18n((string) ($row['i18n_json'] ?? ''))),
                ];
            }
            foreach (db()->query('SELECT id, label, i18n_json FROM menu_items ORDER BY sort_order ASC')->fetchAll() as $row) {
                $report['menus'][] = [
                    'id' => (int) $row['id'],
                    'label' => (string) $row['label'],
                    'isTranslated' => i18n_is_translated(decode_i18n((string) ($row['i18n_json'] ?? ''))),
                ];
            }
            json_response(['ok' => true, 'coverage' => $report, 'lang' => 'en']);

        // ── Dashboard stats ──────────────────────────────────────────────
        case 'stats':
            csrf_or_fail();
            if ($method !== 'GET') {
                json_response(['ok' => false, 'message' => 'Method not allowed.'], 405);
            }
            $stats = [
                'pages' => (int) db()->query('SELECT COUNT(*) AS c FROM pages')->fetch()['c'],
                'pagesPublished' => (int) db()->query("SELECT COUNT(*) AS c FROM pages WHERE status = 'published'")->fetch()['c'],
                'pagesDraft' => (int) db()->query("SELECT COUNT(*) AS c FROM pages WHERE status = 'draft'")->fetch()['c'],
                'pagesScheduled' => (int) db()->query("SELECT COUNT(*) AS c FROM pages WHERE status = 'scheduled'")->fetch()['c'],
                'articles' => (int) db()->query('SELECT COUNT(*) AS c FROM articles')->fetch()['c'],
                'articlesPublished' => (int) db()->query("SELECT COUNT(*) AS c FROM articles WHERE status = 'published'")->fetch()['c'],
                'articlesDraft' => (int) db()->query("SELECT COUNT(*) AS c FROM articles WHERE status = 'draft'")->fetch()['c'],
                'articlesScheduled' => (int) db()->query("SELECT COUNT(*) AS c FROM articles WHERE status = 'scheduled'")->fetch()['c'],
                'categories' => (int) db()->query('SELECT COUNT(*) AS c FROM categories')->fetch()['c'],
                'tags' => (int) db()->query('SELECT COUNT(*) AS c FROM tags')->fetch()['c'],
                'media' => (int) db()->query('SELECT COUNT(*) AS c FROM media')->fetch()['c'],
                'messages' => (int) db()->query('SELECT COUNT(*) AS c FROM contact_messages')->fetch()['c'],
                'messagesUnread' => (int) db()->query('SELECT COUNT(*) AS c FROM contact_messages WHERE is_read = 0')->fetch()['c'],
            ];
            // Untranslated-content counters drive the dashboard warning badge.
            $stats['pagesUntranslated'] = (int) db()->query('SELECT COUNT(*) AS c FROM pages')->fetch()['c'] - (int) db()->query("SELECT COUNT(*) AS c FROM pages WHERE i18n_json IS NOT NULL AND i18n_json NOT IN ('{}', '[]')")->fetch()['c'];
            $stats['articlesUntranslated'] = (int) db()->query('SELECT COUNT(*) AS c FROM articles')->fetch()['c'] - (int) db()->query("SELECT COUNT(*) AS c FROM articles WHERE i18n_json IS NOT NULL AND i18n_json NOT IN ('{}', '[]')")->fetch()['c'];
            json_response(['ok' => true, 'stats' => $stats]);

        // ── Latest content (dashboard lists) ─────────────────────────────
        case 'recent':
            csrf_or_fail();
            if ($method !== 'GET') {
                json_response(['ok' => false, 'message' => 'Method not allowed.'], 405);
            }
            $pages = db()->query('SELECT id, title, slug, status, updated_at FROM pages ORDER BY updated_at DESC LIMIT 5')->fetchAll();
            $articles = db()->query('SELECT id, title, slug, status, updated_at FROM articles ORDER BY updated_at DESC LIMIT 5')->fetchAll();
            $media = db()->query('SELECT id, url, original_name, created_at FROM media ORDER BY id DESC LIMIT 8')->fetchAll();
            json_response(['ok' => true, 'pages' => $pages, 'articles' => $articles, 'media' => $media]);

        // ── One-click publish / unpublish (row toggle) ───────────────────
        case 'page_publish':
            csrf_or_fail();
            if ($method !== 'POST') {
                json_response(['ok' => false, 'message' => 'Method not allowed.'], 405);
            }
            $data = read_json_body();
            $publish = !empty($data['published']);
            if ($publish) {
                db()->prepare("UPDATE pages SET status = 'published', is_published = 1, published_at = COALESCE(published_at, NOW()), scheduled_at = NULL WHERE id = ?")
                    ->execute([(int) $param]);
            } else {
                db()->prepare("UPDATE pages SET status = 'draft', is_published = 0 WHERE id = ?")
                    ->execute([(int) $param]);
            }
            log_activity($publish ? 'page.publish' : 'page.unpublish', 'page', (int) $param);
            json_response(['ok' => true]);

        case 'article_publish':
            csrf_or_fail();
            if ($method !== 'POST') {
                json_response(['ok' => false, 'message' => 'Method not allowed.'], 405);
            }
            $data = read_json_body();
            $publish = !empty($data['published']);
            if ($publish) {
                db()->prepare("UPDATE articles SET status = 'published', is_published = 1, published_at = COALESCE(published_at, NOW()), scheduled_at = NULL WHERE id = ?")
                    ->execute([(int) $param]);
            } else {
                db()->prepare("UPDATE articles SET status = 'draft', is_published = 0 WHERE id = ?")
                    ->execute([(int) $param]);
            }
            log_activity($publish ? 'article.publish' : 'article.unpublish', 'article', (int) $param);
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
            $username = current_actor();
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
                log_activity('account.password_change', 'admin', (int) ($row['id'] ?? 0));
                json_response(['ok' => true]);
            } catch (Throwable $e) {
                json_response(['ok' => false, 'message' => 'Base de données indisponible : ' . $e->getMessage()], 500);
            }

        // ── Contact messages ─────────────────────────────────────────────
        case 'messages':
            csrf_or_fail();
            if ($method === 'GET') {
                $rows = db()->query('SELECT * FROM contact_messages ORDER BY created_at DESC, id DESC LIMIT 500')->fetchAll();
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
    // Log the failing action + code so SQL problems (e.g. HY093 parameter
    // mismatches, 42S22 column skew) can be traced to the exact endpoint.
    error_log(sprintf('[u2i-admin] action=%s %s: %s', $action, $e->getCode(), $e->getMessage()));
    json_response(['ok' => false, 'message' => 'Erreur base de données : ' . $e->getMessage()], 500);
} catch (Throwable $e) {
    error_log(sprintf('[u2i-admin] action=%s %s: %s', $action, get_class($e), $e->getMessage()));
    json_response(['ok' => false, 'message' => 'Erreur serveur : ' . $e->getMessage()], 500);
}
