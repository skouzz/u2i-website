# U2I Process — Website & CMS

Website for **Univers Inox Industriel (U2I)** with a built-in admin dashboard and CMS.
Built with **React 19, TanStack Start/Router, Tailwind CSS 4** (front-end) and **PHP + MySQL** (back-end, runs on OVH shared hosting).

This README explains **exactly** how to run the project, step by step.

---

## Table of contents

1. [Prerequisites](#1-prerequisites)
2. [Run the project locally — two options](#2-run-the-project-locally--two-options) (front-end only, or **full stack with XAMPP**)
3. [Build for production](#3-build-for-production)
4. [Deploy to OVH web hosting](#4-deploy-to-ovh-web-hosting)
5. [Set up the MySQL database (OVH)](#5-set-up-the-mysql-database-ovh)
6. [Configure the back-end](#6-configure-the-back-end)
7. [Install the CMS tables & log in to the dashboard](#7-install-the-cms-tables--log-in-to-the-dashboard)
8. [Manage the website (no code)](#8-manage-the-website-no-code)
9. [Troubleshooting](#9-troubleshooting)
10. [Project structure](#10-project-structure)

---

## 1. Prerequisites

| Tool | Version | Why |
| --- | --- | --- |
| [Node.js](https://nodejs.org) | **20.19+ or 22.12+** | Runs Vite / the build |
| npm | Bundled with Node | Installs dependencies |
| PHP | **7.4+** (selectable in the OVH panel) | Only needed **on the OVH server**, not on your PC |

No database is needed for local development — the site works without MySQL and shows a friendly message where CMS content would appear.

---

## 2. Run the project locally — two options

### Option A — front-end only (no XAMPP needed)

```bash
# 1. Install dependencies (first time only, and after pulling new code)
npm install

# 2. Start the dev server
npm run dev
```

Open the URL printed in the terminal (usually `http://localhost:3000`).
All pages render, but the CMS/admin/DB features need PHP (see Option B).

### Option B — full stack with XAMPP (Apache + MySQL + phpMyAdmin) ✅

Everything runs on your machine exactly like on OVH.

#### B1. Start XAMPP

Open the **XAMPP Control Panel** and click **Start** on:

- **Apache** (runs PHP; default port 80)
- **MySQL** (runs the database; default port 3306)

#### B2. Put the project inside XAMPP's web root

The PHP files must be reachable by Apache. Clone/copy the project into
`C:\xampp\htdocs\` (Windows) or `/opt/lampp/htdocs/` (Linux/macOS), e.g.:

```
C:\xampp\htdocs\u2i-website\
```

The rest of this guide assumes that folder name.

#### B3. Create the database in phpMyAdmin

1. Open `http://localhost/phpmyadmin`
2. Click **New** in the left sidebar → database name: **`u2i_cms`** → collation `utf8mb4_unicode_ci` → **Create**
3. Select the `u2i_cms` database → **Import** tab → choose the file **`database/schema.sql`** from the project → **Go**
4. You should see 7 tables appear: `settings`, `pages`, `page_blocks`, `articles`, `media`, `contact_messages`, `admins`

#### B4. Create the local PHP config

In the folder `public/api/`, **copy** `config.local.example.php` and **rename** the copy to **`config.local.php`**.
The shipped defaults already match XAMPP (`root`, empty password, DB `u2i_cms`). The admin account is created on first login at `/admin` (setup form) — no password to configure here.

#### B5. Point the Vite dev server at Apache

The Vite dev proxy is pre-configured to forward `/api/*` to Apache. If your project folder name is **not** `u2i-website`, edit `vite.config.ts`:

```ts
server: {
  proxy: {
    "/api": {
      target: "http://localhost/u2i-website/public", // ← your folder name
      changeOrigin: true,
    },
  },
},
```

#### B6. Run it

```bash
npm install   # first time only
npm run dev
```

Open `http://localhost:3000`:

- The site works like in production
- **`http://localhost:3000/admin`** — first visit: create your admin account (setup form), then log in with it
- CMS pages, articles, media uploads, and contact messages all hit your **local MySQL** via phpMyAdmin-visible data
- Uploads land in `public/api/uploads/`

> You now have the **exact same stack as production**: Vite serves the React site, Apache executes the PHP API, MySQL stores the content.

Other useful commands:

```bash
npm run lint      # ESLint
npm run format    # Prettier (write)
```

---

## 3. Build for production

```bash
npm run build
```

The build runs TanStack Start in **SPA mode** and produces a **fully static site**:

```
dist/
├── client/          ← ✅ THIS is what you upload to OVH
│   ├── index.html, about/, contact/, …   (prerendered pages)
│   ├── assets/      (JS/CSS/images, hashed filenames)
│   ├── api/         (PHP back-end: cms.php, admin.php, contact.php, config.php, install.php)
│   └── .htaccess    (Apache rules: SPA fallback, gzip, cache)
└── server/          ← ❌ SSR artifacts — NOT needed on OVH, ignore it
```

---

## 4. Deploy to OVH web hosting

Works with any OVH **shared hosting** plan (Starter, Perso, Pro…).

1. Run the build: `npm run build`
2. Open **OVH Control Panel → Web Cloud → your hosting → FTP (FileZilla)** — or use the OVH file manager. The credentials are shown in the same section.
3. Connect and go to the web root folder: `www/`
4. Upload **the contents of `dist/client/`** (not the `client` folder itself) into `www/`:
   - `assets/`, `api/`, all `.html` files and folders
   - `.htaccess` — **must be uploaded too** (in FileZilla enable *Server → Force showing hidden files* to see it)
5. In the OVH panel check **Hosting → PHP version → 7.4 or higher**.
6. Visit `https://your-domain.com` — the site is live. ✅

At this point everything works except CMS/DB features (steps 5–7 enable them). The contact form already sends e-mails via OVH's `mail()`.

> Re-deploying after a code change = rebuild (`npm run build`) + re-upload. **Content edited in the dashboard does NOT require a rebuild** — it is stored in MySQL and served by the PHP API at runtime.

---

## 5. Set up the MySQL database (OVH)

1. OVH Control Panel → **Web Cloud → Databases → Create a database**
2. Choose **MySQL**, pick a version (8.x recommended), a name and a password.
   - On OVH the final database name and user usually get a prefix like `u2iprocess_dbname`.
3. Wait a few minutes for provisioning.
4. Note down the four values OVH shows you:
   - **Server / host**: something like `u2iprocesscom.mysql.db`
   - **Database name**: e.g. `u2iprocesscomdb`
   - **User**: usually the same as the database name
   - **Password**: the one you just set
5. (Optional) Click the database → **phpMyAdmin** tab to inspect/backup data. The app itself never needs phpMyAdmin — it connects directly.

---

## 6. Configure the back-end

Edit `public/api/config.php` (top of the file) — the production values:

```php
const DB_HOST = 'u2iprocesscom.mysql.db';   // from step 5.4
const DB_NAME = 'u2iprocesscomdb';
const DB_USER = 'u2iprocesscomdb';
const DB_PASS = 'YOUR_REAL_PASSWORD';       // ← never commit the real one
```

> Local development never touches `config.php` — values from `public/api/config.local.php` (XAMPP) override it at runtime.

**Admin account:** no default password exists. On the **first login** at `/admin`, the dashboard shows a one-time **account creation** form (like WordPress): choose your identifiant and a password (min. 8 chars) — it is stored bcrypt-hashed in the `admins` table. You can change it later under *Mon compte*.

Then **re-upload `public/api/config.php`** to `www/api/` on the server.

Optional — better e-mail deliverability: set `PLUNK_API_KEY` at the top of `public/api/contact.php` ([Plunk](https://useplunk.com)). Without it, OVH `mail()` is used.

---

## 7. Install the CMS tables & log in to the dashboard

1. Open **once** in a browser:

   ```
   https://your-domain.com/api/install.php?key=u2i-install-2024
   ```

   You should see: `{"ok":true,"message":"Base de données installée…"}`. The tables (`pages`, `page_blocks`, `articles`, `media`, `contact_messages`, `settings`, `admins`) are created. The default admin account (from your config, or `admin` / `changeme`) is seeded into the `admins` table.

2. **Delete `public/api/install.php` from the server** (or change `INSTALL_KEY` first) — it's a one-time tool.

3. Go to **`https://your-domain.com/admin`** — the first visit shows the **account creation form** (choose identifiant + password). Next visits show the normal login.

4. Go to **Réglages (Settings)** and save your contact e-mail / phone — the contact form uses them.

Done — the full CMS is active. 🎉

---

## 8. Manage the website (no code)

All at `https://your-domain.com/admin`:

| Section | What you can do |
| --- | --- |
| **Pages & sections** | Create pages with a hero banner + reorderable blocks (heading, text, image, gallery, contact info). Add a *menu label + order* to make them appear in the site navigation. Published pages are visible at `/p/<slug>`. |
| **Actualités** | Write news articles (title, cover image, summary, simple HTML body). They appear on `/actualites` and `/actualites/<slug>`. |
| **Médiathèque** | Upload images (JPG/PNG/WebP/GIF/SVG, max 12 MB), copy their URL, paste it into pages/articles. |
| **Messages** | Every contact-form submission is stored here: mark read, reply by e-mail, delete. |
| **Réglages** | Site name, contact e-mail (form recipient), phone, address, footer note. |
| **Mon compte** | Change the admin password (stored bcrypt-hashed in the `admins` table). |

Workflow: log in → edit → **Save** → refresh the public page. Changes are live immediately; no rebuild, no FTP.

---

## 9. Troubleshooting

| Symptom | Cause & fix |
| --- | --- |
| Page refresh on `/contact` gives a 404 | `.htaccess` is missing on the server (hidden file — enable "show hidden files" in FileZilla). |
| News page says the CMS is not installed | You skipped step 7.1 (run `/api/install.php?key=…` once). |
| Admin login fails with correct credentials | The account was created before a schema change — re-run `/api/install.php?key=…` (it does not overwrite data) or reset the account in phpMyAdmin: `DELETE FROM admins;` then reload `/admin` to recreate it via the setup form. |
| `{"ok":false,…}` from `/api/cms.php` or a 503 | DB constants in `config.php` are wrong, or the database isn't created yet (step 5). |
| Contact form says "Impossible d'envoyer…" | OVH `mail()` is limited on some offers — set up a [Plunk](https://useplunk.com) API key (step 6) or check with OVH support. |
| Uploaded images don't appear | Check `www/api/uploads/` exists and is writable (OVH default is fine; re-upload creates it). |
| White page after deploy | You uploaded the `client` folder itself instead of its **contents** (step 4.4). |

---

## 10. Project structure

```
public/
├── .htaccess                  Apache rules (SPA fallback, gzip, cache, security)
└── api/
    ├── config.php             DB constants, PDO, sessions, CSRF, uploads
    ├── install.php            One-time table installer (delete after use)
    ├── cms.php                Public read-only content API
    ├── admin.php              Authenticated admin API (session + CSRF)
    ├── contact.php            Contact form: MySQL storage + e-mail sending
    └── uploads/               Uploaded images (created on first upload)

src/
├── routes/                    File-based routes (TanStack Router)
│   ├── index.tsx, about.tsx, …
│   ├── actualites/            News list + article detail
│   └── admin.tsx              /admin dashboard entry
├── features/
│   ├── admin/                 Dashboard UI (pages, articles, media, messages, settings)
│   ├── news/                  Public news pages
│   ├── cms-page/              Renderer for CMS-managed pages
│   └── contact/               Contact page + form logic
├── lib/
│   ├── cms.ts                 Typed client for the PHP API
│   └── errors/                SSR error helpers
├── components/layout/         Navbar, Footer
└── styles.css                 Global styles & design tokens

docs/routing.md                Route file conventions
```

**Front-end stack:** React 19, TanStack Start (SPA mode), TanStack Router + Query, Tailwind CSS 4, Framer Motion, lucide-react.
**Back-end stack:** plain PHP 7.4+ (no framework, no Composer), MySQL via PDO, sessions + CSRF, file uploads.
