<?php
/**
 * U2I Process — CMS database installer (v2 schema).
 * Open /api/install.php once in your browser after filling config.php.
 * Protect with ?key=INSTALL_KEY (see constant below) or delete the file after.
 *
 * Idempotent: CREATE TABLE IF NOT EXISTS + duplicate-column-tolerant ALTERs.
 */

declare(strict_types=1);
require __DIR__ . '/config.php';

const INSTALL_KEY = 'u2i-install-2024'; // change or delete this file after install

if (INSTALL_KEY !== '' && ($_GET['key'] ?? '') !== INSTALL_KEY) {
    json_response(['ok' => false, 'message' => 'Missing or wrong install key.'], 403);
}

function column_exists(PDO $pdo, string $table, string $column): bool
{
    try {
        $stmt = $pdo->prepare(
            'SELECT COUNT(*) AS c FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?'
        );
        $stmt->execute([$table, $column]);

        return (int) $stmt->fetch()['c'] > 0;
    } catch (Throwable $e) {
        return false;
    }
}

/** Run an ALTER only when the column is missing (portable IF NOT EXISTS). */
function ensure_column(PDO $pdo, string $table, string $column, string $definition): void
{
    global $results;
    if (column_exists($pdo, $table, $column)) {
        return;
    }
    try {
        $pdo->exec("ALTER TABLE {$table} ADD COLUMN {$column} {$definition}");
        $results['migrated'][] = "{$table}.{$column}";
    } catch (Throwable $e) {
        $results['failed'][] = ['sql' => "{$table}.{$column}", 'error' => $e->getMessage()];
    }
}

$results = ['created' => [], 'migrated' => [], 'already_existed' => [], 'failed' => []];
$pdo = db();

$statements = [
    'settings' => "CREATE TABLE IF NOT EXISTS settings (
        id TINYINT UNSIGNED PRIMARY KEY,
        site_name VARCHAR(191) NOT NULL DEFAULT 'U2I Process',
        contact_email VARCHAR(191) NOT NULL DEFAULT 'u2i@u2iprocess.com',
        contact_phone VARCHAR(50) NOT NULL DEFAULT '',
        address TEXT NULL,
        footer_note TEXT NULL,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",

    'pages' => "CREATE TABLE IF NOT EXISTS pages (
        id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
        slug VARCHAR(191) NOT NULL UNIQUE,
        title VARCHAR(255) NOT NULL,
        eyebrow VARCHAR(120) NULL,
        hero_title VARCHAR(255) NULL,
        hero_text TEXT NULL,
        hero_image_url VARCHAR(500) NULL,
        nav_label VARCHAR(120) NULL,
        nav_order SMALLINT UNSIGNED NOT NULL DEFAULT 0,
        is_published TINYINT(1) NOT NULL DEFAULT 0,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",

    'page_blocks' => "CREATE TABLE IF NOT EXISTS page_blocks (
        id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
        page_id INT UNSIGNED NOT NULL,
        type ENUM('heading','text','image','gallery','contact_info') NOT NULL,
        sort_order SMALLINT UNSIGNED NOT NULL DEFAULT 0,
        title TEXT NULL,
        body MEDIUMTEXT NULL,
        image_url VARCHAR(500) NULL,
        images_json JSON NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_blocks_page FOREIGN KEY (page_id) REFERENCES pages(id) ON DELETE CASCADE,
        INDEX idx_blocks_page (page_id, sort_order)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",

    'articles' => "CREATE TABLE IF NOT EXISTS articles (
        id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
        slug VARCHAR(191) NOT NULL UNIQUE,
        title VARCHAR(255) NOT NULL,
        excerpt TEXT NULL,
        body MEDIUMTEXT NULL,
        cover_image_url VARCHAR(500) NULL,
        author VARCHAR(120) NULL,
        is_published TINYINT(1) NOT NULL DEFAULT 0,
        published_at DATETIME NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_articles_pub (is_published, published_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",

    'media' => "CREATE TABLE IF NOT EXISTS media (
        id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
        url VARCHAR(500) NOT NULL,
        original_name VARCHAR(255) NULL,
        width INT NULL,
        height INT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",

    'contact_messages' => "CREATE TABLE IF NOT EXISTS contact_messages (
        id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        email VARCHAR(254) NOT NULL,
        company VARCHAR(150) NULL,
        subject VARCHAR(200) NOT NULL,
        message TEXT NOT NULL,
        is_read TINYINT(1) NOT NULL DEFAULT 0,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_messages_read (is_read, created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",

    'admins' => "CREATE TABLE IF NOT EXISTS admins (
        id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
        username VARCHAR(100) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",

    'site_config' => "CREATE TABLE IF NOT EXISTS site_config (
        id TINYINT UNSIGNED PRIMARY KEY,
        header_json JSON NULL,
        footer_json JSON NULL,
        seo_json JSON NULL,
        social_json JSON NULL,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",

    'menus' => "CREATE TABLE IF NOT EXISTS menus (
        id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
        location VARCHAR(100) NOT NULL UNIQUE,
        label VARCHAR(191) NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",

    'menu_items' => "CREATE TABLE IF NOT EXISTS menu_items (
        id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
        menu_id INT UNSIGNED NOT NULL,
        parent_id INT UNSIGNED NULL,
        label VARCHAR(191) NOT NULL,
        url VARCHAR(500) NOT NULL,
        sort_order SMALLINT UNSIGNED NOT NULL DEFAULT 0,
        is_enabled TINYINT(1) NOT NULL DEFAULT 1,
        opens_new_tab TINYINT(1) NOT NULL DEFAULT 0,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_menu_items_menu FOREIGN KEY (menu_id) REFERENCES menus(id) ON DELETE CASCADE,
        CONSTRAINT fk_menu_items_parent FOREIGN KEY (parent_id) REFERENCES menu_items(id) ON DELETE CASCADE,
        INDEX idx_menu_items (menu_id, parent_id, sort_order)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",

    'categories' => "CREATE TABLE IF NOT EXISTS categories (
        id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
        slug VARCHAR(191) NOT NULL UNIQUE,
        name VARCHAR(191) NOT NULL,
        description TEXT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",

    'tags' => "CREATE TABLE IF NOT EXISTS tags (
        id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
        slug VARCHAR(191) NOT NULL UNIQUE,
        name VARCHAR(191) NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",

    'article_tags' => "CREATE TABLE IF NOT EXISTS article_tags (
        article_id INT UNSIGNED NOT NULL,
        tag_id INT UNSIGNED NOT NULL,
        PRIMARY KEY (article_id, tag_id),
        CONSTRAINT fk_at_article FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
        CONSTRAINT fk_at_tag FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",

    'content_blocks' => "CREATE TABLE IF NOT EXISTS content_blocks (
        id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
        type ENUM('hero','about','services','stats','features','projects','testimonials','team','articles','gallery','cta','contact','faq','html') NOT NULL,
        title VARCHAR(255) NULL,
        subtitle VARCHAR(500) NULL,
        body MEDIUMTEXT NULL,
        image_url VARCHAR(500) NULL,
        config_json JSON NULL,
        sort_order SMALLINT UNSIGNED NOT NULL DEFAULT 0,
        is_visible TINYINT(1) NOT NULL DEFAULT 1,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_content_blocks (is_visible, sort_order)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",

    'content_revisions' => "CREATE TABLE IF NOT EXISTS content_revisions (
        id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
        entity_type ENUM('page','article') NOT NULL,
        entity_id INT UNSIGNED NOT NULL,
        author VARCHAR(120) NULL,
        snapshot_json JSON NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_revisions_entity (entity_type, entity_id, id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",

    'activity_log' => "CREATE TABLE IF NOT EXISTS activity_log (
        id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
        actor VARCHAR(120) NOT NULL,
        action VARCHAR(60) NOT NULL,
        entity_type VARCHAR(40) NULL,
        entity_id INT UNSIGNED NULL,
        detail VARCHAR(500) NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_activity_recent (created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",
];

foreach ($statements as $label => $sql) {
    try {
        $pdo->exec($sql);
        $results['created'][] = $label;
    } catch (Throwable $e) {
        if (strpos($e->getMessage(), 'already exists') !== false) {
            $results['already_existed'][] = $label;
        } else {
            $results['failed'][] = ['sql' => $label, 'error' => $e->getMessage()];
        }
    }
}

// ── v2 column migrations (skip when the column already exists) ─────────────

ensure_column($pdo, 'pages', 'parent_id', 'INT UNSIGNED NULL');
ensure_column($pdo, 'pages', 'seo_json', 'JSON NULL');
ensure_column($pdo, 'pages', 'published_at', 'DATETIME NULL');
ensure_column($pdo, 'pages', 'scheduled_at', 'DATETIME NULL');
ensure_column($pdo, 'pages', 'status', "ENUM('draft','pending','scheduled','published','archived') NOT NULL DEFAULT 'draft'");
ensure_column($pdo, 'pages', 'updated_by', 'VARCHAR(120) NULL');

ensure_column($pdo, 'articles', 'category_id', 'INT UNSIGNED NULL');
ensure_column($pdo, 'articles', 'seo_json', 'JSON NULL');
ensure_column($pdo, 'articles', 'scheduled_at', 'DATETIME NULL');
ensure_column($pdo, 'articles', 'status', "ENUM('draft','pending','scheduled','published','archived') NOT NULL DEFAULT 'draft'");
ensure_column($pdo, 'articles', 'updated_by', 'VARCHAR(120) NULL');

ensure_column($pdo, 'media', 'title', 'VARCHAR(255) NULL');
ensure_column($pdo, 'media', 'alt_text', 'VARCHAR(500) NULL');
ensure_column($pdo, 'media', 'caption', 'VARCHAR(500) NULL');
ensure_column($pdo, 'media', 'description', 'TEXT NULL');

ensure_column($pdo, 'settings', 'header_json', 'JSON NULL');
ensure_column($pdo, 'settings', 'footer_json', 'JSON NULL');
ensure_column($pdo, 'settings', 'seo_json', 'JSON NULL');
ensure_column($pdo, 'settings', 'social_json', 'JSON NULL');
ensure_column($pdo, 'settings', 'home_json', 'JSON NULL');

// v2.1 — page builder: per-section visibility + richer block types.
// ENUM widen must be guarded (an ALTER on an up-to-date column is harmless but
// noisy; skip when the type already carries every value).
try {
    $stmt = $pdo->prepare(
        'SELECT COLUMN_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?'
    );
    $stmt->execute(['page_blocks', 'type']);
    $colType = (string) ($stmt->fetch()['COLUMN_TYPE'] ?? '');
    $wanted = ["'button'", "'quote'", "'spacer'", "'video'", "'html'"];
    $missing = array_filter($wanted, static fn ($v) => strpos($colType, $v) === false);
    if ($colType !== '' && $missing) {
        $pdo->exec(
            "ALTER TABLE page_blocks MODIFY COLUMN type ENUM('heading','text','image','gallery','contact_info','button','quote','spacer','video','html') NOT NULL DEFAULT 'heading'"
        );
        $results['migrated'][] = 'page_blocks.type widened (+button,quote,spacer,video,html)';
    }
} catch (Throwable $e) {
    $results['failed'][] = ['sql' => 'page_blocks.type widen', 'error' => $e->getMessage()];
}

ensure_column($pdo, 'page_blocks', 'is_visible', 'TINYINT(1) NOT NULL DEFAULT 1');

ensure_column($pdo, 'settings', 'i18n_json', 'JSON NULL');
ensure_column($pdo, 'site_config', 'i18n_json', 'JSON NULL');

// ── v3 i18n (English) ──────────────────────────────────────────────────────
// French remains the source language in the existing columns; English lives in
// dedicated columns (slug_en) / JSON blobs (i18n_json). Every i18n_json blob has
// the shape {"en": {<field>: <value>}}, so other languages can be added later
// without another migration. NULL / empty means "not translated yet" and the
// public API falls back to French, flagging the item in the admin.
ensure_column($pdo, 'pages', 'slug_en', 'VARCHAR(191) NULL');
ensure_column($pdo, 'pages', 'i18n_json', 'JSON NULL');
ensure_column($pdo, 'articles', 'slug_en', 'VARCHAR(191) NULL');
ensure_column($pdo, 'articles', 'i18n_json', 'JSON NULL');
ensure_column($pdo, 'page_blocks', 'i18n_json', 'JSON NULL');
ensure_column($pdo, 'content_blocks', 'i18n_json', 'JSON NULL');
ensure_column($pdo, 'menu_items', 'i18n_json', 'JSON NULL');
ensure_column($pdo, 'categories', 'i18n_json', 'JSON NULL');
ensure_column($pdo, 'tags', 'i18n_json', 'JSON NULL');
ensure_column($pdo, 'media', 'i18n_json', 'JSON NULL');

// English slugs must stay unique, but only among rows that HAVE one — MySQL
// allows many NULLs in a UNIQUE index, which is exactly the semantics wanted.
try {
    $pdo->exec('CREATE UNIQUE INDEX idx_pages_slug_en ON pages (slug_en)');
} catch (Throwable $e) {
}
try {
    $pdo->exec('CREATE UNIQUE INDEX idx_articles_slug_en ON articles (slug_en)');
} catch (Throwable $e) {
}

try {
    $pdo->exec("CREATE INDEX idx_pages_pub ON pages (is_published, published_at)");
} catch (Throwable $e) {
}
try {
    $pdo->exec("CREATE INDEX idx_pages_sched ON pages (scheduled_at)");
} catch (Throwable $e) {
}
try {
    $pdo->exec("CREATE INDEX idx_articles_sched ON articles (scheduled_at)");
} catch (Throwable $e) {
}
try {
    $pdo->exec("CREATE INDEX idx_media_created ON media (created_at)");
} catch (Throwable $e) {
}

try {
    $pdo->exec("ALTER TABLE pages ADD CONSTRAINT fk_pages_parent FOREIGN KEY (parent_id) REFERENCES pages(id) ON DELETE SET NULL");
} catch (Throwable $e) {
}
try {
    $pdo->exec("ALTER TABLE articles ADD CONSTRAINT fk_articles_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL");
} catch (Throwable $e) {
}

// ── Legacy data backfill (idempotent) ───────────────────────────────────
// Rows published before the v2 status workflow have is_published = 1 but
// status = 'draft' (the ALTER default) — public queries filter on status, so
// those pages/articles would silently vanish from the site. Keep both columns
// in sync in BOTH directions.
try {
    $pdo->exec("UPDATE pages SET status = 'published', published_at = COALESCE(published_at, NOW()) WHERE is_published = 1 AND status = 'draft'");
    $results['migrated'][] = 'backfill pages legacy published → status';
} catch (Throwable $e) {
    $results['failed'][] = ['sql' => 'backfill pages', 'error' => $e->getMessage()];
}
try {
    $pdo->exec("UPDATE articles SET status = 'published', published_at = COALESCE(published_at, NOW()) WHERE is_published = 1 AND status = 'draft'");
    $results['migrated'][] = 'backfill articles legacy published → status';
} catch (Throwable $e) {
    $results['failed'][] = ['sql' => 'backfill articles', 'error' => $e->getMessage()];
}
try {
    $pdo->exec("UPDATE pages SET is_published = 0 WHERE status <> 'published' AND is_published = 1");
    $pdo->exec("UPDATE articles SET is_published = 0 WHERE status <> 'published' AND is_published = 1");
    $results['migrated'][] = 'sync is_published ← status';
} catch (Throwable $e) {
    $results['failed'][] = ['sql' => 'sync is_published', 'error' => $e->getMessage()];
}

// ── Seeds ────────────────────────────────────────────────────────────────────

try {
    $count = (int) $pdo->query('SELECT COUNT(*) AS c FROM settings')->fetch()['c'];
    if ($count === 0) {
        $pdo->exec("INSERT INTO settings (id, site_name, contact_email, contact_phone, address) VALUES (1, 'U2I Process', 'u2i@u2iprocess.com', '+216 50 191 004', 'Akouda, Sousse, Tunisie')");
    }
} catch (Throwable $e) {
    $results['failed'][] = ['sql' => 'settings seed', 'error' => $e->getMessage()];
}

try {
    $count = (int) $pdo->query('SELECT COUNT(*) AS c FROM site_config')->fetch()['c'];
    if ($count === 0) {
        $pdo->exec('INSERT INTO site_config (id) VALUES (1)');
    }
} catch (Throwable $e) {
    $results['failed'][] = ['sql' => 'site_config seed', 'error' => $e->getMessage()];
}

foreach ([['main', 'Menu principal'], ['footer', 'Menu pied de page']] as $menu) {
    try {
        $stmt = $pdo->prepare('SELECT COUNT(*) AS c FROM menus WHERE location = ?');
        $stmt->execute([$menu[0]]);
        if ((int) $stmt->fetch()['c'] === 0) {
            $insert = $pdo->prepare('INSERT INTO menus (location, label) VALUES (?, ?)');
            $insert->execute([$menu[0], $menu[1]]);
        }
    } catch (Throwable $e) {
        $results['failed'][] = ['sql' => 'menu seed ' . $menu[0], 'error' => $e->getMessage()];
    }
}

// NOTE: no admin user is seeded — the first login at /admin shows a one-time
// account-creation form (setup mode) which hashes the password with
// password_hash(). Pre-baked hash strings in config would not verify.

json_response([
    'ok' => count($results['failed']) === 0,
    'message' => count($results['failed']) === 0
        ? 'Base de données installée (schéma v2). Vous pouvez utiliser le dashboard.'
        : 'Certaines migrations ont échoué — voir "results".',
    'results' => $results,
]);
