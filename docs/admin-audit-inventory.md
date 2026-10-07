# Admin API + DB compatibility audit — working inventory

## Stack
- Frontend: React 19 + TanStack Start/Router, Vite SPA mode, `npm run build` → `dist/client/` (static) + `api/` copied in.
- Backend: PHP 7.4+ / MariaDB (OVH shared hosting). Local dev via XAMPP; Vite proxies `/api/*` to Apache target in `vite.config.ts`.
- Auth: session + CSRF. No default admin password — first visit to `/admin` shows one-time setup form (username + pw min 8). `adminApi.setupStatus()` selects mode.
- CSRF: token in `$_SESSION['csrf']`, sent by frontend as `X-CSRF-Token` header on every mutating action.
- DB access: `public/api/config.php` → `db()` PDO (ERRMODE_EXCEPTION, FETCH_ASSOC, emulate_prepares=false). Credentials from `config.local.php` first, then `DB_HOST/DB_NAME/DB_USER/DB_PASS` env.
- Uploads: `public/api/config.php` `UPLOAD_DIR`, `ALLOWED_IMAGE_TYPES`, `UPLOAD_MAX_BYTES=12MB`.
- Frontend API client: `src/lib/cms.ts` → `cmsApi` (public, read-only) + `adminApi` (CSRF-protected).

## Admin API surface (public/api/admin.php, ?a=<action>&p=<param>)

### Auth (public, no CSRF)
- GET /api/admin.php?a=setup_status  → {ok, setup:bool}
- POST /api/admin.php?a=setup        → create first admin (rate-limited), returns csrf
- POST /api/admin.php?a=login        → login (rate-limited), returns csrf on success
- GET  /api/admin.php?a=me           → csrf + username (401 if not logged in)
- POST /api/admin.php?a=logout       → logout

### Dashboard / stats (CSRF)
- GET /api/admin.php?a=stats
- GET /api/admin.php?a=i18n_coverage
- GET /api/admin.php?a=recent

### Settings (CSRF)
- GET  /api/admin.php?a=settings
- PUT/POST /api/admin.php?a=settings   (save: siteName, contactEmail, contactPhone, address, footerNote, + JSON blobs headerJson/footerJson/seoJson/socialJson/homeJson)

### Pages (CSRF)
- GET  /api/admin.php?a=pages            → list {items:CmsPage[]}
- POST /api/admin.php?a=pages            → create (title*, slug?, slugEn?, eyebrow, heroTitle, heroText, heroImageUrl, navLabel, navOrder, parentId, status, isPublished, scheduledAt, seo, blocks, i18n)
- GET  /api/admin.php?a=page&p=<id>      → read {page, blocks[]}
- PUT/POST /api/admin.php?a=page&p=<id>  → update (same fields; slugEn optional; writes slug_en column)
- DELETE /api/admin.php?a=page&p=<id>
- POST /api/admin.php?a=page_duplicate&p=<id>  → duplicate (INSERT SELECT, no slug_en)
- POST /api/admin.php?a=page_publish&p=<id>    → toggle publish (body {published:bool})
- POST /api/admin.php?a=page_reorder           → {ids:[...]}

### Articles (CSRF)
- GET  /api/admin.php?a=articles         → list {items:CmsArticle[]}  (SELECT includes slug_en)
- POST /api/admin.php?a=articles         → create (title*, slug?, slugEn?, excerpt, body, coverImageUrl, author, categoryId, status, isPublished, scheduledAt, seo, tagIds, i18n). INSERT does NOT write slug_en.
- GET  /api/admin.php?a=article&p=<id>   → read {article} + tagIds
- PUT/POST /api/admin.php?a=article&p=<id> → update (writes slug_en column)
- DELETE /api/admin.php?a=article&p=<id>
- POST /api/admin.php?a=article_duplicate&p=<id> → duplicate (INSERT SELECT, no slug_en)
- POST /api/admin.php?a=article_publish&p=<id>   → toggle publish

### Media (CSRF)
- GET  /api/admin.php?a=media            → list {items: CmsMedia[]}
- POST /api/admin.php?a=media            → upload (multipart file) → {media}
- PUT/POST /api/admin.php?a=media_meta&p=<id>  → update title/altText/caption/description
- DELETE /api/admin.php?a=media_delete&p=<id>  → delete (+ guard: refuses if still referenced; deletes file)

### Menus (CSRF)
- GET  /api/admin.php?a=menus           → {items:[{id,location,label,items:MenuItem[]}]}
- POST /api/admin.php?a=menus           → create {label, location?} → {id}
- PUT/POST /api/admin.php?a=menu&p=<id> → save items (full replace; nested 1-level)
- DELETE /api/admin.php?a=menu&p=<id>

### Categories (CSRF)
- GET  /api/admin.php?a=categories      → {items} (+ article_count subquery)
- POST /api/admin.php?a=categories      → create {name*, slug?, description}
- PUT/POST /api/admin.php?a=category&p=<id>
- DELETE /api/admin.php?a=category&p=<id>

### Tags (CSRF)
- GET  /api/admin.php?a=tags
- POST /api/admin.php?a=tags
- PUT/POST /api/admin.php?a=tag&p=<id>
- DELETE /api/admin.php?a=tag&p=<id>

### Homepage builder (CSRF)
- GET  /api/admin.php?a=home_blocks
- PUT/POST /api/admin.php?a=home_blocks (saveHomeBlocks: full replace)

### References (CSRF)
- GET  /api/admin.php?a=references      → {items, refiled, deduped}  (ensure_reference_schema + repair_reference_kinds + dedupe on read)
- PUT/POST /api/admin.php?a=references  → save (transaction; dedupe; grouped reference→certification)

### Revisions (CSRF)
- GET  /api/admin.php?a=revisions&type=<page|article>&p=<id>
- GET  /api/admin.php?a=revision&p=<revId>
- POST /api/admin.php?a=revision&p=<revId>   → restore snapshot (writes slug/title/excerpt/body/cover_image_url/author for articles; slug/title/eyebrow/hero_* for pages — NOTE: does NOT write slug_en / i18n_json on restore)

### Activity (CSRF)
- GET /api/admin.php?a=activity

### Contact messages (CSRF)
- GET  /api/admin.php?a=messages
- PATCH/POST /api/admin.php?a=message&p=<id>  → mark read
- DELETE /api/admin.php?a=message&p=<id>

### Account (CSRF)
- POST /api/admin.php?a=change_password  → {currentPassword, newPassword}

## Public read API (public/api/cms.php, ?r=<resource>&p=<param>, GET only)
- r=settings     → settings (decoded JSON cols) + lang
- r=nav          → menu tree (main) or legacy pages-based nav (SELECT includes slug_en)
- r=footer_menu  → footer menu tree
- r=page&p=slug  → page + blocks (find_by_slug → tries slug_en then slug)
- r=articles     → published articles list (SELECT includes slug_en)
- r=article&p=slug → article + tags (find_by_slug → tries slug_en then slug)
- r=home         → content_blocks
- r=references   → references (reconcile + dedupe on read)
- r=categories   → categories + article_count

## slug_en / multilingual slug & title references (project-wide grep)
- Only `slug_en` appears. No `slug_fr`, `slug_ar`, `title_en`, `title_fr`, `title_ar` anywhere in project files.
- Public API (cms.php): reads optional `slug_en` from `pages` and `articles` rows, exposes `slugEn`. Uses it in nav/page/article reads. Does NOT build `/en/actualites/<slug_en>` URLs itself.
- Admin API (admin.php):
  - with_i18n_meta(): READS $row['slug_en'] → slugEn (safe: isset check).
  - list_articles(): SELECT includes slug_en. **FAILS if column missing.**
  - articles POST (create): INSERT does NOT include slug_en. **Safe on missing column.**
  - article GET: SELECT * → inherits whatever schema.
  - article PUT/POST (update): UPDATE sets slug_en = ?. **FAILS if column missing.**
  - article_duplicate: INSERT SELECT, no slug_en.
  - pages POST (create): INSERT does NOT include slug_en.
  - page GET: SELECT *.
  - page PUT/POST (update): UPDATE sets slug_en = ?. **FAILS if column missing.**
  - page_duplicate: INSERT SELECT, no slug_en.
  - i18n_coverage: SELECT includes slug_en for pages and articles. **FAILS if column missing.**
- Frontend:
  - src/lib/cms.ts: CmsPage/CmsArticle have optional `slugEn`; AdminPagePayload/AdminArticlePayload have optional `slugEn`.
  - src/features/admin/sections/articles.tsx: form keeps `slugEn` state, sends it in payload (slugEn || undefined).
  - src/features/admin/sections/pages.tsx: same — sends slugEn in payload.
  - Menus: uses labelEn → i18n {en:{label}} (different mechanism; menu_items.i18n_json, not slug_en).
- install.php: canonical schema-evolution path (`?key=u2i-install-2024`). v3 i18n section ensures slug_en on BOTH pages and articles: `ensure_column($pdo, 'pages', 'slug_en', 'VARCHAR(191) NULL')` and same for articles, plus unique indexes idx_pages_slug_en / idx_articles_slug_en. So the CODE expects slug_en on both tables; the install path is supposed to add it.

## Install.php — tables it creates (CREATE TABLE IF NOT EXISTS)
settings, pages, page_blocks, articles, media, contact_messages, admins, site_config, menus, menu_items, categories, tags, article_tags, content_blocks, site_references, content_revisions, activity_log.

## install.php — v2 column migrations (ensure_column = guarded ALTER only when missing)
pages: parent_id, seo_json, published_at, scheduled_at, status, updated_by
articles: category_id, seo_json, scheduled_at, status, updated_by
media: title, alt_text, caption, description
settings: header_json, footer_json, seo_json, social_json, home_json
site_references: i18n_json, website_url; ensure_reference_kind (client/partner → reference)
menu_items: i18n_json
page_blocks: is_visible; ENUM widen (button,quote,spacer,video,html)
settings: i18n_json; site_config: i18n_json

## install.php — v3 i18n (English)
pages: slug_en (VARCHAR(191) NULL), i18n_json
articles: slug_en (VARCHAR(191) NULL), i18n_json
page_blocks: i18n_json
content_blocks: i18n_json
menu_items: i18n_json
categories: i18n_json
tags: i18n_json
media: i18n_json
+ unique indexes idx_pages_slug_en, idx_articles_slug_en
+ indexes idx_pages_pub, idx_pages_sched, idx_articles_sched, idx_media_created
+ FKs fk_pages_parent, fk_articles_category

## Legacy backfill in install.php
- pages/articles: status='published', published_at=NOW() WHERE is_published=1 AND status='draft'
- sync is_published ← status (set 0 where status != published and is_published=1)

## Seeds in install.php
- settings row id=1 (if empty)
- site_config row id=1 (if empty)
- menus: main + footer (if missing)
- NO admin user seeded (setup form creates it)

## README claims database/schema.sql + database/migrations.sql exist
- BUT glob database/**/*.sql returned 0 files — these files are NOT in the repo tree.
- README warns migrations.sql uses bare ALTER (no IF NOT EXISTS) — never import it. Use install.php instead.

## Admin frontend sections (src/features/admin/sections/)
home.tsx, pages.tsx, articles.tsx, media.tsx, menus.tsx, references.tsx, settings.tsx, account.tsx, taxonomy.tsx, messages.tsx, homepage.tsx (+ website.tsx exists in inventory)

## Outstanding blockers
- Real DB credentials not available in this workspace (no DB_* env, no config.local.php, and reading secrets is blocked). The only local DB is `u2i_test`, which contains ONLY site_references — not the full CMS schema. Cannot complete Step 2 (real schema dump), Step 3 (confirm which table lacks slug_en), Step 4/8 (CRUD tests), or confirm the fix against the real DB until credentials are provided.
- Earlier turns established the PHP backend behind the Vite proxy is not operational here (502 / ECONNREFUSED on /api/admin.php and /api/cms.php). Admin CRUD tests require a running PHP+DB backend.
