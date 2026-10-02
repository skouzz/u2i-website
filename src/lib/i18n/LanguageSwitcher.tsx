import { useEffect, useRef, useState } from "react";
import { useRouterState } from "@tanstack/react-router";
import { Check, ChevronDown, Globe } from "lucide-react";

import { LOCALES, LOCALE_LABELS, switchLocalePath, useI18n } from "./index";

type Props = {
  /** Visual treatment: "dark" for the black navbar/footer, "light" for pale backgrounds. */
  tone?: "dark" | "light";
  className?: string;
};

/**
 * FR ⇄ EN switcher, styled to sit alongside the social icons.
 *
 * A globe button opens a compact dropdown — at this size a two-button toggle
 * competes visually with the social links, and the dropdown keeps the toolbar
 * uncluttered. Keyboard accessible: Escape closes, focus returns to the
 * trigger, and a click outside dismisses.
 *
 * Switching only swaps the locale prefix, so the visitor stays on the same
 * page. Content without an English version still renders (server-side French
 * fallback), so this can never land on a 404.
 */
export function LanguageSwitcher({ tone = "dark", className = "" }: Props) {
  const { locale, t } = useI18n();
  const router = useRouterState();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Close whenever the visitor navigates to the other language.
  useEffect(() => {
    setOpen(false);
  }, [router.location.pathname]);

  const isDark = tone === "dark";
  const trigger = isDark
    ? "text-white/70 hover:text-white hover:bg-white/10 border border-transparent"
    : "text-neutral-600 hover:text-[#e0141c] hover:bg-neutral-50 border border-neutral-200";
  const triggerActive = isDark
    ? "text-white bg-white/10 border-white/20"
    : "text-[#e0141c] bg-[#e0141c]/5 border-[#e0141c]/30";
  const panel = isDark
    ? "bg-black/95 border-white/15 text-white shadow-2xl backdrop-blur-xl"
    : "bg-white border-neutral-200 text-neutral-800 shadow-xl";

  return (
    <div ref={wrapRef} className={`relative ${className}`}>
      {/* Always-present alternate links. The dropdown is closed by default, so
          without these the prerender crawler (which follows <a href>) would
          never discover /en and the English pages would be missing from the
          build. They also keep language switching working without JS. */}
      <nav aria-label={t("nav.language")} className="sr-only focus:not-sr-only">
        {LOCALES.filter((lang) => lang !== locale).map((lang) => (
          <a
            key={lang}
            href={switchLocalePath(router.location.pathname, lang)}
            hrefLang={lang}
            lang={lang}
          >
            {LOCALE_LABELS[lang]}
          </a>
        ))}
      </nav>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="true"
        aria-expanded={open}
        aria-label={t("nav.language")}
        title={LOCALE_LABELS[locale]}
        className={`inline-flex h-[26px] items-center gap-1 rounded-full px-2 text-[11px] font-bold uppercase tracking-wide transition-colors ${open ? triggerActive : trigger}`}
      >
        <Globe className="h-3.5 w-3.5" aria-hidden="true" />
        <span>{locale.toUpperCase()}</span>
        <ChevronDown
          className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>

      {open ? (
        <div
          role="menu"
          className={`absolute right-0 top-[calc(100%+8px)] z-50 w-44 overflow-hidden rounded-xl border p-1 ${panel}`}
        >
          {LOCALES.map((lang) => {
            const active = lang === locale;
            const row = isDark
              ? "text-white/80 hover:bg-white/10"
              : "text-neutral-700 hover:bg-neutral-100";
            const rowActive = isDark
              ? "bg-[#e0141c] text-white hover:bg-[#e0141c]"
              : "bg-[#e0141c] text-white hover:bg-[#e0141c]";
            return (
              <a
                key={lang}
                role="menuitem"
                href={switchLocalePath(router.location.pathname, lang)}
                hrefLang={lang}
                lang={lang}
                aria-current={active ? "true" : undefined}
                onClick={() => setOpen(false)}
                className={`flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${active ? rowActive : row}`}
              >
                <span>{LOCALE_LABELS[lang]}</span>
                {active ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : null}
              </a>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
