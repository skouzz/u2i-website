# Architecture Audit & Modernization — U2I Process CMS (September 2026)

Full-stack audit of the existing project (React 19 + TanStack Start SPA front-end,
plain PHP 7.4+ / MySQL back-end for OVH shared hosting) followed by a
backward-compatible modernization. **All existing functionality is preserved**;
new capabilities are additive.

---

## 1. Critical defects found and fixed

| #   | Severity    | Issue                                                                                                                                         | Fix                                                                                                        |
| --- | ----------- | --------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| 1   | **Blocker** | `/p/<slug>` had **no route** — every page created in the dashboard 404'd on the public site                                                   | New catch-all route `src/routes/p.$.tsx` rendering `CmsPageRoute`                                          |
| 2   | **Blocker** | `UPLOAD_DIR`, `ALLOWED_IMAGE_TYPES`, `UPLOAD_MAX_BYTES` were referenced but **never defined** → _any_ media upload crashed with a fatal error | Constants defined in [config.php](../public/api/config.php)                                                |
| 3   | High        | Prerendered static routes are favored by `DirectoryIndex`; admin changes to pages don't reflect on prerendered URLs                           | Documented; CMS pages served under `/p/<slug>` via SPA shell + Apache rewrite (existing behavior retained) |
| 4   | High        | `settings.footer_json` column added to a `TINYINT PK` table schema was inconsistent with the new JSON config storage                          | Single `settings` row with guarded JSON columns; installer migrations skip existing columns                |
| 5   | Medium      | `admin_change_password` used the _config_ username instead of the logged-in session username                                                  | Now uses `current_actor()` from the session                                                                |
| 6   | Medium      | CMS pages/articles had **no SEO metadata** support at all                                                                                     | `seo_json` columns + per-entity SEO tab + `useSeo` hook + dynamic `sitemap.php`                            |
| 7   | Medium      | Login had no rate limiting (brute-force possible beyond the 400ms sleep)                                                                      | File-backed rate limiter: 10 logins / 5 min / IP; 5 setups / hour                                          |
| 8   | Medium      | Footer/nav/social/contact info was **hardcoded** in TSX                                                                                       | Header/footer/social/announcement configurable from the dashboard with fallbacks                           |
| 9   | Low         | Session cookie lacked `HttpOnly`/`SameSite`/`Secure` hardening                                                                                | Hardened in `admin_session_start()`                                                                        |
| 10  | Low         | ~500 lines of dead duplicated code in the homepage (unused `SiteHeader`, `SiteFooter`, `StatCard`, duplicate marquee)                         | Extracted to [default-page.tsx](../src/features/home/default-page.tsx); dead code removed                  |

## 2. Security review summary

- **Fixed:** missing upload constants, path-traversal hardening in upload serving
  (`serve_upload()` + `uploads.php` router), hardened session cookies, login/setup
  rate limiting, `X-Content-Type-Options` on JSON responses, security headers in
  `.htaccess` (nosniff, frame-options, referrer-policy), stricter SVG/PDF serving
  via CSP `default-src 'none'`, MIME allow-list on upload, `is_uploaded_file()` check,
  slug-table allow-list against identifier injection, `session_regenerate_id` on
  login (existing), CSRF on every mutating endpoint (existing, verified).
- **Verified existing:** prepared statements everywhere (PDO), honeypot +
  per-IP throttle + header-injection guards on the contact form, bcrypt password
  hashing, JSON body validation, no secrets in the repo (`config.local.php`
  git-ignored), admin API fully session-gated.
- **Notes / recommendations:** keep `install.php` behind its key or delete it
  after installation (unchanged practice); `robots.txt` domain placeholder should
  be updated at deployment; roles/permissions are schema-ready (`status`,
  `updated_by`) but the single-admin model is unchanged by design for OVH hosting.

## 3. New CMS capabilities (all additive)

| Area                        | What's new                                                                                                                                                                                                                                         |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Content workflow**        | `draft / pending / scheduled / published / archived` statuses, one-click publish toggle, scheduled publication date, revisions (last 20 auto-snapshots per page/article with restore)                                                              |
| **Pages**                   | SEO tab (title/description/canonical/OG/robots), parent-page hierarchy, status filter + search, duplicate, revisions, scheduler                                                                                                                    |
| **Articles**                | Rich-text editor (headings, bold/italic/underline, lists, quotes, links, tables, inline images from the media library, code-free workflow), categories, tags, SEO tab, duplicate, revisions, scheduler                                             |
| **Taxonomy**                | Categories & tags CRUD with slugs, article counts, tag chips on article editor                                                                                                                                                                     |
| **Menus**                   | Multiple named menus (main + footer), nested items (one dropdown level), enable/disable, open-in-new-tab, add pages or custom URLs, reorder; public navbar/footer consume them (legacy pages-based nav as fallback)                                |
| **Homepage builder**        | 14 section types (hero, about, services, stats, features, projects, testimonials, team, articles, gallery, cta, contact, faq, html) with per-section fields, visibility toggles, ordering; falls back to the original designed homepage when empty |
| **Header / Footer editors** | Logo, announcement bar, contact info, social links (7 networks), footer columns/links, copyright, CTA                                                                                                                                              |
| **Settings**                | Tabbed General / SEO defaults; SEO defaults feed the whole site                                                                                                                                                                                    |
| **Media**                   | Drag & drop upload, search, metadata (title, alt, caption, description), PDF/SVG support with hardened serving                                                                                                                                     |
| **Dashboard**               | Extended stats (drafts/scheduled/categories/tags), recent pages/articles/media, activity log (100 last actions), quick actions                                                                                                                     |
| **SEO**                     | Per-entity meta + OG, dynamic `sitemap.php`, `robots.txt`, canonical tags, `useSeo` client-side tag manager                                                                                                                                        |
| **Admin UX**                | Grouped collapsible sidebar (Contenu / Médias & menus / Site web / Système), lazy-loaded sections, mobile drawer, user badge, search + status filters, skeletons                                                                                   |

## 4. Architecture notes

- **Preserved patterns:** file-based TanStack routes; `?a=action&p=param` PHP API
  style; camelCase mappers at the PHP boundary; French UI language; CSS custom
  properties + component CSS files; no new runtime dependencies added.
- **Separation of concerns:** PHP endpoints stay thin controllers (validation +
  mapping); business rules (status sync, slug uniqueness, revision pruning) live
  in reusable helpers in `config.php` / `admin.php`; the front-end keeps all
  API access in `src/lib/cms.ts` and rendering in `features/*`.
- **Database:** [schema.sql](../database/schema.sql) and the idempotent installer
  ([install.php](../public/api/install.php)) add 8 tables (site_config, menus,
  menu_items, categories, tags, article_tags, content_blocks, content_revisions,
  activity_log) and guarded column migrations; existing rows are untouched and
  legacy fallbacks keep the site working pre-migration.

## 5. Known follow-ups (deliberately out of scope)

1. **Roles/permissions UI** — schema is ready (`updated_by`, status columns), but
   the dashboard still manages a single admin account (as before). Adding user
   management requires only a `users` table + login lookup swap.
2. **Scheduled publishing cron** — scheduled items need a tiny cron/visitor trigger
   to flip `scheduled → published` (a 10-line PHP snippet on OVH's cron).
3. **Drag & drop menu reordering** — currently up/down buttons; the data model
   already supports arbitrary order values.
4. **Image resizing/optimization** — uploads store originals; a GD/WebP pipeline
   could generate responsive variants.
5. **Content search API** — admin search filters client-side (fine at this scale).
