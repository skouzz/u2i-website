<?php
/**
 * U2I Process — dynamic sitemap generator.
 * Lists the static SPA routes plus every published CMS page and article.
 * Link from robots.txt. Safe to run on OVH shared hosting.
 */

declare(strict_types=1);
require __DIR__ . '/config.php';

$scheme = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
$host = $_SERVER['HTTP_HOST'] ?? 'u2iprocess.com';
$base = $scheme . '://' . $host;

$staticRoutes = ['', '/about', '/secteurs', '/equipements', '/references', '/actualites', '/contact'];

$urls = [];
foreach ($staticRoutes as $route) {
    $urls[] = ['loc' => $base . '/' . $route, 'lastmod' => date('Y-m-d')];
    // English mirror: static pages are fully translated in the front-end, so
    // both locales are always real URLs.
    $urls[] = ['loc' => $base . '/en' . $route, 'lastmod' => date('Y-m-d')];
}

try {
    if (is_db_installed()) {
        $pages = db()->query("SELECT slug, slug_en, updated_at FROM pages WHERE status = 'published'")->fetchAll();
        foreach ($pages as $p) {
            $lastmod = substr((string) $p['updated_at'], 0, 10);
            $urls[] = ['loc' => $base . '/p/' . rawurlencode($p['slug']), 'lastmod' => $lastmod];
            // Only advertise the English URL when an English slug exists; the
            // French slug still resolves under /en via server-side fallback,
            // but a canonical /en URL with no English slug would be a redirect.
            if (!empty($p['slug_en'])) {
                $urls[] = ['loc' => $base . '/en/p/' . rawurlencode($p['slug_en']), 'lastmod' => $lastmod];
            }
        }
        $articles = db()->query("SELECT slug, slug_en, updated_at, published_at FROM articles WHERE status = 'published'")->fetchAll();
        foreach ($articles as $a) {
            $lastmod = substr((string) ($a['updated_at'] ?: $a['published_at']), 0, 10) ?: date('Y-m-d');
            $urls[] = ['loc' => $base . '/actualites/' . rawurlencode($a['slug']), 'lastmod' => $lastmod];
            if (!empty($a['slug_en'])) {
                $urls[] = ['loc' => $base . '/en/actualites/' . rawurlencode($a['slug_en']), 'lastmod' => $lastmod];
            }
        }
    }
} catch (Throwable $e) {
    // Sitemap stays with static routes when the DB is unavailable.
}

header('Content-Type: application/xml; charset=utf-8');
echo '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
<?php foreach ($urls as $url): ?>
  <url>
    <loc><?= htmlspecialchars($url['loc'], ENT_XML1) ?></loc>
    <lastmod><?= htmlspecialchars((string) $url['lastmod'], ENT_XML1) ?></lastmod>
  </url>
<?php endforeach; ?>
</urlset>
