<?php
/**
 * U2I Process — public CMS API.
 * Read-only endpoints used by the React site: settings, nav (menus with
 * legacy fallback), pages (by slug), articles (list & detail), home blocks.
 * No authentication required.
 */

declare(strict_types=1);
require __DIR__ . '/config.php';

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$resource = $_GET['r'] ?? '';
$param = $_GET['p'] ?? '';

if ($method !== 'GET') {
    json_response(['ok' => false, 'message' => 'Method not allowed.'], 405);
}

/**
 * Draft preview: when a logged-in admin opens ?preview=1, unpublished pages
 * and articles become visible to them only. Everyone else keeps the strict
 * published-only behavior.
 */
$adminPreview = false;
if (isset($_GET['preview']) && $_GET['preview'] === '1') {
    admin_session_start();
    $adminPreview = !empty($_SESSION['admin']);
}

/** Map a raw pages row to the camelCase shape the site expects. */
function map_public_page(array $row): array
{
    $seo = null;
    if (!empty($row['seo_json'])) {
        $decoded = json_decode((string) $row['seo_json'], true);
        if (is_array($decoded)) {
            $seo = $decoded;
        }
    }

    return [
        'id' => (int) $row['id'],
        'slug' => (string) $row['slug'],
        'title' => (string) $row['title'],
        'eyebrow' => $row['eyebrow'] ?? null,
        'heroTitle' => $row['hero_title'] ?? null,
        'heroText' => $row['hero_text'] ?? null,
        'heroImageUrl' => $row['hero_image_url'] ?? null,
        'seo' => $seo,
    ];
}

/** Map a raw articles row to the camelCase shape the site expects. */
function map_public_article(array $row): array
{
    $seo = null;
    if (!empty($row['seo_json'])) {
        $decoded = json_decode((string) $row['seo_json'], true);
        if (is_array($decoded)) {
            $seo = $decoded;
        }
    }

    return [
        'id' => (int) $row['id'],
        'slug' => (string) $row['slug'],
        'title' => (string) $row['title'],
        'excerpt' => $row['excerpt'] ?? null,
        'body' => $row['body'] ?? null,
        'coverImageUrl' => $row['cover_image_url'] ?? null,
        'author' => $row['author'] ?? null,
        'categoryId' => isset($row['category_id']) && $row['category_id'] !== null ? (int) $row['category_id'] : null,
        // ISO 8601 so new Date() parses it in every browser.
        'publishedAt' => !empty($row['published_at']) ? str_replace(' ', 'T', (string) $row['published_at']) : null,
        'seo' => $seo,
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

/** Map a content_blocks row (homepage builder). */
function map_public_home_block(array $row): array
{
    $config = null;
    if (!empty($row['config_json'])) {
        $decoded = json_decode((string) $row['config_json'], true);
        if (is_array($decoded)) {
            $config = $decoded;
        }
    }

    return [
        'type' => (string) $row['type'],
        'title' => $row['title'] ?? null,
        'subtitle' => $row['subtitle'] ?? null,
        'body' => $row['body'] ?? null,
        'imageUrl' => $row['image_url'] ?? null,
        'config' => $config,
        'sortOrder' => (int) $row['sort_order'],
    ];
}

/** Menu tree for the public site (nested one level for dropdowns). */
function public_menu_tree(int $menuId): array
{
    $stmt = db()->prepare('SELECT * FROM menu_items WHERE menu_id = ? AND is_enabled = 1 ORDER BY sort_order ASC, id ASC');
    $stmt->execute([$menuId]);
    $rows = $stmt->fetchAll();
    $items = [];
    $children = [];
    foreach ($rows as $row) {
        $mapped = [
            'id' => (int) $row['id'],
            'label' => (string) $row['label'],
            'url' => (string) $row['url'],
            'opensNewTab' => (bool) $row['opens_new_tab'],
        ];
        if ($row['parent_id'] === null) {
            $mapped['children'] = [];
            $items[$mapped['id']] = $mapped;
        } else {
            $children[(int) $row['parent_id']][] = $mapped;
        }
    }
    $tree = [];
    foreach ($items as $item) {
        $item['children'] = $children[$item['id']] ?? [];
        $tree[] = $item;
    }

    return $tree;
}

try {
    switch ($resource) {
        case 'settings':
            $row = db()->query('SELECT site_name, contact_email, contact_phone, address, footer_note, header_json, footer_json, seo_json, social_json FROM settings WHERE id = 1')->fetch();
            if ($row) {
                foreach (['header_json', 'footer_json', 'seo_json', 'social_json'] as $col) {
                    $row[$col] = !empty($row[$col]) ? json_decode((string) $row[$col], true) : null;
                }
            }
            json_response(['ok' => true, 'settings' => $row ?: null]);

        case 'nav':
            // Primary source: menu_items for the 'main' menu location.
            try {
                $menu = db()->query("SELECT id FROM menus WHERE location = 'main' LIMIT 1")->fetch();
                if ($menu) {
                    json_response(['ok' => true, 'items' => public_menu_tree((int) $menu['id']), 'source' => 'menu']);
                }
            } catch (Throwable $e) {
                // Fall through to legacy pages-based nav.
            }
            // Legacy fallback: pages with a nav label (pre-v2 behavior).
            $stmt = db()->query(
                'SELECT slug, COALESCE(nav_label, title) AS label, nav_order
                 FROM pages
                 WHERE status = \'published\' AND nav_label IS NOT NULL AND nav_label <> \'\'
                 ORDER BY nav_order ASC, id ASC'
            );
            json_response(['ok' => true, 'items' => $stmt->fetchAll(), 'source' => 'pages']);

        case 'footer_menu':
            try {
                $menu = db()->query("SELECT id FROM menus WHERE location = 'footer' LIMIT 1")->fetch();
                if ($menu) {
                    json_response(['ok' => true, 'items' => public_menu_tree((int) $menu['id'])]);
                }
            } catch (Throwable $e) {
            }
            json_response(['ok' => true, 'items' => []]);

        case 'page':
            if ($param === '') {
                json_response(['ok' => false, 'message' => 'Missing slug.'], 400);
            }
            $stmt = db()->prepare('SELECT id, slug, title, eyebrow, hero_title, hero_text, hero_image_url, status, seo_json FROM pages WHERE slug = ? AND status = \'published\' LIMIT 1');
            $stmt->execute([$param]);
            $page = $stmt->fetch();
            if (!$page && $adminPreview) {
                // Draft/scheduled preview — admins only (see $adminPreview).
                $stmt = db()->prepare('SELECT id, slug, title, eyebrow, hero_title, hero_text, hero_image_url, status, seo_json FROM pages WHERE slug = ? LIMIT 1');
                $stmt->execute([$param]);
                $page = $stmt->fetch();
            }
            if (!$page) {
                json_response(['ok' => false, 'message' => 'Page introuvable.'], 404);
            }

            $blocks = db()->prepare('SELECT type, title, body, image_url, images_json, is_visible FROM page_blocks WHERE page_id = ? AND is_visible = 1 ORDER BY sort_order ASC');
            $blocks->execute([(int) $page['id']]);

            json_response(['ok' => true, 'page' => map_public_page($page), 'blocks' => array_map('map_public_block', $blocks->fetchAll())]);

        case 'articles':
            $rows = db()->query(
                'SELECT id, slug, title, excerpt, cover_image_url, author, category_id, published_at
                 FROM articles
                 WHERE status = \'published\' AND published_at IS NOT NULL AND published_at <= NOW()
                 ORDER BY published_at DESC
                 LIMIT 100'
            )->fetchAll();
            json_response(['ok' => true, 'items' => array_map('map_public_article', $rows)]);

        case 'article':
            if ($param === '') {
                json_response(['ok' => false, 'message' => 'Missing slug.'], 400);
            }
            $stmt = db()->prepare('SELECT id, slug, title, excerpt, body, cover_image_url, author, category_id, published_at, status, seo_json FROM articles WHERE slug = ? AND status = \'published\' AND published_at IS NOT NULL AND published_at <= NOW() LIMIT 1');
            $stmt->execute([$param]);
            $article = $stmt->fetch();
            if (!$article && $adminPreview) {
                $stmt = db()->prepare('SELECT id, slug, title, excerpt, body, cover_image_url, author, category_id, published_at, status, seo_json FROM articles WHERE slug = ? LIMIT 1');
                $stmt->execute([$param]);
                $article = $stmt->fetch();
            }
            if (!$article) {
                json_response(['ok' => false, 'message' => 'Article introuvable.'], 404);
            }
            $payload = map_public_article($article);
            // Attach tags.
            try {
                $tags = db()->prepare('SELECT t.slug, t.name FROM tags t JOIN article_tags x ON x.tag_id = t.id WHERE x.article_id = ? ORDER BY t.name');
                $tags->execute([(int) $article['id']]);
                $payload['tags'] = $tags->fetchAll();
            } catch (Throwable $e) {
                $payload['tags'] = [];
            }
            json_response(['ok' => true, 'article' => $payload]);

        case 'home':
            $rows = db()->query('SELECT * FROM content_blocks WHERE is_visible = 1 ORDER BY sort_order ASC, id ASC')->fetchAll();
            json_response(['ok' => true, 'items' => array_map('map_public_home_block', $rows)]);

        case 'categories':
            $rows = db()->query('SELECT c.id, c.slug, c.name, (SELECT COUNT(*) FROM articles a WHERE a.category_id = c.id AND a.status = \'published\') AS article_count FROM categories c ORDER BY c.name ASC')->fetchAll();
            json_response(['ok' => true, 'items' => $rows]);

        default:
            json_response(['ok' => false, 'message' => 'Unknown resource.'], 404);
    }
} catch (Throwable $e) {
    json_response(['ok' => false, 'message' => 'Base de données non disponible. Exécutez /api/install.php.'], 503);
}
