<?php
/**
 * U2I Process — CMS database installer.
 * Open /api/install.php once in your browser after filling config.php.
 * Protect with ?key=INSTALL_KEY (see constant below) or delete the file after.
 */

declare(strict_types=1);
require __DIR__ . '/config.php';

const INSTALL_KEY = 'u2i-install-2024'; // change or delete this file after install

if (INSTALL_KEY !== '' && ($_GET['key'] ?? '') !== INSTALL_KEY) {
    json_response(['ok' => false, 'message' => 'Missing or wrong install key.'], 403);
}

$statements = [
    "CREATE TABLE IF NOT EXISTS settings (
        id TINYINT UNSIGNED PRIMARY KEY,
        site_name VARCHAR(191) NOT NULL DEFAULT 'U2I Process',
        contact_email VARCHAR(191) NOT NULL DEFAULT 'u2i@u2iprocess.com',
        contact_phone VARCHAR(50) NOT NULL DEFAULT '',
        address TEXT NULL,
        footer_note TEXT NULL,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",

    "CREATE TABLE IF NOT EXISTS pages (
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

    "CREATE TABLE IF NOT EXISTS page_blocks (
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

    "CREATE TABLE IF NOT EXISTS articles (
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

    "CREATE TABLE IF NOT EXISTS media (
        id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
        url VARCHAR(500) NOT NULL,
        original_name VARCHAR(255) NULL,
        width INT NULL,
        height INT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",

    "CREATE TABLE IF NOT EXISTS contact_messages (
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

    "CREATE TABLE IF NOT EXISTS admins (
        id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
        username VARCHAR(100) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",
];

$results = ['created' => [], 'already_existed' => [], 'failed' => []];
foreach ($statements as $sql) {
    try {
        $ok = db()->exec($sql);
        if ($ok === 0) {
            $results['already_existed'][] = 1;
        } else {
            $results['created'][] = 1;
        }
    } catch (Throwable $e) {
        $results['failed'][] = ['sql' => substr($sql, 0, 60) . '…', 'error' => $e->getMessage()];
    }
}

// Insert default settings row if none exists.
try {
    $count = (int) db()->query('SELECT COUNT(*) AS c FROM settings')->fetch()['c'];
    if ($count === 0) {
        db()->exec("INSERT INTO settings (id, site_name, contact_email, contact_phone, address) VALUES (1, 'U2I Process', 'u2i@u2iprocess.com', '+216 50 191 004', 'Akouda, Sousse, Tunisie')");
    }
} catch (Throwable $e) {
    $results['failed'][] = ['sql' => 'settings seed', 'error' => $e->getMessage()];
}

// NOTE: no admin user is seeded — the first login at /admin shows a one-time
// account-creation form (setup mode) which hashes the password with
// password_hash(). Pre-baked hash strings in config would not verify.

json_response([
    'ok' => count($results['failed']) === 0,
    'message' => count($results['failed']) === 0
        ? 'Base de données installée. Vous pouvez utiliser le dashboard.'
        : 'Certaines tables ont échoué.',
    'results' => $results,
]);
