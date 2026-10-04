import { useEffect, useRef, useState, type ReactNode } from "react";
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

/**
 * True when a menu URL must be rendered as a plain anchor instead of a router
 * link: absolute URLs, protocol-relative URLs and in-page anchors.
 */
function isExternal(url: string) {
  return /^(https?:|mailto:|tel:|\/\/|#)/i.test(url);
}

/**
 * A menu entry, routed through the SPA when it points inside the site.
 *
 * The CMS menu accepts any URL, so an admin can link to a PDF or a supplier's
 * site. Forcing those through the router would either drop the scheme or try to
 * match them against a route, so external targets keep a plain <a>.
 */
function NavAnchor({
  to,
  external,
  newTab,
  children,
  className,
  onClick,
  onMouseEnter,
  onFocus,
  tabIndex,
}: {
  to: string;
  external?: boolean;
  newTab?: boolean;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onFocus?: () => void;
  tabIndex?: number;
}) {
  if (external) {
    return (
      <a
        href={to}
        className={className}
        onClick={onClick}
        onMouseEnter={onMouseEnter}
        onFocus={onFocus}
        tabIndex={tabIndex}
        target={newTab ? "_blank" : undefined}
        rel={newTab ? "noreferrer" : undefined}
      >
        {children}
      </a>
    );
  }
  return (
    <LocalizedLink
      to={to}
      className={className}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onFocus={onFocus}
      tabIndex={tabIndex}
      target={newTab ? "_blank" : undefined}
      rel={newTab ? "noreferrer" : undefined}
    >
      {children}
    </LocalizedLink>
  );
}

/**
 * Label for a CMS menu item, in the active language.
 *
 * The API already overlays the item's i18n onto `label` for the requested
 * language, so normally the label just needs reading. The legacy FR→key map is
 * only a fallback for menus written before per-item translations existed — and
 * it must never touch an already-translated label, because it would map the
 * English "Industries" back onto the French "Secteurs".
 */
function cmsLabel(item: CmsNavItem, locale: Locale) {
  if (locale === "fr" || item.isTranslated !== false) return item.label;
  return translateNavLabel(item.label, locale);
}

/**
 * Render the CMS menu exactly as the dashboard describes it.
 *
 * The dashboard owns the navigation, so every item becomes either a link or a
 * section carrying its real children. An earlier version matched CMS labels
 * against IA sections and, for anything that did not match, collapsed the whole
 * group to a single link pointing at its first child — silently throwing away
 * every sub-section an admin had just created.
 *
 * The IA is only used to *enrich* a CMS section: one whose label matches a
 * known section inherits its description, so the mega-panel still reads well
 * without the admin having to retype the copy.
 */
function fromCms(items: CmsNavItem[], locale: Locale, ia: NavItem[]): NavItem[] {
  const sections = ia.filter((item): item is NavSectionItem => item.kind === "section");
  const iaByLabel = new Map(sections.map((item) => [item.label.toLowerCase(), item]));
  const iaChildSummary = new Map(
    sections.flatMap((item) => item.children.map((child) => [child.path, child.summary])),
  );

  return items
    .filter((item) => item.label)
    .map((item) => {
      const url = item.url ?? (item.slug ? `/p/${item.slug}` : "#");
      const children = (item.children ?? [])
        .filter((child) => child.label)
        .map((child) => {
          const childUrl = child.url ?? (child.slug ? `/p/${child.slug}` : "#");
          return {
            label: cmsLabel(child, locale),
            path: childUrl,
            summary: iaChildSummary.get(childUrl) ?? "",
            external: isExternal(childUrl),
            newTab: Boolean(child.opensNewTab),
          };
        });

      if (children.length === 0) {
        return {
          kind: "link",
          label: cmsLabel(item, locale),
          path: url,
          external: isExternal(url),
          newTab: Boolean(item.opensNewTab),
        } satisfies NavItem;
      }

      const known = iaByLabel.get(item.label.toLowerCase());
      return {
        kind: "section",
        label: cmsLabel(item, locale),
        path: url,
        description: known?.description ?? "",
        image: known?.image ?? "",
        children,
      } satisfies NavItem;
    });
}

export function Navbar() {
  const { locale, t } = useI18n();
  const [open, setOpen] = useState(false);

  /**
   * Which section's mega-panel is open.
   *
   * Held in React state rather than done with CSS `:hover` because the panel has
   * to span the full width of the header: a panel positioned inside the `<li>`
   * can only be as wide as that item. State also lets it close on Escape and on
   * route change, both of which a keyboard or screen-reader user needs.
   */
  const [openSection, setOpenSection] = useState<string | null>(null);

  /**
   * Hover region covering the nav row AND the panel.
   *
   * The panel used to sit outside the <nav>, so moving the pointer down from a
   * menu item crossed a gap, fired mouseleave, and the panel closed before it
   * could be reached. Both now live inside this one container, and the panel is
   * anchored to its bottom edge, so there is no gap to cross.
   */
  const navRef = useRef<HTMLDivElement | null>(null);

  // Shared query cache: the Footer needs these same two responses, so they
  // are issued once per locale instead of once per component.
  const { data: navData } = useCmsNav(locale);
  const { data: settingsData } = useCmsSettings(locale);

  const ia = buildNavigation(locale);
  const items: NavItem[] = navData?.items?.length ? fromCms(navData.items, locale, ia) : ia;

  const activeSection =
    items.find(
      (item): item is NavSectionItem => item.kind === "section" && item.label === openSection,
    ) ?? null;

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

  // Close the mega-panel on Escape, on a click outside the hover region, and
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

  const closePanel = () => setOpenSection(null);

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

        {/* Nav row + mega-panel share one hover region, so sliding the pointer
            down from a menu item into the panel never leaves it. */}
        <div ref={navRef} className="relative" onMouseLeave={closePanel}>
          <div className="py-2">
            <div className="wrap flex items-center gap-6">
              <LocalizedLink to="/" aria-label="U2I" className="mr-4 shrink-0">
                <img
                  src={logo}
                  alt="Univers Inox"
                  className="h-9 w-auto rounded-md object-contain sm:h-10"
                />
              </LocalizedLink>

              <nav className="hidden flex-1 lg:block" aria-label={t("nav.menu")}>
                <ul className="flex flex-wrap items-center gap-x-6 gap-y-1">
                  {items.map((item) =>
                    item.kind === "link" ? (
                      <li key={item.label}>
                        <NavAnchor
                          to={item.path}
                          external={item.external}
                          newTab={item.newTab}
                          className="text-sm font-bold text-white transition-colors hover:text-[#e0141c]"
                          // Hovering a childless item must dismiss the panel that
                          // a previous section opened, not leave it stranded.
                          onMouseEnter={closePanel}
                          onClick={closePanel}
                        >
                          {item.label}
                        </NavAnchor>
                      </li>
                    ) : (
                      <li key={item.label}>
                        <div className="flex items-center gap-1">
                          {/* The section title is a real link to its overview —
                              with children, clicking the label should still go
                              somewhere rather than only opening the panel. */}
                          <NavAnchor
                            to={item.path}
                            external={isExternal(item.path)}
                            className="text-sm font-bold text-white transition-colors hover:text-[#e0141c]"
                            onMouseEnter={() => setOpenSection(item.label)}
                            onFocus={() => setOpenSection(item.label)}
                            onClick={closePanel}
                          >
                            {item.label}
                          </NavAnchor>
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

          {/* One panel at a time, spanning the header's full width. */}
          {activeSection ? (
            <div className="absolute inset-x-0 top-full hidden border-t border-white/10 bg-black/95 shadow-2xl backdrop-blur-xl lg:block">
              <div className="wrap grid gap-10 py-9 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)]">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#e0141c]">
                    {activeSection.label}
                  </p>
                  {activeSection.description ? (
                    <p className="mt-3 text-sm leading-relaxed text-white/70">
                      {activeSection.description}
                    </p>
                  ) : null}
                  {activeSection.path && !isExternal(activeSection.path) ? (
                    <NavAnchor
                      to={activeSection.path}
                      className="mt-5 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.12em] text-white transition-colors hover:text-[#e0141c]"
                      onClick={closePanel}
                    >
                      {t("site.explore")} <ArrowUpRight size={15} aria-hidden="true" />
                    </NavAnchor>
                  ) : null}
                </div>

                <ul className="grid gap-x-8 gap-y-1 sm:grid-cols-2 xl:grid-cols-3">
                  {activeSection.children.map((child) => (
                    <li key={child.path}>
                      <NavAnchor
                        to={child.path}
                        external={child.external}
                        newTab={child.newTab}
                        className="group flex flex-col gap-1 border-l-2 border-transparent py-2 pl-3 transition-colors hover:border-[#e0141c]"
                        onClick={closePanel}
                      >
                        <span className="text-sm font-bold text-white transition-colors group-hover:text-[#e0141c]">
                          {child.label}
                        </span>
                        {child.summary ? (
                          <span className="line-clamp-2 text-xs leading-relaxed text-white/50">
                            {child.summary}
                          </span>
                        ) : null}
                      </NavAnchor>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : null}
        </div>
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
                  <NavAnchor
                    to={item.path}
                    external={item.external}
                    newTab={item.newTab}
                    tabIndex={open ? 0 : -1}
                    onClick={() => setOpen(false)}
                    className="block py-4 text-xl font-bold text-white transition-colors hover:text-[#e0141c]"
                  >
                    {item.label}
                  </NavAnchor>
                </li>
              ) : (
                <li key={item.label} className="border-b border-white/5 last:border-b-0">
                  {item.path && !isExternal(item.path) ? (
                    <NavAnchor
                      to={item.path}
                      tabIndex={open ? 0 : -1}
                      onClick={() => setOpen(false)}
                      className="block py-4 text-xl font-bold text-white transition-colors hover:text-[#e0141c]"
                    >
                      {item.label}
                    </NavAnchor>
                  ) : (
                    <span className="block py-4 text-xl font-bold text-white">{item.label}</span>
                  )}
                  <ul className="mb-3 ml-1 flex flex-col gap-1 border-l border-white/10 pl-4">
                    {item.children.map((child) => (
                      <li key={child.path}>
                        <NavAnchor
                          to={child.path}
                          external={child.external}
                          newTab={child.newTab}
                          tabIndex={open ? 0 : -1}
                          onClick={() => setOpen(false)}
                          className="block py-2.5 text-base font-semibold text-white/70 transition-colors hover:text-[#e0141c]"
                        >
                          {child.label}
                        </NavAnchor>
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
