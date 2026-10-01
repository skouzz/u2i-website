import { useRouterState } from "@tanstack/react-router";
import { Languages } from "lucide-react";

import { LOCALES, LOCALE_LABELS, LOCALE_SHORT, switchLocalePath, useI18n } from "./index";

type Props = {
  /** Visual treatment: "dark" for the black navbar, "light" for the footer. */
  tone?: "dark" | "light";
  className?: string;
};

/**
 * FR ⇄ EN switcher.
 *
 * Keeps the visitor on the same page: only the locale prefix is swapped, so
 * /en/actualites/my-post becomes /actualites/my-post and back. Content that
 * has no English version still renders (server-side French fallback), so the
 * switch never lands on a 404.
 */
export function LanguageSwitcher({ tone = "dark", className = "" }: Props) {
  const { locale, t } = useI18n();
  const router = useRouterState();
  const pathname = router.location.pathname;
  const current = pathname;

  const base =
    tone === "dark"
      ? "border-white/20 bg-white/5 text-white/80 hover:border-[#e0141c] hover:text-white"
      : "border-neutral-300 bg-white text-neutral-700 hover:border-[#e0141c] hover:text-[#e0141c]";
  const active = tone === "dark" ? "bg-[#e0141c] text-white border-[#e0141c]" : "bg-[#e0141c] text-white border-[#e0141c]";

  return (
    <div
      className={`flex items-center gap-1.5 ${className}`}
      role="group"
      aria-label={t("nav.language")}
    >
      <Languages
        className={`h-3.5 w-3.5 ${tone === "dark" ? "text-white/60" : "text-neutral-400"}`}
        aria-hidden="true"
      />
      {LOCALES.map((lang, index) => {
        const isActive = lang === locale;
        return (
          <span key={lang} className="flex items-center">
            {index > 0 ? (
              <span
                className={`mx-0.5 text-[11px] ${tone === "dark" ? "text-white/30" : "text-neutral-300"}`}
                aria-hidden="true"
              >
                /
              </span>
            ) : null}
            {isActive ? (
              <span
                className={`rounded border px-1.5 py-0.5 text-[11px] font-bold tracking-wide ${active}`}
                aria-current="true"
              >
                {LOCALE_SHORT[lang]}
              </span>
            ) : (
              <a
                href={switchLocalePath(current, lang)}
                hrefLang={lang}
                lang={lang}
                title={LOCALE_LABELS[lang]}
                className={`rounded border px-1.5 py-0.5 text-[11px] font-bold tracking-wide transition-colors ${base}`}
              >
                {LOCALE_SHORT[lang]}
              </a>
            )}
          </span>
        );
      })}
    </div>
  );
}
