import { useEffect, useRef, useState } from "react";
import {
  ArrowUpRight,
  ChevronDown,
  Facebook,
  Instagram,
  Linkedin,
  Mail,
  Menu,
  Phone,
  X,
  Youtube,
} from "lucide-react";

import logoImage from "@/assets/logo-u2i-removebg-preview.png";
import emailIcon from "@/assets/partners/email.png";
import type { CmsNavItem } from "@/lib/cms";
import { useCmsNav, useCmsSettings } from "@/lib/cms-queries";
import { useI18n, translateNavLabel, type Locale } from "@/lib/i18n";
import { LanguageSwitcher } from "@/lib/i18n/LanguageSwitcher";
import { LocalizedLink } from "@/lib/i18n/LocalizedLink";
import { buildNavigation, type NavItem, type NavSectionItem } from "@/lib/site/navigation";

type NavLink = {
  label: string;
  url: string;
  newTab: boolean;
  children: { label: string; url: string; newTab: boolean }[];
};

/** Normalize any CMS nav item (menu tree or legacy page list) to a common shape. */
function normalizeItems(items: CmsNavItem[], locale: Locale): NavLink[] {
  return items
    .filter((item) => item.label)
    .map((item) => ({
      // Menu labels are authored in French in the dashboard; map the common
      // ones to the catalog so the English navbar is not left in French.
      label: translateNavLabel(item.label, locale),
      url: item.url ?? (item.slug ? `/p/${item.slug}` : "#"),
      newTab: Boolean(item.opensNewTab),
      children: (item.children ?? [])
        .filter((child) => child.label)
        .map((child) => ({
          label: translateNavLabel(child.label, locale),
          url: child.url ?? (child.slug ? `/p/${child.slug}` : "#"),
          newTab: Boolean(child.opensNewTab),
        })),
    }));
}

/**
 * Convert a CMS menu into the IA menu shape.
 *
 * The dashboard cannot express section descriptions or child summaries, so a
 * CMS-backed item is shown as a plain link whenever its label matches a known
 * IA section, and only falls back to a generic two-level menu when it does not
 * (a custom page group an editor added by hand).
 */
function fromCms(items: NavLink[], ia: NavItem[]): NavItem[] {
  const byLabel = new Map(ia.map((item) => [item.label.toLowerCase(), item]));

  return items.map((item) => {
    const known = byLabel.get(item.label.toLowerCase());
    if (known) return known;
    if (item.children.length === 0) {
      return { kind: "link", label: item.label, path: item.url } satisfies NavItem;
    }
    return {
      kind: "link",
      label: item.label,
      path: item.children[0]?.url ?? item.url,
    } satisfies NavItem;
  });
}

export function Navbar() {
  const { locale, t } = useI18n();
  const [open, setOpen] = useState(false);
  /**
   * Which IA section's mega-panel is open.
   *
   * Held in React state rather than done with CSS `:hover` because the panel has
   * to span the full width of the header: a panel positioned inside the `<li>`
   * can only be as wide as that item. Hover alone also cannot express "close on
   * Escape" or "close on route change", both of which a keyboard or screen
   * reader user needs.
   */
  const [openSection, setOpenSection] = useState<string | null>(null);
  const navRef = useRef<HTMLElement | null>(null);

  // Shared query cache: the Footer needs these same two responses, so they
  // are issued once per locale instead of once per component.
  const { data: navData } = useCmsNav(locale);
  const { data: settingsData } = useCmsSettings(locale);

  const ia = buildNavigation(locale);
  const cmsItems = navData?.items?.length ? normalizeItems(navData.items, locale) : null;
  const items: NavItem[] = cmsItems ? fromCms(cmsItems, ia) : ia;

  const sections = items.filter((item): item is NavSectionItem => item.kind === "section");
  const activeSection = sections.find((section) => section.label === openSection) ?? null;

  // Drawer behaviour: lock the page behind it so touch scrolling doesn't move
  // the page underneath, close on Escape, and close when the viewport grows
  // past the breakpoint where the desktop nav takes over.
  useEffect(() => {
    if (!open) return;

    const { body } = document;
    const previousOverflow = body.style.overflow;
    const previousPadding = body.style.paddingRight;
    // Compensate for the vanishing scrollbar so the page doesn't jump.
    const scrollbar = window.innerWidth - document.documentElement.clientWidth;
    body.style.overflow = "hidden";
    if (scrollbar > 0) body.style.paddingRight = `${scrollbar}px`;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    const desktop = window.matchMedia("(min-width: 1024px)");
    const onBreakpoint = (event: MediaQueryListEvent | MediaQueryList) => {
      if (event.matches) setOpen(false);
    };

    window.addEventListener("keydown", onKey);
    desktop.addEventListener("change", onBreakpoint as EventListener);
    return () => {
      body.style.overflow = previousOverflow;
      body.style.paddingRight = previousPadding;
      window.removeEventListener("keydown", onKey);
      desktop.removeEventListener("change", onBreakpoint as EventListener);
    };
  }, [open]);

  // Close the mega-panel on Escape or on a click outside the nav, and drop it
  // when the viewport drops to the drawer.
  useEffect(() => {
    if (!openSection) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpenSection(null);
    };
    const onPointer = (event: PointerEvent) => {
      if (!navRef.current?.contains(event.target as Node)) setOpenSection(null);
    };
    const desktop = window.matchMedia("(min-width: 1024px)");
    const onBreakpoint = (event: MediaQueryListEvent | MediaQueryList) => {
      if (!event.matches) setOpenSection(null);
    };

    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onPointer);
    desktop.addEventListener("change", onBreakpoint as EventListener);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onPointer);
      desktop.removeEventListener("change", onBreakpoint as EventListener);
    };
  }, [openSection]);

  const settings = settingsData?.settings ?? null;
  const header = settings?.header_json;
  const social = settings?.social_json;
  const logo = header?.logoUrl || logoImage;
  const phone = header?.phone || settings?.contact_phone || "+216 50 191 004";
  const email = header?.email || settings?.contact_email || "u2i@u2iprocess.com";
  const announcementEnabled = header?.announcementEnabled ?? true;

  const socialLinks = [
    social?.facebook ? { href: social.facebook, label: "Facebook", Icon: Facebook } : null,
    social?.youtube ? { href: social.youtube, label: "YouTube", Icon: Youtube } : null,
    social?.linkedin ? { href: social.linkedin, label: "LinkedIn", Icon: Linkedin } : null,
    social?.instagram ? { href: social.instagram, label: "Instagram", Icon: Instagram } : null,
  ].filter(Boolean) as { href: string; label: string; Icon: typeof Facebook }[];

  return (
    <>
      <header className="sticky inset-x-0 top-0 z-50 border-b border-white/10 bg-black shadow-lg shadow-black/20">
        {/* Utility bar */}
        <div className="hidden border-b border-white/10 py-1 text-[11px] font-semibold text-white/80 md:block">
          <div className="wrap flex items-center justify-end gap-7">
            <div className="mr-auto flex items-center gap-2">
              <Phone className="h-3.5 w-3.5 text-[#e0141c]" />
              <a
                href={`tel:${phone.replace(/\s+/g, "")}`}
                className="font-bold tracking-wider hover:text-[#e0141c]"
              >
                {phone}
              </a>
              <span className="text-white/20 mx-1">|</span>
              <Mail className="h-3.5 w-3.5 ml-1 text-[#e0141c]" />
              <a
                href={`mailto:${email}`}
                className="ml-2 inline-block hover:opacity-90 transition-opacity"
                aria-label="Email"
              >
                <img
                  src={emailIcon}
                  alt="Email"
                  className="h-4 w-auto object-contain inline-block"
                />
              </a>
              {announcementEnabled && header?.announcement ? (
                <span className="opacity-80 hidden sm:inline ml-2 border-l border-white/20 pl-4">
                  {header.announcement}
                </span>
              ) : null}
            </div>
            {/* Social links and the language switcher share one row so the
                globe sits naturally alongside Facebook / LinkedIn / YouTube. */}
            <div className="flex items-center gap-4">
              {(header?.showSocial ?? true) && socialLinks.length > 0 ? (
                <div className="flex items-center gap-4">
                  {socialLinks.map(({ href, label, Icon }) => (
                    <a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={label}
                      className="opacity-80 hover:text-[#e0141c] hover:opacity-100 transition-colors"
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </a>
                  ))}
                </div>
              ) : null}
              <span className="h-3.5 w-px bg-white/15" aria-hidden="true" />
              <LanguageSwitcher tone="dark" />
            </div>
          </div>
        </div>

        {/* Main nav */}
        <div className="py-2">
          <div className="wrap flex items-center gap-6">
            <LocalizedLink to="/" aria-label="U2I" className="mr-4 shrink-0">
              <img
                src={logo}
                alt="Univers Inox"
                className="h-9 w-auto rounded-md object-contain sm:h-10"
              />
            </LocalizedLink>

            <nav
              ref={navRef}
              className="hidden flex-1 lg:block"
              aria-label={t("nav.menu")}
              onMouseLeave={() => setOpenSection(null)}
            >
              <ul className="flex flex-wrap items-center gap-x-6 gap-y-1">
                {items.map((item) =>
                  item.kind === "link" ? (
                    <li key={item.label}>
                      <LocalizedLink
                        to={item.path}
                        className="text-sm font-bold text-white transition-colors hover:text-[#e0141c]"
                        onClick={() => setOpenSection(null)}
                      >
                        {item.label}
                      </LocalizedLink>
                    </li>
                  ) : (
                    <li key={item.label} className="relative">
                      <div className="flex items-center gap-1">
                        {/* The section title is a real link to its overview —
                            with children, clicking the label should still go
                            somewhere rather than only opening the panel. */}
                        <LocalizedLink
                          to={item.path}
                          className="text-sm font-bold text-white transition-colors hover:text-[#e0141c]"
                          onMouseEnter={() => setOpenSection(item.label)}
                          onFocus={() => setOpenSection(item.label)}
                          onClick={() => setOpenSection(null)}
                        >
                          {item.label}
                        </LocalizedLink>
                        <button
                          type="button"
                          aria-expanded={openSection === item.label}
                          aria-label={item.label}
                          className="grid h-6 w-5 place-items-center text-white/60 transition-colors hover:text-[#e0141c]"
                          onMouseEnter={() => setOpenSection(item.label)}
                          onFocus={() => setOpenSection(item.label)}
                          onClick={() =>
                            setOpenSection((current) =>
                              current === item.label ? null : item.label,
                            )
                          }
                        >
                          <ChevronDown
                            className={`h-3 w-3 transition-transform ${openSection === item.label ? "rotate-180" : ""}`}
                            aria-hidden="true"
                          />
                        </button>
                      </div>
                    </li>
                  ),
                )}
              </ul>
            </nav>

            <button
              className="ml-auto grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-[#e0141c]/20 lg:hidden"
              aria-label={t("nav.menu")}
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mega-panel: one at a time, spanning the header's full width. */}
        {activeSection ? (
          <div
            className="absolute inset-x-0 top-full hidden border-t border-white/10 bg-black/95 shadow-2xl backdrop-blur-xl lg:block"
            onMouseEnter={() => setOpenSection(activeSection.label)}
          >
            <div className="wrap grid gap-10 py-9 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)]">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#e0141c]">
                  {activeSection.label}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-white/70">
                  {activeSection.description}
                </p>
                <LocalizedLink
                  to={activeSection.path}
                  className="mt-5 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.12em] text-white transition-colors hover:text-[#e0141c]"
                  onClick={() => setOpenSection(null)}
                >
                  {t("site.explore")} <ArrowUpRight size={15} aria-hidden="true" />
                </LocalizedLink>
              </div>

              <ul className="grid gap-x-8 gap-y-1 sm:grid-cols-2 xl:grid-cols-3">
                {activeSection.children.map((child) => (
                  <li key={child.path}>
                    <LocalizedLink
                      to={child.path}
                      className="group flex flex-col gap-1 border-l-2 border-transparent py-2 pl-3 transition-colors hover:border-[#e0141c]"
                      onClick={() => setOpenSection(null)}
                    >
                      <span className="text-sm font-bold text-white transition-colors group-hover:text-[#e0141c]">
                        {child.label}
                      </span>
                      <span className="line-clamp-2 text-xs leading-relaxed text-white/50">
                        {child.entry.summary[locale] ?? child.entry.summary.fr}
                      </span>
                    </LocalizedLink>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : null}
      </header>

      {/*
        Mobile drawer.

        Rendered as a SIBLING of <header>, not a child: the header picks up
        backdrop-filter styling while the menu is open, and backdrop-filter
        creates a containing block that re-anchors `position: fixed`
        descendants to the header. That collapses a full-height drawer down to
        the header's own height, so tapping the toggle looks like nothing
        happened. Keeping the drawer outside the header makes that impossible.
      */}
      <div
        className={`fixed inset-0 z-[60] lg:hidden ${open ? "" : "pointer-events-none"}`}
        aria-hidden={!open}
      >
        {/* Tap anywhere outside the panel to dismiss. */}
        <button
          type="button"
          tabIndex={open ? 0 : -1}
          aria-label={t("nav.close")}
          onClick={() => setOpen(false)}
          className={`absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300 ${
            open ? "opacity-100" : "opacity-0"
          }`}
        />

        <nav
          role="dialog"
          aria-modal={open ? true : undefined}
          aria-label={t("nav.menu")}
          className={`absolute inset-y-0 right-0 flex w-[86%] max-w-sm flex-col overflow-y-auto overscroll-contain border-l border-white/10 bg-black/95 pt-[max(4.5rem,env(safe-area-inset-top))] pb-[max(2rem,env(safe-area-inset-bottom))] shadow-2xl transition-transform duration-300 ease-out will-change-transform ${
            open ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <button
            type="button"
            tabIndex={open ? 0 : -1}
            className="absolute right-4 top-[max(1.25rem,env(safe-area-inset-top))] grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-[#e0141c]/25"
            onClick={() => setOpen(false)}
            aria-label={t("nav.close")}
          >
            <X className="h-5 w-5" />
          </button>

          <ul className="flex flex-col gap-1 px-7">
            {items.map((item) =>
              item.kind === "link" ? (
                <li key={item.label} className="border-b border-white/5 last:border-b-0">
                  <LocalizedLink
                    to={item.path}
                    tabIndex={open ? 0 : -1}
                    onClick={() => setOpen(false)}
                    className="block py-4 text-xl font-bold text-white transition-colors hover:text-[#e0141c]"
                  >
                    {item.label}
                  </LocalizedLink>
                </li>
              ) : (
                <li key={item.label} className="border-b border-white/5 last:border-b-0">
                  <LocalizedLink
                    to={item.path}
                    tabIndex={open ? 0 : -1}
                    onClick={() => setOpen(false)}
                    className="block py-4 text-xl font-bold text-white transition-colors hover:text-[#e0141c]"
                  >
                    {item.label}
                  </LocalizedLink>
                  <ul className="mb-3 ml-1 flex flex-col gap-1 border-l border-white/10 pl-4">
                    {item.children.map((child) => (
                      <li key={child.path}>
                        <LocalizedLink
                          to={child.path}
                          tabIndex={open ? 0 : -1}
                          onClick={() => setOpen(false)}
                          className="block py-2.5 text-base font-semibold text-white/70 transition-colors hover:text-[#e0141c]"
                        >
                          {child.label}
                        </LocalizedLink>
                      </li>
                    ))}
                  </ul>
                </li>
              ),
            )}
          </ul>

          <div className="mt-auto border-t border-white/10 px-7 pt-6">
            <LanguageSwitcher tone="dark" />
          </div>
        </nav>
      </div>
    </>
  );
}
