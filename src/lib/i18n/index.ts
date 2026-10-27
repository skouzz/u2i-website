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

export { I18nProvider, useI18n, useT } from "./context";
