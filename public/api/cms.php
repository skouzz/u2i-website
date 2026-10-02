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

// ── i18n ────────────────────────────────────────────────────────────────────
// French is the source language and is served from the root; ?lang=en (sent by
// the /en routes) serves the English overlay. Untranslated fields fall back to
// French so a half-translated site never shows blanks.
$lang = current_lang();

/** Translatable columns for a pages row, as [dbColumn => jsonKey]. */
const I18N_PAGE_FIELDS = [
    'title' => 'title',
    'eyebrow' => 'eyebrow',
    'hero_title' => 'heroTitle',
    'hero_text' => 'heroText',
];

/** Translatable columns for an articles row. */
const I18N_ARTICLE_FIELDS = [
    'title' => 'title',
    'excerpt' => 'excerpt',
    'body' => 'body',
    'author' => 'author',
];

/** Translatable columns for a page_blocks row. */
const I18N_BLOCK_FIELDS = [
    'title' => 'title',
    'body' => 'body',
];

/** Translatable columns for a content_blocks (homepage) row. */
const I18N_HOME_FIELDS = [
    'title' => 'title',
    'subtitle' => 'subtitle',
    'body' => 'body',
];

/** Translatable columns for a menu_items row. */
const I18N_MENU_FIELDS = [
    'label' => 'label',
];

/** Translatable columns for a site_references row. */
const I18N_REFERENCE_FIELDS = [
    'title' => 'title',
];

/** Translatable columns for a categories / tags row. */
const I18N_TAXONOMY_FIELDS = [
    'name' => 'name',
    'description' => 'description',
];

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

    $i18n = decode_i18n(isset($row['i18n_json']) ? (string) $row['i18n_json'] : null);
    $merged = apply_i18n($row, I18N_PAGE_FIELDS, $GLOBALS['lang'] ?? 'fr');
    $missing = i18n_missing($i18n, I18N_PAGE_FIELDS);

    return [
        'id' => (int) $merged['id'],
        'slug' => (string) $merged['slug'],
        // The English slug drives the /en URL when one exists.
        'slugEn' => isset($row['slug_en']) && $row['slug_en'] !== '' ? (string) $row['slug_en'] : null,
        'title' => (string) $merged['title'],
        'eyebrow' => $merged['eyebrow'] ?? null,
        'heroTitle' => $merged['hero_title'] ?? null,
        'heroText' => $merged['hero_text'] ?? null,
        'heroImageUrl' => $merged['hero_image_url'] ?? null,
        'seo' => $seo,
        'isTranslated' => i18n_is_translated($i18n),
        'missingTranslation' => $missing,
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

    $i18n = decode_i18n(isset($row['i18n_json']) ? (string) $row['i18n_json'] : null);
    $merged = apply_i18n($row, I18N_ARTICLE_FIELDS, $GLOBALS['lang'] ?? 'fr');
    $missing = i18n_missing($i18n, I18N_ARTICLE_FIELDS);

    return [
        'id' => (int) $merged['id'],
        'slug' => (string) $merged['slug'],
        'slugEn' => isset($row['slug_en']) && $row['slug_en'] !== '' ? (string) $row['slug_en'] : null,
        'title' => (string) $merged['title'],
        'excerpt' => $merged['excerpt'] ?? null,
        'body' => $merged['body'] ?? null,
        'coverImageUrl' => $merged['cover_image_url'] ?? null,
        'author' => $merged['author'] ?? null,
        'categoryId' => isset($merged['category_id']) && $merged['category_id'] !== null ? (int) $merged['category_id'] : null,
        // ISO 8601 so new Date() parses it in every browser.
        'publishedAt' => !empty($merged['published_at']) ? str_replace(' ', 'T', (string) $merged['published_at']) : null,
        'seo' => $seo,
        'isTranslated' => i18n_is_translated($i18n),
        'missingTranslation' => $missing,
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

    $merged = apply_i18n($row, I18N_BLOCK_FIELDS, $GLOBALS['lang'] ?? 'fr');

    return [
        'type' => (string) $merged['type'],
        'title' => $merged['title'] ?? null,
        'body' => $merged['body'] ?? null,
        'imageUrl' => $merged['image_url'] ?? null,
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
    $merged = apply_i18n($row, I18N_HOME_FIELDS, $GLOBALS['lang'] ?? 'fr');

    return [
        'type' => (string) $merged['type'],
        'title' => $merged['title'] ?? null,
        'subtitle' => $merged['subtitle'] ?? null,
        'body' => $merged['body'] ?? null,
        'imageUrl' => $merged['image_url'] ?? null,
        'config' => $config,
        'sortOrder' => (int) $merged['sort_order'],
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
        $merged = apply_i18n($row, I18N_MENU_FIELDS, $GLOBALS['lang'] ?? 'fr');
        $mapped = [
            'id' => (int) $merged['id'],
            'label' => (string) $merged['label'],
            'url' => (string) $merged['url'],
            'opensNewTab' => (bool) $merged['opens_new_tab'],
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
            $row = db()->query('SELECT site_name, contact_email, contact_phone, address, footer_note, header_json, footer_json, seo_json, social_json, i18n_json FROM settings WHERE id = 1')->fetch();
            if ($row) {
                foreach (['header_json', 'footer_json', 'seo_json', 'social_json'] as $col) {
                    $row[$col] = !empty($row[$col]) ? json_decode((string) $row[$col], true) : null;
                }
                // Site-level strings (footer note, header announcement…).
                $siteFields = ['site_name' => 'siteName', 'address' => 'address', 'footer_note' => 'footerNote'];
                $row = array_merge($row, apply_i18n($row, $siteFields, $lang));
            }
            json_response(['ok' => true, 'settings' => $row ?: null, 'lang' => $lang]);

        case 'nav':
            // Primary source: menu_items for the 'main' menu location.
            try {
                $menu = db()->query("SELECT id FROM menus WHERE location = 'main' LIMIT 1")->fetch();
                if ($menu) {
                    json_response(['ok' => true, 'items' => public_menu_tree((int) $menu['id']), 'source' => 'menu', 'lang' => $lang]);
                }
            } catch (Throwable $e) {
                // Fall through to legacy pages-based nav.
            }
            // Legacy fallback: pages with a nav label (pre-v2 behavior).
            $stmt = db()->query(
                'SELECT slug, slug_en, i18n_json, COALESCE(nav_label, title) AS label, nav_order
                 FROM pages
                 WHERE status = \'published\' AND nav_label IS NOT NULL AND nav_label <> \'\'
                 ORDER BY nav_order ASC, id ASC'
            );
            $items = [];
            foreach ($stmt->fetchAll() as $row) {
                // nav_label is a French-only column: a translation can supply it
                // via the `navLabel` key, otherwise the translated title is used.
                $merged = apply_i18n($row, ['nav_label' => 'navLabel', 'title' => 'title'], $lang);
                $items[] = [
                    'slug' => (string) $row['slug'],
                    'slugEn' => $row['slug_en'] ?: null,
                    'label' => (string) ($merged['nav_label'] !== null && $merged['nav_label'] !== '' ? $merged['nav_label'] : $merged['title']),
                ];
            }
            json_response(['ok' => true, 'items' => $items, 'source' => 'pages', 'lang' => $lang]);

        case 'footer_menu':
            try {
                $menu = db()->query("SELECT id FROM menus WHERE location = 'footer' LIMIT 1")->fetch();
                if ($menu) {
                    json_response(['ok' => true, 'items' => public_menu_tree((int) $menu['id']), 'lang' => $lang]);
                }
            } catch (Throwable $e) {
            }
            json_response(['ok' => true, 'items' => [], 'lang' => $lang]);

        case 'page':
            if ($param === '') {
                json_response(['ok' => false, 'message' => 'Missing slug.'], 400);
            }
            // Resolves on slug_en first in English, then slug; a page without an
            // English slug is still reachable under its French slug.
            $page = find_by_slug('pages', $param, $lang, true, $adminPreview);
            if (!$page && $adminPreview) {
                // Draft/scheduled preview — admins only (see $adminPreview).
                $stmt = db()->prepare('SELECT * FROM pages WHERE slug = ? LIMIT 1');
                $stmt->execute([$param]);
                $page = $stmt->fetch();
            }
            if (!$page) {
                json_response(['ok' => false, 'message' => 'Page introuvable.'], 404);
            }

            $blocks = db()->prepare('SELECT type, title, body, image_url, images_json, is_visible, i18n_json FROM page_blocks WHERE page_id = ? AND is_visible = 1 ORDER BY sort_order ASC');
            $blocks->execute([(int) $page['id']]);

            json_response([
                'ok' => true,
                'page' => map_public_page($page),
                'blocks' => array_map('map_public_block', $blocks->fetchAll()),
                'lang' => $lang,
            ]);

        case 'articles':
            $rows = db()->query(
                'SELECT id, slug, slug_en, i18n_json, title, excerpt, cover_image_url, author, category_id, published_at
                 FROM articles
                 WHERE status = \'published\' AND published_at IS NOT NULL AND published_at <= NOW()
                 ORDER BY published_at DESC
                 LIMIT 100'
            )->fetchAll();
            json_response(['ok' => true, 'items' => array_map('map_public_article', $rows), 'lang' => $lang]);

        case 'article':
            if ($param === '') {
                json_response(['ok' => false, 'message' => 'Missing slug.'], 400);
            }
            $article = find_by_slug('articles', $param, $lang, true, $adminPreview);
            if (!$article && $adminPreview) {
                $stmt = db()->prepare('SELECT * FROM articles WHERE slug = ? LIMIT 1');
                $stmt->execute([$param]);
                $article = $stmt->fetch();
            }
            if (!$article) {
                json_response(['ok' => false, 'message' => 'Article introuvable.'], 404);
            }
            $payload = map_public_article($article);
            // Attach tags.
            try {
                $tags = db()->prepare('SELECT t.slug, t.name, t.i18n_json FROM tags t JOIN article_tags x ON x.tag_id = t.id WHERE x.article_id = ? ORDER BY t.name');
                $tags->execute([(int) $article['id']]);
                $payload['tags'] = array_map(static function (array $tag): array {
                    $merged = apply_i18n($tag, I18N_TAXONOMY_FIELDS, $GLOBALS['lang'] ?? 'fr');
                    return ['slug' => (string) $merged['slug'], 'name' => (string) $merged['name']];
                }, $tags->fetchAll());
            } catch (Throwable $e) {
                $payload['tags'] = [];
            }
            json_response(['ok' => true, 'article' => $payload, 'lang' => $lang]);

        case 'home':
            $rows = db()->query('SELECT * FROM content_blocks WHERE is_visible = 1 ORDER BY sort_order ASC, id ASC')->fetchAll();
            json_response(['ok' => true, 'items' => array_map('map_public_home_block', $rows), 'lang' => $lang]);

        case 'references':
            $rows = db()->query(
                'SELECT * FROM site_references WHERE is_visible = 1 ORDER BY kind ASC, sort_order ASC, id ASC'
            )->fetchAll();
            $items = [];
            foreach ($rows as $row) {
                $merged = apply_i18n($row, I18N_REFERENCE_FIELDS, $lang);
                $items[] = [
                    'id' => (int) $merged['id'],
                    'kind' => (string) $merged['kind'],
                    'title' => (string) $merged['title'],
                    'imageUrl' => $merged['image_url'] ?? null,
                    'websiteUrl' => $merged['website_url'] ?? null,
                ];
            }
            json_response(['ok' => true, 'items' => $items, 'lang' => $lang]);

        case 'categories':
            $rows = db()->query('SELECT c.id, c.slug, c.name, c.description, c.i18n_json, (SELECT COUNT(*) FROM articles a WHERE a.category_id = c.id AND a.status = \'published\') AS article_count FROM categories c ORDER BY c.name ASC')->fetchAll();
            $items = [];
            foreach ($rows as $row) {
                $merged = apply_i18n($row, I18N_TAXONOMY_FIELDS, $lang);
                $items[] = [
                    'id' => (int) $merged['id'],
                    'slug' => (string) $merged['slug'],
                    'name' => (string) $merged['name'],
                    'description' => $merged['description'] ?? null,
                    'article_count' => (int) $row['article_count'],
                ];
            }
            json_response(['ok' => true, 'items' => $items, 'lang' => $lang]);

        default:
            json_response(['ok' => false, 'message' => 'Unknown resource.'], 404);
    }
} catch (Throwable $e) {
    json_response(['ok' => false, 'message' => 'Base de données non disponible. Exécutez /api/install.php.'], 503);
}
