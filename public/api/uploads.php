<?php
/**
 * U2I Process — safe upload file server.
 * Serves /api/uploads/<name> with hardened headers (strict CSP for SVG/PDF,
 * correct MIME types, nosniff). Used as a fallback when the static file is
 * not reachable directly (e.g. rewritten by the SPA fallback rule).
 */

declare(strict_types=1);
require __DIR__ . '/config.php';

$name = $_GET['f'] ?? '';
// strpos() rather than str_contains(): the project targets PHP 7.4+, where
// str_contains() does not exist and this file would fatal on every request.
if (!is_string($name) || $name === '' || strpos($name, '/') !== false || strpos($name, '\\') !== false) {
    http_response_code(400);
    exit('Bad request');
}

serve_upload($name);
