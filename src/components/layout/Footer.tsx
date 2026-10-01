import { useEffect, useState } from "react";
import { Facebook, Instagram, Linkedin, Mail, Phone, Youtube } from "lucide-react";
import logoImage from "@/assets/logo-u2i-removebg-preview.png";
import { cmsApi, type CmsArticle, type CmsNavItem, type CmsSettings } from "@/lib/cms";
import { useI18n, type MessageKey } from "@/lib/i18n";
import { LanguageSwitcher } from "@/lib/i18n/LanguageSwitcher";
import { LocalizedLink } from "@/lib/i18n/LocalizedLink";

const FALLBACK_FOOTER_LINKS: { label: string; url: string; key: MessageKey }[] = [
  { label: "Qui sommes nous", url: "/about", key: "nav.about" },
  { label: "Secteurs", url: "/secteurs", key: "nav.sectors" },
  { label: "Equipements", url: "/equipements", key: "nav.equipment" },
  { label: "References", url: "/references", key: "nav.references" },
  { label: "Contact", url: "/contact", key: "nav.contact" },
];

const SOCIALS = [
  { key: "facebook", label: "Facebook", Icon: Facebook },
  { key: "instagram", label: "Instagram", Icon: Instagram },
  { key: "linkedin", label: "LinkedIn", Icon: Linkedin },
  { key: "youtube", label: "YouTube", Icon: Youtube },
] as const;

export function Footer() {
  const { locale, t, link } = useI18n();
  const [settings, setSettings] = useState<CmsSettings | null>(null);
  const [footerLinks, setFooterLinks] = useState<{ label: string; url: string }[]>([]);
  const [latest, setLatest] = useState<CmsArticle[]>([]);

  useEffect(() => {
    let alive = true;
    cmsApi
      .settings(locale)
      .then((res) => alive && setSettings(res.settings))
      .catch(() => undefined);
    cmsApi
      .footerMenu(locale)
      .then((res) => {
        if (!alive) return;
        setFooterLinks(
          (res.items ?? [])
            .filter((item) => item.label)
            .map((item) => ({
              label: item.label,
              url: item.url ?? (item.slug ? `/p/${item.slug}` : "#"),
            })),
        );
      })
      .catch(() => undefined);
    cmsApi
      .articles(locale)
      .then((res) => alive && setLatest((res.items ?? []).slice(0, 2)))
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, [locale]);

  const footer = settings?.footer_json;
  const social = settings?.social_json;
  const siteName = settings?.site_name || "U2I Process";
  const phone = settings?.contact_phone || "+216 50 191 004";
  const email = settings?.contact_email || "u2i@u2iprocess.com";
  const address = settings?.address || "Akouda, Sousse — Tunisie";
  const copyright =
    footer?.copyright || `© ${new Date().getFullYear()} ${siteName} — Univers Inox Industriel`;
  const links = footerLinks.length
    ? footerLinks
    : FALLBACK_FOOTER_LINKS.map((l) => ({ label: t(l.key), url: l.url }));

  return (
    <footer className="border-t border-white/10 bg-black pt-20 text-white">
      <div className="wrap">
        <div className="flex flex-col justify-between gap-6 border-b border-white/10 pb-10 md:flex-row md:items-end">
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "2.5rem",
              fontWeight: 700,
              letterSpacing: "-0.02em",
            }}
          >
            {footer?.logoUrl ? (
              <img src={footer.logoUrl} alt={siteName} className="h-14 w-auto object-contain" />
            ) : (
              `${siteName} Group`
            )}
          </div>
          <div className="flex flex-wrap items-center gap-6 text-sm font-bold">
            {links.map((l) => (
              <a key={l.label} href={link(l.url)} className="hover:text-primary">
                {l.label}
              </a>
            ))}
          </div>
        </div>

        <div className="grid gap-14 py-14 md:grid-cols-2">
          <div>
            <h4 className="mb-6 text-xs font-bold uppercase tracking-[0.14em] text-white/50">
              {locale === "en" ? "Latest news" : "Dernières actualités"}
            </h4>
            <ul className="space-y-4">
              {latest.length === 0 ? (
                <li className="py-3 text-sm text-white/50">{t("news.list.empty")}</li>
              ) : (
                latest.map((article) => (
                  <li key={article.id}>
                    <LocalizedLink
                      to={`/actualites/${locale === "en" ? (article.slugEn ?? article.slug) : article.slug}`}
                      className="flex items-center justify-between border-b border-white/10 py-3 text-sm hover:text-primary"
                    >
                      <span className="font-semibold">{article.title}</span>
                      <span className="text-white/50">
                        {article.publishedAt
                          ? article.publishedAt.slice(0, 10).split("-").reverse().join(".")
                          : ""}
                      </span>
                    </LocalizedLink>
                  </li>
                ))
              )}
            </ul>
          </div>

          <div>
            <h4 className="mb-6 text-xs font-bold uppercase tracking-[0.14em] text-white/50">
              {t("footer.contact")}
            </h4>
            {footer?.description ? (
              <p className="mb-4 max-w-md text-sm text-white/70">{footer.description}</p>
            ) : null}
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-primary" />
                <a href={`tel:${phone.replace(/\s+/g, "")}`} className="hover:text-primary">
                  {phone}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-primary" />
                <a href={`mailto:${email}`} className="hover:text-primary">
                  {email}
                </a>
              </li>
              <li className="text-white/70">{address}</li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-start justify-between gap-6 border-t border-white/10 py-8 md:flex-row md:items-center">
          <div className="flex items-center gap-3">
            <LanguageSwitcher tone="dark" />
            {SOCIALS.map(({ key, label, Icon }) => {
              const href = social?.[key];
              if (!href) return null;
              return (
                <a
                  key={key}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  className="grid h-9 w-9 place-items-center rounded-full border border-white/20 transition hover:border-primary hover:text-primary"
                >
                  <Icon className="h-4 w-4" />
                </a>
              );
            })}
            <span className="ml-2 text-xs text-white/50">{phone}</span>
          </div>
        </div>

        <div className="border-t border-white/10 py-6 text-center text-xs text-white/50">
          {copyright} · {address}
          <span className="ml-4 inline-flex items-center gap-2">
            <Phone className="inline h-3 w-3 text-primary" /> {phone}
            <a
              href={`mailto:${email}`}
              className="ml-3 inline-block hover:opacity-90 transition-opacity"
              aria-label="Email"
            >
              <img src={logoImage} alt="" aria-hidden="true" className="hidden" />
              <Mail className="inline h-3 w-3 text-primary" />
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}

/** Re-exported for potential reuse (type used by footer menu consumers). */
export type { CmsNavItem };
