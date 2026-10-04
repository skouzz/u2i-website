import { createContext, useContext, useMemo } from "react";
import { useRouterState } from "@tanstack/react-router";

import {
  DEFAULT_LOCALE,
  LOCALE_PREFIX,
  SOURCE_LOCALE,
  translate,
  type Locale,
  type MessageKey,
} from "./catalog";

export type { Locale, MessageKey };
export {
  LOCALES,
  LOCALE_LABELS,
  LOCALE_SHORT,
  LOCALE_PREFIX,
  SOURCE_LOCALE,
  hasTranslation,
  missingKeys,
  translateNavLabel,
} from "./catalog";

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

type I18nValue = {
  locale: Locale;
  isSourceLocale: boolean;
  t: (key: MessageKey) => string;
  /** Prefix an internal link with the active locale. */
  link: (path: string) => string;
  /** The same page in the other language. */
  switchTo: Locale;
};

const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const locale = localeFromPath(pathname);

  const value = useMemo<I18nValue>(() => {
    const other: Locale = locale === "fr" ? "en" : "fr";
    return {
      locale,
      isSourceLocale: locale === SOURCE_LOCALE,
      t: (key: MessageKey) => translate(locale, key),
      link: (path: string) => localize(path, locale),
      switchTo: other,
    };
  }, [locale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

/**
 * Access the active locale. Falls back to a French-only value so a component
 * rendered outside the provider (e.g. an isolated test) still works.
 */
export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  const fallbackLocale: Locale = DEFAULT_LOCALE;
  if (ctx) return ctx;
  return {
    locale: fallbackLocale,
    isSourceLocale: true,
    t: (key) => translate(fallbackLocale, key),
    link: (path) => path,
    switchTo: "en",
  };
}

/** Shorthand for components that only need the translate function. */
export function useT(): (key: MessageKey) => string {
  return useI18n().t;
}
