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
if (!is_string($name) || $name === '' || str_contains($name, '/') || str_contains($name, '\\')) {
    http_response_code(400);
    exit('Bad request');
}

serve_upload($name);
