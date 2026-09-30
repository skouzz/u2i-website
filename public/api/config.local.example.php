<?php
/**
 * Local development configuration (XAMPP).
 *
 * Copy this file to `config.local.php` (same folder) and adjust the values.
 * config.local.php is git-ignored and blocked from HTTP access.
 *
 * XAMPP defaults: MySQL user "root" with an empty password,
 * phpMyAdmin at http://localhost/phpmyadmin
 *
 * Admin account: you do NOT need to define credentials here. On first login
 * at /admin the dashboard shows a one-time "create the admin account" form.
 * Optionally you can still force specific credentials:
 *
 *   define('DEFAULT_ADMIN_USER', 'admin');
 *   define('DEFAULT_ADMIN_HASH', password_hash('yourpassword', PASSWORD_DEFAULT));
 */

declare(strict_types=1);

define('DB_HOST', '127.0.0.1');
define('DB_NAME', 'u2i_cms');
define('DB_USER', 'root');
define('DB_PASS', '');

// Optional transactional email API key (empty = use PHP mail()).
define('PLUNK_API_KEY', '');
