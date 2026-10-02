-- U2I Process — CMS column migrations (v2 upgrades)
--
-- ┌──────────────────────────────────────────────────────────────────────────┐
-- │ DO NOT IMPORT THIS FILE WITH phpMyAdmin AGAINST A LIVE DATABASE.          │
-- │ Every ALTER below is unconditional. MySQL has no `ADD COLUMN IF NOT      │
-- │ EXISTS`, so re-running this against a database that already has the      │
-- │ column fails with:                                                       │
-- │     #1060 - Nom du champ 'parent_id' déjà utilisé                        │
-- │ and phpMyAdmin aborts the rest of the import.                             │
-- └──────────────────────────────────────────────────────────────────────────┘
--
-- These statements are kept here for reference and for the rare case of a
-- genuinely fresh database being brought up to the v2 shape by hand.
--
-- For EVERY upgrade — including a fresh one — just open:
--
--     /api/install.php?key=u2i-install-2024
--
-- install.php runs the same CREATE TABLE IF NOT EXISTS set as schema.sql and
-- then calls ensure_column() for each of the columns below, which checks
-- INFORMATION_SCHEMA first and skips anything already applied. It is
-- idempotent, reports what it created/migrated/skipped as JSON, and is the
-- only supported upgrade path.
--
-- database/schema.sql deliberately contains no ALTERs, so importing it into
-- an existing database is a safe no-op that still creates any missing tables.
--
-- is_published stays a real column, kept in sync with status by the PHP layer
-- (status='published' ⇔ is_published=1).

-- Pages: SEO + scheduling + hierarchy + parent + template blocks.
ALTER TABLE pages
    ADD COLUMN parent_id INT UNSIGNED NULL,
    ADD COLUMN seo_json JSON NULL,
    ADD COLUMN published_at DATETIME NULL,
    ADD COLUMN scheduled_at DATETIME NULL,
    ADD COLUMN status ENUM('draft','pending','scheduled','published','archived') NOT NULL DEFAULT 'draft',
    ADD COLUMN updated_by VARCHAR(120) NULL,
    ADD CONSTRAINT fk_pages_parent FOREIGN KEY (parent_id) REFERENCES pages(id) ON DELETE SET NULL,
    ADD INDEX idx_pages_pub (is_published, published_at),
    ADD INDEX idx_pages_sched (scheduled_at);

-- Articles: category + SEO + scheduling + revisions metadata.
ALTER TABLE articles
    ADD COLUMN category_id INT UNSIGNED NULL,
    ADD COLUMN seo_json JSON NULL,
    ADD COLUMN scheduled_at DATETIME NULL,
    ADD COLUMN status ENUM('draft','pending','scheduled','published','archived') NOT NULL DEFAULT 'draft',
    ADD COLUMN updated_by VARCHAR(120) NULL,
    ADD CONSTRAINT fk_articles_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    ADD INDEX idx_articles_sched (scheduled_at);

-- Media: metadata.
ALTER TABLE media
    ADD COLUMN title VARCHAR(255) NULL,
    ADD COLUMN alt_text VARCHAR(500) NULL,
    ADD COLUMN caption VARCHAR(500) NULL,
    ADD COLUMN description TEXT NULL,
    ADD INDEX idx_media_created (created_at);

-- Settings: header/footer/seo/social JSON mirrors of site_config.
ALTER TABLE settings
    ADD COLUMN header_json JSON NULL,
    ADD COLUMN footer_json JSON NULL,
    ADD COLUMN seo_json JSON NULL,
    ADD COLUMN social_json JSON NULL,
    ADD COLUMN home_json JSON NULL;

-- Client references (see references feature).
ALTER TABLE site_references
    ADD COLUMN i18n_json JSON NULL,
    ADD COLUMN website_url VARCHAR(500) NULL;