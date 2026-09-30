# U2I Process — Website & CMS

Website for **Univers Inox Industriel (U2I)** with a built-in admin dashboard and CMS.
Built with **React 19, TanStack Start/Router, Tailwind CSS 4** (front-end) and **PHP + MySQL** (back-end, runs on OVH shared hosting).

> **v2 modernization (2026):** the CMS now includes a homepage builder (14 section types),
> menu management (nested main/footer menus), categories & tags, a rich-text article editor,
> content workflow (draft / pending / scheduled / published / archived), automatic revisions
> with restore, per-page & per-article SEO fields, header/footer/social editors, a media
> library with metadata + drag & drop, an activity log, a dynamic sitemap
> (`/api/sitemap.php`) and a hardened security layer (rate limiting, hardened sessions,
> secure upload serving). See [docs/AUDIT.md](docs/AUDIT.md) for the full audit.
>
> **Upgrading an existing install:** re-run `/api/install.php?key=u2i-install-2024` once —
> it applies all v2 tables/columns idempotently without touching existing data.

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
8. [How to use the admin dashboard (step by step)](#8-how-to-use-the-admin-dashboard-step-by-step)
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

## 8. How to use the admin dashboard (step by step)

Everything is managed at **`https://your-domain.com/admin`** (local dev: `http://localhost:3000/admin`). No code, no FTP — every change below is visible on the public site **immediately**.

### 8.0 Log in — first time only

1. Open `/admin` → you see the one-time form **"Première utilisation : créez votre compte administrateur"**.
2. Choose an **Identifiant** (e.g. `admin`) and a password (min. 8 characters), confirm it → **Créer mon compte**.
3. You are logged in and land on the dashboard. Next visits only ask identifiant + password (**Se connecter**).
4. Forgot the password? See [Troubleshooting](#9-troubleshooting) — the account is reset in phpMyAdmin, then recreated with this form.

### 8.1 The screen layout

The **left sidebar** is the navigation; the top bar shows the current section, a green confirmation after every save, and **Voir le site** (opens the public site in a new tab).

| Sidebar item | What it manages |
| --- | --- |
| **Tableau de bord** | Overview: key numbers + quick actions + recent content/activity |
| **Contenu → Pages** | All CMS pages (content, SEO, scheduling, hierarchy, revisions) |
| **Contenu → Actualités** | News articles (rich editor, categories, tags, SEO, revisions) |
| **Contenu → Catégories / Tags** | Article taxonomy |
| **Médiathèque** | Media library (upload, drag & drop, alt/title/caption metadata) |
| **Menus** | Main & footer navigation (nested, reorder, show/hide) |
| **Page d'accueil** | Homepage builder (ordered, toggleable sections) |
| **En-tête / Pied de page** | Logo, announcement, contacts, socials, footer columns |
| **Réglages** | Site identity + default SEO |
| **Activité** | Audit log of the last 100 dashboard actions |
| **Messages** | Contact-form submissions |
| **Mon compte** | Your password |

### 8.2 Tableau de bord (home)

- **Stat cards** — published pages, published articles, images, unread messages. Click a card to jump to that section.
- **Quick actions** — *Créer une page*, *Écrire un article*, *Ajouter des images*, *Voir le site*.
- **Derniers messages** — the 5 latest contact-form submissions, unread ones highlighted.

### 8.3 Pages — create & publish a page (2 minutes)

1. **Pages** (sidebar) → **+ Nouvelle page**.
2. Fill **Titre \*** (required), e.g. `Nos services`. The **Adresse (slug)** fills itself (`nos-services`) — leave it unless you want a custom URL like `/p/services`.
3. Optional banner: **Titre du bandeau**, **Texte du bandeau**, and **Image du bandeau → Choisir…** (opens the media library: pick an image or **Téléverser une image** — upload and select happen in one click). **Surtitre** is the small line above the banner title.
4. Build the content with **+ Ajouter une section**. Each section has a type:

   | Section type | Fields | Renders on the page as |
   | --- | --- | --- |
   | *Titre de section* | Titre | big section heading |
   | *Texte* | Titre + Texte | subheading + paragraph |
   | *Image* | Légende + Image (**Choisir…**) | picture with caption |
   | *Galerie* | **Ajouter des images** (multi-select; thumbnails with ✕ to remove) | image grid |
   | *Coordonnées* | Téléphone / E-mail / Adresse | contact card |

   Reorder sections with the ↑ ↓ buttons, remove one with 🗑.
5. To show the page in the site menu, fill **Libellé dans le menu** (e.g. `Services`). Leave it **empty** to keep the page reachable only by its direct URL. The link appears in the public navbar automatically, just before *Contact*.
6. Tick **Publier immédiatement** → **Enregistrer**. The page is live at `/p/nos-services` and in the menu.

**Managing existing pages** (the list view):

| Button on a row | What it does |
| --- | --- |
| **Publiée / Brouillon** (eye icon) | Publish or unpublish in one click — a draft is hidden from the site but kept |
| **↑ / ↓** | Move the page up/down in the menu order (saved instantly) |
| **Voir** | Open the live page |
| **✏ (pencil)** | Edit title, banner, sections, menu label |
| **🗑 (trash)** | Delete permanently (asks for confirmation) |

### 8.4 Actualités — write & publish an article

1. **Actualités** (sidebar) → **+ Nouvel article**.
2. Fill **Titre \*** (required). **Adresse (slug)** auto-fills; **Auteur** is optional.
3. **Image de couverture → Choisir…** — shown on the news card and at the top of the article.
4. **Résumé** — the text displayed on the `/actualites` card.
5. **Contenu de l'article** — the body, in simple HTML:

   ```html
   <p>Premier paragraphe…</p>
   <h2>Un titre de partie</h2>
   <p>Du texte avec du <strong>gras</strong> et de l'<em>italique</em>.</p>
   <ul><li>Un élément de liste</li></ul>
   <img src="/api/uploads/xxxxxxxx.jpg" alt="">  <!-- URL copied from the Médiathèque -->
   <a href="/contact">Nous contacter</a>
   <blockquote>Une citation</blockquote>
   ```

6. Tick **Publier immédiatement** → **Enregistrer** → visible on `/actualites` and at `/actualites/<slug>`.

Row actions are the same as pages: **Publié / Brouillon** one-click toggle, **Voir**, **✏ edit** (editing keeps the original publish date), **🗑 delete**.

### 8.5 Médiathèque (image library)

- **Ajouter des images** → select one or several (JPG/PNG/WebP/GIF/SVG, max 12 MB each).
- **Copier l'URL** → paste it anywhere (e.g. an `<img>` in an article body). The **Choisir…** button inside every page/article form opens this same library with an upload button, so you never need to copy/paste URLs there.
- **🗑** removes an image from the library. ⚠ If it is still used by a page or article, replace it there first.

### 8.6 Messages (contact form)

Every submission of the public contact form arrives here. Unread ones show a red left border, a **Non lu** badge, and a red counter in the sidebar.

- **Marquer comme lu** — clears the unread state.
- **Répondre** — opens your e-mail client with the sender's address.
- **🗑** — delete the message.

### 8.7 Réglages

| Field | Used by |
| --- | --- |
| **Nom du site** | Site title (footer) |
| **E-mail de contact** | Recipient of every contact-form message |
| **Téléphone affiché** | Footer / contact blocks |
| **Adresse** | Footer |
| **Note de pied de page** | Extra footer text |

Don't forget **Enregistrer**.

### 8.8 Mon compte

Change your own password: current password + new one (min. 8 characters) → **Enregistrer**. Applies immediately.

### 8.9 Cheat sheet — "I want to…"

| I want to… | Do this |
| --- | --- |
| Add a new page to the site | Pages → **Nouvelle page** → add sections → **Publier immédiatement** → **Enregistrer** |
| Change text on an existing page | Pages → **✏** on the row → edit the section → **Enregistrer** |
| Publish news | Actualités → **Nouvel article** → **Publier immédiatement** → **Enregistrer** |
| Temporarily hide something | Click **Publiée/Publié** to switch it to **Brouillon** |
| Remove something for good | **🗑** on the row (confirm) |
| Reorder the site menu | Pages → **↑ / ↓** on the rows |
| Rename a menu entry | Pages → **✏** → **Libellé dans le menu** → **Enregistrer** |
| Replace an image | Médiathèque: upload → open the page/article → **Choisir…** → pick it → **Enregistrer** |
| Read customer inquiries | Messages |

> **Remember:** dashboard content is stored in MySQL and served live by the PHP API — you never rebuild or re-upload `dist/` for content changes. Only code/design changes need a new build (section 4).

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
