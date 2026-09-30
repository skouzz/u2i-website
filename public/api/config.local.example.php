<?php
/**
 * Local development configuration (XAMPP).
 *
 * Copy this file to `config.local.php` (same folder) and adjust the values.
 * config.local.php is git-ignored and blocked from HTTP access.
 *
 * XAMPP defaults: MySQL user "root" with an empty password,
 * phpMyAdmin at http://localhost/phpmyadmin
 */

declare(strict_types=1);

define('DB_HOST', '127.0.0.1');
define('DB_NAME', 'u2i_cms');
define('DB_USER', 'root');
define('DB_PASS', '');

// Admin dashboard login for local development.
// Generate a hash with: php -r "echo password_hash('admin123', PASSWORD_DEFAULT);"
define('DEFAULT_ADMIN_USER', 'admin');
define('DEFAULT_ADMIN_HASH', '$2y$10$Q2HbDlzXQfBiOqSJVspVXuEBKnMCQCc1oQmGhJq3KqfG1rOeC5lEe'); // "admin123"

// Optional transactional email API key (empty = use PHP mail()).
define('PLUNK_API_KEY', '');
