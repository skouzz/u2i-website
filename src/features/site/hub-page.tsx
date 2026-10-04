/**
 * Section hub — the index page of an IA section.
 *
 * One component serves /industries, /expertises, /projets, /u2i and the
 * overview of /references, because they are all the same shape: a hero, a line
 * of framing, and a grid of the section's entries. The differences between
 * sections live entirely in `ia.ts`, not here.
 */

import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

import { PageHero } from "@/components/PageHero";
import { useI18n } from "@/lib/i18n";
import { LocalizedLink } from "@/lib/i18n/LocalizedLink";
import { useSeo } from "@/lib/seo";
import { pick, type SiteSection } from "@/lib/site/ia";
import { Breadcrumb, ContactCta, EquipmentTeaser, SectionSwitcher } from "./shared";
import { splitLines } from "./split-lines";
import "./site.css";

export function SectionHubPage({ section }: { section: SiteSection }) {
  const { locale, link, t } = useI18n();
  const reduceMotion = useReducedMotion();

  useSeo({
    title: `${pick(section.label, locale)} — U2I Process`,
    description: pick(section.metaDescription ?? section.description, locale),
    path: link(section.path),
    breadcrumbs: [
      { label: locale === "en" ? "Home" : "Accueil", path: "/" },
      { label: pick(section.label, locale), path: section.path },
    ],
  });

  return (
    <main className="site-page">
      <PageHero
        id={section.id}
        breadcrumb={pick(section.label, locale)}
        eyebrow={pick(section.eyebrow, locale)}
        title={splitLines(pick(section.title, locale))}
        description={pick(section.description, locale)}
        linkLabel={t("site.explore")}
        linkHref="#entries"
        image={section.image}
        imageAlt={pick(section.title, locale)}
      />

      <section className="site-intro">
        <div className="wrap">
          <p className="site-intro__label">{pick(section.eyebrow, locale)}</p>
          <p className="site-intro__text">{pick(section.description, locale)}</p>
        </div>
      </section>

      <section id="entries" className="wrap pb-16" aria-label={pick(section.label, locale)}>
        <div className="site-grid">
          {section.entries.map((entry, index) => (
            <motion.article
              key={entry.slug}
              className="site-card"
              initial={reduceMotion ? false : { opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{
                duration: 0.45,
                ease: [0.22, 1, 0.36, 1],
                delay: Math.min(index, 4) * 0.05,
              }}
            >
              <LocalizedLink
                to={`${section.path}/${entry.slug}`}
                className="flex h-full flex-col focus:outline-none"
              >
                <div className="site-card__media">
                  <img
                    src={entry.image}
                    alt={pick(entry.title, locale)}
                    loading={index < 3 ? "eager" : "lazy"}
                    decoding="async"
                  />
                  <span className="site-card__index">{String(index + 1).padStart(2, "0")}</span>
                </div>
                <div className="site-card__body">
                  <h2 className="site-card__title">{pick(entry.label, locale)}</h2>
                  <p className="site-card__text">{pick(entry.summary, locale)}</p>
                  <span className="site-card__more">
                    {t("common.readMore")} <ArrowUpRight size={15} aria-hidden="true" />
                  </span>
                </div>
              </LocalizedLink>
            </motion.article>
          ))}
        </div>

        <EquipmentTeaser />
      </section>

      <SectionSwitcher current={section} />
      <ContactCta />
    </main>
  );
}
