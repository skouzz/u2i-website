# U2I Process

Website for Univers Inox Industriel, built with React, TanStack Start, TanStack Router, and Tailwind CSS.

## Development

```sh
npm install
npm run dev
```

## Production (static build for OVH web hosting)

```sh
npm run build
```

The build runs TanStack Start in **SPA mode**: it compiles the site to fully static files with no Node server required.

- `dist/client/` — everything you upload to the hosting (static assets, prerendered pages, `.htaccess`)
- `dist/server/` — SSR artifacts, **not needed** for OVH; you can ignore/delete it

### Deploying to OVH web hosting (Apache)

1. `npm run build`
2. Upload **the contents of `dist/client/`** (not the folder itself) into your hosting's web root, e.g. `www/` via FTP (FileZilla) or OVH's file manager.
3. Keep the included `.htaccess` file in place: it rewrites unknown URLs (e.g. `/contact` on refresh) to the SPA shell `_shell.html`, enables gzip and sets cache headers.
4. All routes (`/`, `/about`, `/contact`, `/equipements`, `/references`, `/secteurs`, `/actualites`) are prerendered as static HTML, so they work on direct visits and are SEO-friendly. `/admin` and CMS pages are served by the SPA shell automatically.

### Contact form backend (PHP)

The contact form posts to `api/contact.php`, which is copied into the build output by Vite and runs natively on OVH's Apache + PHP hosting — no extra setup needed.

- Validates input server-side (lengths, e-mail format) and rejects non-POST/foreign-origin requests
- Spam protection: hidden honeypot field + one-submission-per-minute throttle per IP
- Delivery: uses the [Plunk](https://useplunk.com) transactional email API when `PLUNK_API_KEY` is set (recommended — better deliverability), and otherwise falls back to PHP's built-in `mail()` which OVH enables by default
- Every message is also stored in MySQL and visible in the admin dashboard

## CMS: admin dashboard + MySQL (OVH)

The site includes a small CMS so content can be managed **without code**, at `https://votre-domaine.com/admin`:

- **Pages & sections** — create pages with a hero banner and reorderable blocks (heading, text, image, gallery, contact info). Published pages appear at `/p/<slug>` and can be added to the menu (label + order).
- **Actualités (articles)** — write news with cover image, summary, simple HTML body. Published articles appear on `/actualites` and `/actualites/<slug>`.
- **Médiathèque** — upload images (JPG/PNG/WebP/GIF/SVG, max 12 MB), copy their URL into pages/articles.
- **Messages** — every contact-form submission is stored here (read/unread, reply, delete).
- **Réglages** — site name, contact e-mail (recipient of the form), phone, address, footer note.

### 1. Create the MySQL database (OVH)

OVH Control Panel → **Web Cloud → Databases → Create a database** (MySQL). Note the server (`xxxxx.mysql.db`), database name, user and password. phpMyAdmin is available from the same section (useful to inspect/backup data; the app itself never needs it).

### 2. Configure and install

1. Fill the four constants at the top of `public/api/config.php` (`DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASS`) — or define them as OVH environment variables.
2. Change the admin credentials: set `DEFAULT_ADMIN_HASH` to a bcrypt hash of your password (`php -r "echo password_hash('VotreMotDePasse', PASSWORD_DEFAULT);"`) or define `U2I_ADMIN_USER` / `U2I_ADMIN_HASH` as OVH env vars. **The default is `admin` / `changeme` — change it.**
3. Deploy (build + upload `dist/client/` as described above).
4. Open **once** `https://votre-domaine.com/api/install.php?key=u2i-install-2024` to create the tables, then delete `public/api/install.php` from the hosting (or change the key).

If the database is not installed yet, the site keeps working: news shows an explanatory message and the contact form just skips storage.

### PHP files (copied into the build by Vite)

| File | Role |
| --- | --- |
| `api/config.php` | DB constants, PDO, sessions, CSRF, uploads (blocked from direct access) |
| `api/install.php` | One-time table installer |
| `api/cms.php` | Public read-only content API (settings, nav, pages, articles) |
| `api/admin.php` | Authenticated admin API (session + CSRF) |
| `api/contact.php` | Contact form: stores in MySQL + sends e-mail |
| `api/uploads/` | Uploaded images (created on first upload) |

## Source Layout

- `src/routes`: Thin, file-based TanStack route declarations. Keep URL and route configuration here.
- `src/features`: Page components and feature-specific content, grouped by page.
- `src/components/layout`: Shared site header and footer.
- `src/assets`: Site photography, logos, certificates, videos, and equipment imagery.
- `src/lib/cms.ts`: Typed client for the OVH PHP/MySQL CMS (public + admin endpoints).
- `src/features/admin`: Admin dashboard UI (`/admin`).
- `src/features/news`, `src/features/cms-page`: News pages and CMS-driven page renderer.
- `src/lib/errors`: Server error capture and display helpers.
- `src/styles.css`: Global styles and design tokens.
- `docs/routing.md`: Route file conventions and generated route tree notes.


