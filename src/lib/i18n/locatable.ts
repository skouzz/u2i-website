import type { Locale } from "./catalog";
import { LOCALE_PREFIX } from "./catalog";

/** Read the active locale from the URL: /en/... is English, everything else French. */
export function localeFromPath(pathname: string): Locale {
  return pathname === "/en" || pathname.startsWith("/en/") ? "en" : "fr";
}

/**
 * Prefix an internal path with the target locale.
 *   localize("/about", "en")  -> "/en/about"
 *   localize("/en/about", "fr") -> "/about"
 * External URLs, anchors and API calls are returned untouched.
 */
export function localize(path: string, locale: Locale): string {
  if (!path.startsWith("/") || path.startsWith("//")) return path;
  if (path.startsWith("/api/")) return path;

  const stripped = stripLocale(path);
  const prefix = LOCALE_PREFIX[locale];
  return stripped === "/" ? prefix || "/" : `${prefix}${stripped}`;
}

/** Remove any existing locale prefix from a path. */
export function stripLocale(path: string): string {
  if (path === "/en") return "/";
  if (path.startsWith("/en/")) return path.slice(3) || "/";
  return path;
}

/** The equivalent path in the other language — used by the switcher. */
export function switchLocalePath(pathname: string, target: Locale): string {
  return localize(pathname, target);
}
