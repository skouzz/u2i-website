import { useQuery } from "@tanstack/react-query";

import { cmsApi } from "./cms";

/**
 * Shared CMS query hooks.
 *
 * The Navbar and the Footer both need site settings, and both used to fetch
 * them independently with raw `useEffect` + `useState`. That meant two
 * identical `/api/cms.php?r=settings` requests on every single page load,
 * and both were thrown away and re-requested on every client navigation
 * because nothing was cached them.
 *
 * Routing them through one query cache means the second caller joins the
 * in-flight request instead of issuing its own, and the result survives
 * navigation — so returning to a page you already visited costs no request
 * at all. Keys live here so the home page and the Footer cannot drift apart
 * and accidentally fetch the article list twice.
 */

/** Cache keys. Locale is part of every key because the API overlays English. */
export const cmsKeys = {
  settings: (locale: string) => ["cms", "settings", locale] as const,
  nav: (locale: string) => ["cms", "nav", locale] as const,
  footerMenu: (locale: string) => ["cms", "footerMenu", locale] as const,
  articles: (locale: string) => ["cms", "articles", locale] as const,
};

/**
 * Site settings (logo, phone, socials, footer config).
 *
 * Generous staleTime: it changes only when an admin saves settings, and
 * bouncing the visitor to the homepage should not feel it.
 */
export function useCmsSettings(locale: string) {
  return useQuery({
    queryKey: cmsKeys.settings(locale),
    queryFn: () => cmsApi.settings(locale),
    staleTime: 5 * 60_000,
  });
}

/** Primary navigation tree. */
export function useCmsNav(locale: string) {
  return useQuery({
    queryKey: cmsKeys.nav(locale),
    queryFn: () => cmsApi.nav(locale),
    staleTime: 5 * 60_000,
  });
}

/** Footer link column. */
export function useCmsFooterMenu(locale: string) {
  return useQuery({
    queryKey: cmsKeys.footerMenu(locale),
    queryFn: () => cmsApi.footerMenu(locale),
    staleTime: 5 * 60_000,
  });
}

/**
 * Article list. Shared with the home page's articles block, which uses the
 * same key, so a visitor who lands on the home page does not see the Footer
 * trigger a second copy of the same request.
 */
export function useCmsArticles(locale: string) {
  return useQuery({
    queryKey: cmsKeys.articles(locale),
    queryFn: () => cmsApi.articles(locale),
    staleTime: 60_000,
  });
}