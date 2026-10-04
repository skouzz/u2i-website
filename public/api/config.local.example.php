<?php
/**
 * U2I Process — local/server credentials TEMPLATE.
 *
 * Copy this file to `config.local.php` (same directory) and fill in your real
 * values. `config.local.php` is git-ignored and blocked from HTTP access by
 * .htaccess, which is what makes it the safe place for credentials.
 *
 * Never put real credentials in config.php — that file is committed.
 */

declare(strict_types=1);

// ── XAMPP / local development (defaults shipped with XAMPP) ────────────────
define('DB_HOST', 'localhost');
define('DB_NAME', 'u2i_cms');
define('DB_USER', 'root');
define('DB_PASS', '');

// ── OVH production ─────────────────────────────────────────────────────────
// From OVH Control Panel → Web Cloud → Databases → your MySQL database.
// On OVH both the database name and the user usually carry a hosting prefix,
// e.g. `xxxxxxx_yourdbname`.
//
// define('DB_HOST', 'your-account.mysql.db');
// define('DB_NAME', 'yourprefix_yourdbname');
// define('DB_USER', 'yourprefix_yourdbname');
// define('DB_PASS', 'your-real-password');

// Optional: contact-form provider. Leave empty to fall back to PHP mail().
// define('PLUNK_API_KEY', '...');
