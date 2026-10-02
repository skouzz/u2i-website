/**
 * Entry detail — the page behind every IA child.
 *
 * All twenty entries in `ia.ts` render through this one component. It reads the
 * entry's own bilingual fields, so a new child page needs no new component: add
 * a record and it appears in the hub grid, in the menu and here.
 */

import { motion, useReducedMotion } from "framer-motion";

import { PageHero } from "@/components/PageHero";
import { useI18n } from "@/lib/i18n";
import { LocalizedLink } from "@/lib/i18n/LocalizedLink";
import { useSeo } from "@/lib/seo";
import { pick, type SiteEntry, type SiteSection } from "@/lib/site/ia";
import {
  Breadcrumb,
  ContactCta,
  EntryMissing,
  EquipmentTeaser,
  KeyPoints,
  SectionSwitcher,
} from "./shared";
import "./site.css";

export function EntryDetailPage({
  section,
  entry,
}: {
  section: SiteSection;
  entry: SiteEntry | undefined;
}) {
  // A slug that is not in the IA is a stale link, not an error to swallow.
  //
  // This wrapper calls no hooks, so the early return is safe: putting the guard
  // inside the component that calls useSeo/useReducedMotion would make the
  // hook order depend on the slug and break the rules of hooks.
  if (!entry) return <EntryMissing section={section} />;
  return <EntryDetail section={section} entry={entry} />;
}

function EntryDetail({ section, entry }: { section: SiteSection; entry: SiteEntry }) {
  const { locale, link, t } = useI18n();
  const reduceMotion = useReducedMotion();

  const path = `${section.path}/${entry.slug}`;
  const body = pick(entry.body, locale);
  const points = pick(entry.points, locale);
  const siblings = section.entries.filter((candidate) => candidate.slug !== entry.slug);

  useSeo({
    title: `${pick(entry.metaTitle ?? entry.title, locale)} — U2I Process`,
    description: pick(entry.metaDescription ?? entry.summary, locale),
    ogImage: entry.image,
    path: link(path),
    breadcrumbs: [
      { label: locale === "en" ? "Home" : "Accueil", path: "/" },
      { label: pick(section.label, locale), path: section.path },
      { label: pick(entry.label, locale), path },
    ],
  });

  return (
    <main className="site-page">
      <PageHero
        id={entry.slug}
        breadcrumb={pick(entry.label, locale)}
        eyebrow={pick(section.label, locale)}
        title={pick(entry.title, locale)}
        description={pick(entry.summary, locale)}
        linkLabel={t("site.explore")}
        linkHref="#details"
        image={entry.image}
        imageAlt={pick(entry.title, locale)}
      />

      <div className="wrap">
        <Breadcrumb section={section} current={pick(entry.label, locale)} />
      </div>

      <section id="details" className="wrap site-detail__body">
        <motion.div
          className="site-detail__prose"
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          {body.map((paragraph) => (
            <p key={paragraph.slice(0, 40)}>{paragraph}</p>
          ))}

          <div className="site-related">
            <p className="site-related__label">{t("site.otherSections")}</p>
            <div className="site-related__grid">
              {siblings.map((sibling, index) => (
                <LocalizedLink
                  key={sibling.slug}
                  to={`${section.path}/${sibling.slug}`}
                  className="site-related__item"
                >
                  <span className="site-related__num">{String(index + 1).padStart(2, "0")}</span>
                  <span>{pick(sibling.label, locale)}</span>
                </LocalizedLink>
              ))}
            </div>
          </div>
        </motion.div>

        <KeyPoints points={points} />
      </section>

      <div className="wrap">
        <EquipmentTeaser />
      </div>

      <SectionSwitcher current={section} />
      <ContactCta />
    </main>
  );
}
