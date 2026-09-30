<?php
/**
 * Local development configuration (XAMPP).
 *
 * Copy this file to `config.local.php` (same folder) and adjust the values.
 * config.local.php is loaded FIRST by config.php and may override any of the
 * production defaults (DB, admin fallback, Plunk key). It is git-ignored and
 * blocked from HTTP access by .htaccess.
 *
 * XAMPP defaults: MySQL user "root" with an empty password,
 * phpMyAdmin at http://localhost/phpmyadmin
 *
 * Admin account: you do NOT need to define credentials here. On first login
 * at /admin the dashboard shows a one-time "create the admin account" form.
 */

declare(strict_types=1);

define('DB_HOST', '127.0.0.1');
define('DB_NAME', 'u2i_cms');
define('DB_USER', 'root');
define('DB_PASS', '');

// Optional: force fallback admin credentials (used only if the DB is down).
// The hash must come from: php -r "echo password_hash('yourpass', PASSWORD_DEFAULT);"
// define('DEFAULT_ADMIN_USER', 'admin');
// define('DEFAULT_ADMIN_HASH', '$2y$10$…');

// Optional transactional email API key (empty = use PHP mail()).
define('PLUNK_API_KEY', '');
