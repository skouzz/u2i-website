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

/**
 * Client-side SEO manager: updates title, meta description, Open Graph and
 * canonical tags from CMS-provided metadata. SPA prerender provides the
 * defaults; this keeps tags in sync while navigating.
 */
export function useSeo(options: {
  title?: string;
  description?: string;
  seo?: CmsSeo | null;
  ogImage?: string | null;
}) {
  const { title, description, seo, ogImage } = options;

  useEffect(() => {
    const finalTitle = seo?.seoTitle || title;
    const finalDescription = seo?.seoDescription || description;

    if (finalTitle) {
      document.title = finalTitle;
      setMeta("property", "og:title", finalTitle);
    }
    if (finalDescription) {
      setMeta("name", "description", finalDescription);
      setMeta("property", "og:description", finalDescription);
    }
    const image = seo?.ogImage || ogImage;
    if (image) {
      setMeta("property", "og:image", image);
    }
    if (seo?.canonicalUrl) {
      setCanonical(seo.canonicalUrl);
    } else if (typeof window !== "undefined") {
      setCanonical(window.location.href.split("?")[0]);
    }
  }, [title, description, seo, ogImage]);
}
