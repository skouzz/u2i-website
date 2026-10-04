/**
 * Pieces shared by the IA-driven pages.
 *
 * The hub, the detail page and the references pages all need the same handful
 * of blocks — a breadcrumb, the "look elsewhere" switcher, the contact band,
 * the equipment teaser. They live here rather than in each page because a
 * section added to the IA should get all of them without the author having to
 * remember to copy them across.
 */

import { ArrowRight, ArrowUpRight, Check } from "lucide-react";

import { LocalizedLink } from "@/lib/i18n/LocalizedLink";
import { useI18n } from "@/lib/i18n";
import { SITE_SECTIONS, pick, type SiteSection } from "@/lib/site/ia";
import { EQUIPMENT_PATH } from "@/lib/site/navigation";
import workshopTeaserImage from "@/assets/about-workshop.jpg";
import "./site.css";

/** Accueil / Section / Page — the trail under the hero of every IA page. */
export function Breadcrumb({ section, current }: { section: SiteSection; current: string }) {
  const { locale, link, t } = useI18n();

  return (
    <nav className="site-breadcrumb" aria-label={t("nav.skipToContent")}>
      <LocalizedLink to="/">{locale === "en" ? "Home" : "Accueil"}</LocalizedLink>
      <ArrowRight size={12} aria-hidden="true" />
      <a href={link(section.path)}>{pick(section.label, locale)}</a>
      <ArrowRight size={12} aria-hidden="true" />
      <span aria-current="page">{current}</span>
    </nav>
  );
}

/**
 * Every other section, so a reader who landed on one page by accident can get
 * to the rest of the site without going back through the menu.
 */
export function SectionSwitcher({ current }: { current: SiteSection }) {
  const { locale, t } = useI18n();

  return (
    <section className="site-switcher" aria-labelledby="site-switcher-label">
      <div className="wrap">
        <h2 id="site-switcher-label" className="site-switcher__label">
          {t("site.otherSections")}
        </h2>
        <div className="site-switcher__links">
          {SITE_SECTIONS.map((section) => (
            <LocalizedLink
              key={section.id}
              to={section.path}
              className={section.id === current.id ? "is-current" : undefined}
              aria-current={section.id === current.id ? "page" : undefined}
            >
              {pick(section.label, locale)}
            </LocalizedLink>
          ))}
          <LocalizedLink to={EQUIPMENT_PATH}>
            {locale === "en" ? "Equipment" : "Équipements"}
          </LocalizedLink>
        </div>
      </div>
    </section>
  );
}

/** The closing band on every IA page. */
export function ContactCta() {
  const { t } = useI18n();

  return (
    <section className="site-cta">
      <div className="wrap site-cta__inner">
        <div>
          <h2 className="site-cta__title">{t("site.entryCtaTitle")}</h2>
          <p className="site-cta__text">{t("site.entryCtaText")}</p>
        </div>
        <LocalizedLink to="/contact" className="site-cta__button">
          {t("site.entryCta")} <ArrowUpRight size={16} aria-hidden="true" />
        </LocalizedLink>
      </div>
    </section>
  );
}

/**
 * Points to /equipements from every hub page.
 *
 * Équipements is deliberately one page rather than a section of its own, so it
 * has no children and would otherwise be invisible from inside the IA. This is
 * the one place that connects the two halves of the site.
 */
export function EquipmentTeaser() {
  const { t } = useI18n();

  return (
    <section className="site-teaser">
      <div className="site-teaser__media">
        <img src={workshopTeaserImage} alt="" loading="lazy" decoding="async" />
      </div>
      <div>
        <p className="site-teaser__label">{t("nav.equipment")}</p>
        <p className="site-teaser__text">{t("site.equipmentTeaser")}</p>
      </div>
      <LocalizedLink to={EQUIPMENT_PATH} className="site-teaser__link">
        {t("site.equipmentCta")} <ArrowRight size={15} aria-hidden="true" />
      </LocalizedLink>
    </section>
  );
}

/** The key-points checklist used on every entry detail page. */
export function KeyPoints({ points }: { points: readonly string[] }) {
  const { t } = useI18n();

  if (points.length === 0) return null;

  return (
    <div className="site-detail__aside">
      <p className="site-detail__aside-label">{t("site.keyPoints")}</p>
      <ul className="site-points">
        {points.map((point) => (
          <li key={point}>
            <Check size={15} aria-hidden="true" />
            <span>{point}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * What a detail route renders for a slug that is not in the IA.
 *
 * A stale link should say so rather than render an empty shell: the 404 copy is
 * translated, and the switcher gives the visitor somewhere to go.
 */
export function EntryMissing({ section }: { section?: SiteSection }) {
  const { t } = useI18n();

  return (
    <main className="site-page">
      <div className="wrap site-missing">
        <p className="site-missing__code">404</p>
        <h1 className="site-missing__title">{t("site.entryMissingTitle")}</h1>
        <p className="site-missing__text">{t("site.entryMissingBody")}</p>
        <LocalizedLink to={section ? section.path : "/"} className="site-cta__button">
          {t("common.backHome")} <ArrowUpRight size={16} aria-hidden="true" />
        </LocalizedLink>
        {section ? <SectionSwitcher current={section} /> : null}
      </div>
    </main>
  );
}
