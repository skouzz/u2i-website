import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
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
import { cmsApi, type CmsNavItem, type CmsSettings } from "@/lib/cms";

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

/** Normalize any nav item (menu tree or legacy page list) to a common shape. */
function normalizeItems(items: CmsNavItem[]): NavLink[] {
  return items
    .filter((item) => item.label)
    .map((item) => ({
      label: item.label,
      url: item.url ?? (item.slug ? `/p/${item.slug}` : "#"),
      newTab: Boolean(item.opensNewTab),
      children: (item.children ?? [])
        .filter((child) => child.label)
        .map((child) => ({
          label: child.label,
          url: child.url ?? (child.slug ? `/p/${child.slug}` : "#"),
          newTab: Boolean(child.opensNewTab),
        })),
    }));
}

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [links, setLinks] = useState<NavLink[]>([]);
  const [settings, setSettings] = useState<CmsSettings | null>(null);

  useEffect(() => {
    let alive = true;
    const fallback = FALLBACK_LINKS.map((l) => ({
      label: l.label,
      url: l.url,
      newTab: false,
      children: [],
    }));
    cmsApi
      .nav()
      .then((res) => {
        if (!alive) return;
        setLinks(res.items?.length ? normalizeItems(res.items) : fallback);
      })
      .catch(() => {
        if (alive) setLinks(fallback);
      });
    cmsApi
      .settings()
      .then((res) => alive && setSettings(res.settings))
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, []);

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
    <header
      className={`sticky inset-x-0 top-0 z-50 border-b border-white/10 bg-black shadow-lg shadow-black/20 ${
        open ? "backdrop-blur-xl" : ""
      }`}
    >
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
        </div>
      </div>

      {/* Main nav */}
      <div className="py-2">
        <div className="wrap flex items-center gap-6">
          <Link to="/" aria-label="U2I" className="mr-4 shrink-0">
            <img
              src={logo}
              alt="Univers Inox"
              className="h-9 w-auto rounded-md object-contain sm:h-10"
            />
          </Link>

          <nav className="hidden flex-1 lg:block" aria-label="Menu principal">
            <ul className="flex gap-6 [&:hover_a]:opacity-50">
              {links.map((item) => (
                <li key={item.label} className="relative group">
                  <a
                    href={item.url}
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
                            href={child.url}
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
            aria-label="Menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <div
        className={`fixed inset-y-0 right-0 z-60 w-4/5 max-w-sm overflow-y-auto bg-black backdrop-blur-xl px-8 pt-24 pb-8 transition-transform duration-300 lg:hidden border-l border-white/10 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <button
          className="absolute top-6 right-6 grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white"
          onClick={() => setOpen(false)}
          aria-label="Fermer le menu"
        >
          <X className="h-5 w-5" />
        </button>

        <nav aria-label="Menu mobile">
          <ul className="flex flex-col gap-5">
            {links.map((item) => (
              <li key={item.label}>
                <a
                  href={item.url}
                  onClick={() => setOpen(false)}
                  className="text-2xl font-bold text-white transition-colors hover:text-[#e0141c]"
                >
                  {item.label}
                </a>
                {item.children.length > 0 ? (
                  <ul className="mt-2 ml-1 flex flex-col gap-2 border-l border-white/10 pl-4">
                    {item.children.map((child) => (
                      <li key={child.label}>
                        <a
                          href={child.url}
                          onClick={() => setOpen(false)}
                          className="text-base font-semibold text-white/70 transition-colors hover:text-[#e0141c]"
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
        </nav>
      </div>
    </header>
  );
}
