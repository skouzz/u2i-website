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

/** Map a raw pages row to the camelCase shape the site expects. */
function map_public_page(array $row): array
{
    return [
        'id' => (int) $row['id'],
        'slug' => (string) $row['slug'],
        'title' => (string) $row['title'],
        'eyebrow' => $row['eyebrow'] ?? null,
        'heroTitle' => $row['hero_title'] ?? null,
        'heroText' => $row['hero_text'] ?? null,
        'heroImageUrl' => $row['hero_image_url'] ?? null,
    ];
}

/** Map a raw articles row to the camelCase shape the site expects. */
function map_public_article(array $row): array
{
    return [
        'id' => (int) $row['id'],
        'slug' => (string) $row['slug'],
        'title' => (string) $row['title'],
        'excerpt' => $row['excerpt'] ?? null,
        'body' => $row['body'] ?? null,
        'coverImageUrl' => $row['cover_image_url'] ?? null,
        'author' => $row['author'] ?? null,
        // ISO 8601 so new Date() parses it in every browser.
        'publishedAt' => !empty($row['published_at']) ? str_replace(' ', 'T', (string) $row['published_at']) : null,
    ];
}

/** Map a raw page_blocks row (images_json decoded into images[]). */
function map_public_block(array $row): array
{
    $images = null;
    if (!empty($row['images_json'])) {
        $decoded = json_decode((string) $row['images_json'], true);
        if (is_array($decoded)) {
            $images = array_values(array_map('strval', $decoded));
        }
    }

    return [
        'type' => (string) $row['type'],
        'title' => $row['title'] ?? null,
        'body' => $row['body'] ?? null,
        'imageUrl' => $row['image_url'] ?? null,
        'images' => $images,
    ];
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
                 WHERE is_published = 1 AND nav_label IS NOT NULL AND nav_label <> \'\'
                 ORDER BY nav_order ASC, id ASC'
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

            json_response(['ok' => true, 'page' => map_public_page($page), 'blocks' => array_map('map_public_block', $blocks->fetchAll())]);

        case 'articles':
            $rows = db()->query(
                'SELECT id, slug, title, excerpt, cover_image_url, author, published_at
                 FROM articles
                 WHERE is_published = 1 AND published_at IS NOT NULL AND published_at <= NOW()
                 ORDER BY published_at DESC
                 LIMIT 100'
            )->fetchAll();
            json_response(['ok' => true, 'items' => array_map('map_public_article', $rows)]);

        case 'article':
            if ($param === '') {
                json_response(['ok' => false, 'message' => 'Missing slug.'], 400);
            }
            $stmt = db()->prepare('SELECT id, slug, title, excerpt, body, cover_image_url, author, published_at FROM articles WHERE slug = ? AND is_published = 1 AND published_at IS NOT NULL AND published_at <= NOW() LIMIT 1');
            $stmt->execute([$param]);
            $article = $stmt->fetch();
            if (!$article) {
                json_response(['ok' => false, 'message' => 'Article introuvable.'], 404);
            }
            json_response(['ok' => true, 'article' => map_public_article($article)]);

        default:
            json_response(['ok' => false, 'message' => 'Unknown resource.'], 404);
    }
} catch (Throwable $e) {
    json_response(['ok' => false, 'message' => 'Base de données non disponible. Exécutez /api/install.php.'], 503);
}
