-- U2I Process — CMS database schema (v2)
-- phpMyAdmin: select your database → Import → choose this file → Go.
--
-- ── Safe to import against an EXISTING database ──────────────────────────
-- Every statement here is idempotent: CREATE TABLE IF NOT EXISTS, and
-- INSERT … SELECT … WHERE NOT EXISTS for the seed rows. Importing this file
-- twice changes nothing and, importantly, creates any table that is missing
-- while leaving existing data untouched.
--
-- This file intentionally contains NO ALTER TABLE statements. MySQL has no
-- `ADD COLUMN IF NOT EXISTS`, so an unconditional ALTER aborts a phpMyAdmin
-- import the moment the column already exists (error #1060). The v2 column
-- migrations therefore live in database/migrations.sql — reference only —
-- and the supported way to apply them is the installer:
--
--     /api/install.php?key=u2i-install-2024
--
-- which checks INFORMATION_SCHEMA and skips anything already applied.
--
-- Prefer the installer whenever you can: it is the only path that upgrades
-- an existing database correctly.
--
-- v2 additions: menus + menu_items, categories, tags, article_tags,
-- content_blocks (homepage builder), site_references, content_revisions,
-- activity_log, SEO fields, scheduled publication, media metadata.

CREATE TABLE IF NOT EXISTS settings (
    id TINYINT UNSIGNED PRIMARY KEY,
    site_name VARCHAR(191) NOT NULL DEFAULT 'U2I Process',
    contact_email VARCHAR(191) NOT NULL DEFAULT 'u2i@u2iprocess.com',
    contact_phone VARCHAR(50) NOT NULL DEFAULT '',
    address TEXT NULL,
    footer_note TEXT NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS pages (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS    page_blocks (
        id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
        page_id INT UNSIGNED NOT NULL,
        type ENUM('heading','text','image','gallery','contact_info','button','quote','spacer','video','html') NOT NULL,
        sort_order SMALLINT UNSIGNED NOT NULL DEFAULT 0,
        title TEXT NULL,
        body MEDIUMTEXT NULL,
        image_url VARCHAR(500) NULL,
        images_json JSON NULL,
        is_visible TINYINT(1) NOT NULL DEFAULT 1,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_blocks_page FOREIGN KEY (page_id) REFERENCES pages(id) ON DELETE CASCADE,
        INDEX idx_blocks_page (page_id, sort_order)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS articles (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS media (
    id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    url VARCHAR(500) NOT NULL,
    original_name VARCHAR(255) NULL,
    width INT NULL,
    height INT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS contact_messages (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS admins (
    id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ───────────────────────────── v2 additions ────────────────────────────────

-- Site-wide header / footer / SEO / branding configuration (JSON blobs).
CREATE TABLE IF NOT EXISTS site_config (
    id TINYINT UNSIGNED PRIMARY KEY,
    header_json JSON NULL,
    footer_json JSON NULL,
    seo_json JSON NULL,
    social_json JSON NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Named menus (e.g. "main", "footer"); items are nested via parent_id.
CREATE TABLE IF NOT EXISTS menus (
    id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    location VARCHAR(100) NOT NULL UNIQUE, -- 'main', 'footer', …
    label VARCHAR(191) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS menu_items (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Article categories.
CREATE TABLE IF NOT EXISTS categories (
    id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    slug VARCHAR(191) NOT NULL UNIQUE,
    name VARCHAR(191) NOT NULL,
    description TEXT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Article tags (many-to-many).
CREATE TABLE IF NOT EXISTS tags (
    id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    slug VARCHAR(191) NOT NULL UNIQUE,
    name VARCHAR(191) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS article_tags (
    article_id INT UNSIGNED NOT NULL,
    tag_id INT UNSIGNED NOT NULL,
    PRIMARY KEY (article_id, tag_id),
    CONSTRAINT fk_at_article FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
    CONSTRAINT fk_at_tag FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Homepage builder sections (full-width flexible JSON blocks).
CREATE TABLE IF NOT EXISTS content_blocks (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Client references shown on /references: partner logos + certifications.
-- Named site_references because REFERENCES is a reserved word in MySQL and
-- would need backticks in every query.
CREATE TABLE IF NOT EXISTS site_references (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Content revisions (restore point for pages & articles).
CREATE TABLE IF NOT EXISTS content_revisions (
    id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    entity_type ENUM('page','article') NOT NULL,
    entity_id INT UNSIGNED NOT NULL,
    author VARCHAR(120) NULL,
    snapshot_json JSON NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_revisions_entity (entity_type, entity_id, id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dashboard activity log (latest actions audit trail).
CREATE TABLE IF NOT EXISTS activity_log (
    id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    actor VARCHAR(120) NOT NULL,
    action VARCHAR(60) NOT NULL,
    entity_type VARCHAR(40) NULL,
    entity_id INT UNSIGNED NULL,
    detail VARCHAR(500) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_activity_recent (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ───────────────────────────── seed rows ──────────────────────────────────
-- Each guarded with WHERE NOT EXISTS so re-importing is a no-op.

-- Site config row (single-row table).
INSERT INTO site_config (id) SELECT 1 WHERE NOT EXISTS (SELECT 1 FROM site_config WHERE id = 1);

-- Default settings row (single-row table).
INSERT INTO settings (id, site_name, contact_email, contact_phone, address)
SELECT 1, 'U2I Process', 'u2i@u2iprocess.com', '+216 50 191 004', 'Akouda, Sousse, Tunisie'
WHERE NOT EXISTS (SELECT 1 FROM settings WHERE id = 1);

-- Default menus.
INSERT INTO menus (id, location, label) SELECT 1, 'main', 'Menu principal' WHERE NOT EXISTS (SELECT 1 FROM menus WHERE location = 'main');
INSERT INTO menus (id, location, label) SELECT 2, 'footer', 'Menu pied de page' WHERE NOT EXISTS (SELECT 1 FROM menus WHERE location = 'footer');
