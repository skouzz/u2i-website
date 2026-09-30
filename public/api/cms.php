<?php
/**
 * U2I Process — public CMS API.
 * Read-only endpoints used by the React site: settings, nav, pages (by slug),
 * articles (list & detail). No authentication required.
 */

declare(strict_types=1);
require __DIR__ . '/config.php';

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$resource = $_GET['r'] ?? '';
$param = $_GET['p'] ?? '';

if ($method !== 'GET') {
    json_response(['ok' => false, 'message' => 'Method not allowed.'], 405);
}

try {
    switch ($resource) {
        case 'settings':
            $row = db()->query('SELECT site_name, contact_email, contact_phone, address, footer_note FROM settings WHERE id = 1')->fetch();
            json_response(['ok' => true, 'settings' => $row ?: null]);

        case 'nav':
            $stmt = db()->query(
                'SELECT slug, COALESCE(nav_label, title) AS label, nav_order
                 FROM pages
                 WHERE is_published = 1 AND nav_order > 0
                 ORDER BY nav_order ASC'
            );
            json_response(['ok' => true, 'items' => $stmt->fetchAll()]);

        case 'page':
            if ($param === '') {
                json_response(['ok' => false, 'message' => 'Missing slug.'], 400);
            }
            $stmt = db()->prepare('SELECT id, slug, title, eyebrow, hero_title, hero_text, hero_image_url FROM pages WHERE slug = ? AND is_published = 1 LIMIT 1');
            $stmt->execute([$param]);
            $page = $stmt->fetch();
            if (!$page) {
                json_response(['ok' => false, 'message' => 'Page introuvable.'], 404);
            }

            $blocks = db()->prepare('SELECT type, title, body, image_url, images_json FROM page_blocks WHERE page_id = ? ORDER BY sort_order ASC');
            $blocks->execute([(int) $page['id']]);

            json_response(['ok' => true, 'page' => $page, 'blocks' => $blocks->fetchAll()]);

        case 'articles':
            $stmt = db()->query(
                'SELECT id, slug, title, excerpt, cover_image_url, author, published_at
                 FROM articles
                 WHERE is_published = 1 AND published_at <= NOW()
                 ORDER BY published_at DESC
                 LIMIT 100'
            );
            json_response(['ok' => true, 'items' => $stmt->fetchAll()]);

        case 'article':
            if ($param === '') {
                json_response(['ok' => false, 'message' => 'Missing slug.'], 400);
            }
            $stmt = db()->prepare('SELECT id, slug, title, excerpt, body, cover_image_url, author, published_at FROM articles WHERE slug = ? AND is_published = 1 AND published_at <= NOW() LIMIT 1');
            $stmt->execute([$param]);
            $article = $stmt->fetch();
            if (!$article) {
                json_response(['ok' => false, 'message' => 'Article introuvable.'], 404);
            }
            json_response(['ok' => true, 'article' => $article]);

        default:
            json_response(['ok' => false, 'message' => 'Unknown resource.'], 404);
    }
} catch (Throwable $e) {
    json_response(['ok' => false, 'message' => 'Base de données non disponible. Exécutez /api/install.php.'], 503);
}
