import { useMemo, useContext, createContext } from "react";
import { useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";

import { DEFAULT_LOCALE, SOURCE_LOCALE, translate, type Locale, type MessageKey } from "./catalog";
import { localize, localeFromPath } from "./locatable";

export { localeFromPath, localize, stripLocale, switchLocalePath } from "./locatable";

export type { Locale, MessageKey } from "./catalog";
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

function getI18nValue(locale: Locale): I18nValue {
  const other: Locale = locale === "fr" ? "en" : "fr";
  return {
    locale,
    isSourceLocale: locale === SOURCE_LOCALE,
    t: (key: MessageKey) => translate(locale, key),
    link: (path: string) => localize(path, locale),
    switchTo: other,
  };
}

function cachedI18nValue(locale: Locale): I18nValue {
  return useMemo<I18nValue>(() => getI18nValue(locale), [locale]);
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const locale = localeFromPath(pathname);

  const value = cachedI18nValue(locale);

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
