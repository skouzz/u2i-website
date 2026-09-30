import { useEffect } from "react";
import type { CmsSeo } from "./cms";

function setMeta(attr: "name" | "property", key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setCanonical(href: string) {
  let el = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!el) {
    el = document.createElement("link");
    el.rel = "canonical";
    document.head.appendChild(el);
  }
  el.href = href;
}

function setRobots(content: string) {
  setMeta("name", "robots", content);
}

/** Upsert one JSON-LD <script> block, identified by its @type. */
function setJsonLd(type: string, data: Record<string, unknown> | null) {
  const id = `ld-json-${type.toLowerCase()}`;
  let el = document.head.querySelector<HTMLScriptElement>(`script[id="${id}"]`);
  if (!data) {
    el?.remove();
    return;
  }
  if (!el) {
    el = document.createElement("script");
    el.id = id;
    el.type = "application/ld+json";
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(data);
}

const SITE_NAME = "U2I Process";
const SITE_URL = typeof window !== "undefined" ? window.location.origin : "https://u2iprocess.com";

/**
 * Client-side SEO manager: title, description, Open Graph + Twitter cards,
 * canonical, robots directives and JSON-LD structured data, all derived from
 * CMS-provided metadata. Prerender provides the base defaults.
 */
export function useSeo(options: {
  title?: string;
  description?: string;
  seo?: CmsSeo | null;
  ogImage?: string | null;
  /** Absolute public URL of this page (canonical + og:url + JSON-LD). */
  path?: string;
  ogType?: "website" | "article";
  /** When set, emits an Article/NewsArticle schema block. */
  article?: {
    headline: string;
    description?: string | null;
    image?: string | null;
    datePublished?: string | null;
    dateModified?: string | null;
    author?: string | null;
  } | null;
  /** Breadcrumb trail (label + absolute path) for BreadcrumbList schema. */
  breadcrumbs?: { label: string; path: string }[];
}) {
  const {
    title,
    description,
    seo,
    ogImage,
    path,
    ogType = "website",
    article,
    breadcrumbs,
  } = options;

  useEffect(() => {
    const url = `${SITE_URL}${path ?? window.location.pathname}`;
    const finalTitle = seo?.seoTitle || title;
    const finalDescription = seo?.seoDescription || description;
    const image = seo?.ogImage || ogImage || undefined;
    const twitterImage = seo?.twitterImage || image;

    if (finalTitle) {
      document.title = finalTitle;
      setMeta("property", "og:title", seo?.ogTitle || finalTitle);
      setMeta("name", "twitter:title", seo?.ogTitle || finalTitle);
    }
    if (finalDescription) {
      setMeta("name", "description", finalDescription);
      setMeta("property", "og:description", seo?.ogDescription || finalDescription);
      setMeta("name", "twitter:description", seo?.ogDescription || finalDescription);
    }
    if (image) {
      setMeta("property", "og:image", image);
      setMeta("property", "og:image:alt", seo?.ogTitle || finalTitle || SITE_NAME);
    }
    if (twitterImage) {
      setMeta("name", "twitter:image", twitterImage);
    }
    setMeta("name", "twitter:card", twitterImage ? "summary_large_image" : "summary");
    setMeta("property", "og:type", ogType === "article" ? "article" : "website");
    setMeta("property", "og:url", url);
    setMeta("property", "og:site_name", SITE_NAME);
    setCanonical(seo?.canonicalUrl || url);

    // Robots: page-level directive wins; never weaken an explicit noindex.
    setRobots(seo?.robots && seo.robots.trim() !== "" ? seo.robots : "index, follow");

    // ── Structured data ──
    setJsonLd("Organization", {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    });

    setJsonLd(
      "WebPage",
      seo?.robots?.includes("noindex")
        ? null
        : {
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: finalTitle ?? SITE_NAME,
            description: finalDescription,
            url,
          },
    );

    setJsonLd(
      "Article",
      article && !seo?.robots?.includes("noindex")
        ? {
            "@context": "https://schema.org",
            "@type": "NewsArticle",
            headline: article.headline,
            description: article.description ?? undefined,
            image: article.image
              ? [`${SITE_URL}${article.image}`.replace(`${SITE_URL}${SITE_URL}`, SITE_URL)]
              : undefined,
            datePublished: article.datePublished ?? undefined,
            dateModified: article.dateModified ?? article.datePublished ?? undefined,
            author: { "@type": "Organization", name: article.author || SITE_NAME },
            publisher: { "@type": "Organization", name: SITE_NAME },
            mainEntityOfPage: url,
          }
        : null,
    );

    setJsonLd(
      "BreadcrumbList",
      breadcrumbs && breadcrumbs.length > 0 && !seo?.robots?.includes("noindex")
        ? {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: breadcrumbs.map((crumb, index) => ({
              "@type": "ListItem",
              position: index + 1,
              name: crumb.label,
              item: `${SITE_URL}${crumb.path}`,
            })),
          }
        : null,
    );
  }, [title, description, seo, ogImage, path, ogType, article, breadcrumbs]);
}

// ── SEO validation helpers (honest length checks — no fake scores) ──────────

export interface SeoIssue {
  level: "error" | "warn";
  message: string;
}

/** Practical length checks mirroring how Google truncates snippets. */
export function validateSeo(seo: {
  seoTitle?: string;
  seoDescription?: string;
  ogImage?: string;
}): SeoIssue[] {
  const issues: SeoIssue[] = [];
  const title = (seo.seoTitle ?? "").trim();
  const desc = (seo.seoDescription ?? "").trim();

  if (title.length > 60)
    issues.push({ level: "warn", message: "Titre SEO long (sera tronqué ~60 caractères)." });
  if (title.length > 0 && title.length < 15)
    issues.push({ level: "warn", message: "Titre SEO court (moins de 15 caractères)." });
  if (desc.length > 160)
    issues.push({ level: "warn", message: "Méta description longue (tronquée ~160 caractères)." });
  if (desc.length > 0 && desc.length < 50)
    issues.push({ level: "warn", message: "Méta description courte (moins de 50 caractères)." });

  return issues;
}
