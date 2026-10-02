import { useEffect, useState } from "react";
import {
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
import { useI18n, translateNavLabel, type Locale, type MessageKey } from "@/lib/i18n";
import { LanguageSwitcher } from "@/lib/i18n/LanguageSwitcher";
import { LocalizedLink } from "@/lib/i18n/LocalizedLink";

type NavLink = {
  label: string;
  url: string;
  newTab: boolean;
  children: { label: string; url: string; newTab: boolean }[];
};

/** Fallback navigation — replaced entirely when a CMS menu exists. */
const FALLBACK_LINKS: { label: string; url: string }[] = [
  { label: "Accueil", url: "/" },
  { label: "Qui sommes-nous", url: "/about" },
  { label: "Secteurs", url: "/secteurs" },
  { label: "Equipements", url: "/equipements" },
  { label: "References", url: "/references" },
  { label: "Actualités", url: "/actualites" },
  { label: "Contact", url: "/contact" },
];

/** Translation keys for the fallback nav, so it also speaks English. */
const FALLBACK_LABEL_KEYS: Record<string, MessageKey> = {
  "/": "nav.home",
  "/about": "nav.about",
  "/secteurs": "nav.sectors",
  "/equipements": "nav.equipment",
  "/references": "nav.references",
  "/actualites": "nav.news",
  "/contact": "nav.contact",
};

/** Normalize any nav item (menu tree or legacy page list) to a common shape. */
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

export function Navbar() {
  const { locale, t, link } = useI18n();
  const [open, setOpen] = useState(false);
  // Shared query cache: the Footer needs these same two responses, so they
  // are issued once per locale instead of once per component.
  const { data: navData } = useCmsNav(locale);
  const { data: settingsData } = useCmsSettings(locale);

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

  // Render the hard-coded menu until the CMS one arrives (or if it fails), so
  // the navbar is never empty on first paint or when the API is unreachable.
  const fallbackLinks: NavLink[] = FALLBACK_LINKS.map((l) => ({
    label: t(FALLBACK_LABEL_KEYS[l.url] ?? "nav.home"),
    url: l.url,
    newTab: false,
    children: [],
  }));
  const links = navData?.items?.length
    ? normalizeItems(navData.items, locale)
    : fallbackLinks;

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
              <img src={emailIcon} alt="Email" className="h-4 w-auto object-contain inline-block" />
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

          <nav className="hidden flex-1 lg:block" aria-label={t("nav.menu")}>
            <ul className="flex gap-6 [&:hover_a]:opacity-50">
              {links.map((item) => (
                <li key={item.label} className="relative group">
                  <a
                    href={link(item.url)}
                    target={item.newTab ? "_blank" : undefined}
                    rel={item.newTab ? "noreferrer" : undefined}
                    className="text-sm font-bold text-white transition-opacity hover:!opacity-100 hover:text-[#e0141c] relative"
                  >
                    {item.label}
                    <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-[#e0141c] transition-all duration-300 group-hover:w-full" />
                  </a>
                  {item.children.length > 0 ? (
                    <ul className="invisible absolute left-0 top-full z-50 min-w-52 border border-white/10 bg-black/95 py-2 opacity-0 shadow-xl backdrop-blur-xl transition-all duration-200 group-hover:visible group-hover:opacity-100">
                      {item.children.map((child) => (
                        <li key={child.label}>
                          <a
                            href={link(child.url)}
                            target={child.newTab ? "_blank" : undefined}
                            rel={child.newTab ? "noreferrer" : undefined}
                            className="flex items-center justify-between px-4 py-2 text-sm font-semibold text-white/80 transition-colors hover:bg-white/5 hover:text-[#e0141c]"
                          >
                            {child.label}
                          </a>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                  {item.children.length > 0 ? (
                    <ChevronDown className="pointer-events-none absolute -right-3 top-1/2 hidden h-3 w-3 -translate-y-1/2 text-white/50 lg:block" />
                  ) : null}
                </li>
              ))}
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
            {links.map((item) => (
              <li key={item.label} className="border-b border-white/5 last:border-b-0">
                <a
                  href={link(item.url)}
                  tabIndex={open ? 0 : -1}
                  onClick={() => setOpen(false)}
                  className="block py-4 text-xl font-bold text-white transition-colors hover:text-[#e0141c]"
                >
                  {item.label}
                </a>
                {item.children.length > 0 ? (
                  <ul className="mb-3 ml-1 flex flex-col gap-1 border-l border-white/10 pl-4">
                    {item.children.map((child) => (
                      <li key={child.label}>
                        <a
                          href={link(child.url)}
                          tabIndex={open ? 0 : -1}
                          onClick={() => setOpen(false)}
                          className="block py-2.5 text-base font-semibold text-white/70 transition-colors hover:text-[#e0141c]"
                        >
                          {child.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </li>
            ))}
          </ul>

          <div className="mt-auto border-t border-white/10 px-7 pt-6">
            <LanguageSwitcher tone="dark" />
          </div>
        </nav>
      </div>
    </>
  );
}
