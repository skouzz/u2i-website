/**
 * The three pages under /references.
 *
 * Unlike every other entry in the IA, these do not render prose: they draw the
 * live reference rows from the CMS, merged with the logos bundled into the JS,
 * and fall back to the bundle whenever the database has nothing yet. So the
 * generic `EntryDetailPage` cannot draw them, and this component does instead.
 *
 * The merge is "additive, shadowed by managed rows", not "either/or": a managed
 * row replaces the bundled logo carrying the same image — even when the admin
 * has hidden it — so hiding a bundled logo in the dashboard actually hides it.
 * Replacing the whole grid as soon as one row exists is what previously made
 * 20+ logos vanish the first time somebody added a single reference.
 *
 * Routing is by slug inside one component rather than three, because the three
 * pages share the hero, the section chrome and the merge logic; only the grid
 * body differs.
 */

import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight, BadgeCheck, Building2, Handshake } from "lucide-react";
import { useState, type ReactNode } from "react";

import { PageHero } from "@/components/PageHero";
import { useI18n } from "@/lib/i18n";
import { LocalizedLink } from "@/lib/i18n/LocalizedLink";
import { cmsApi, type CmsReference, type CmsReferenceKind } from "@/lib/cms";
import { useSeo } from "@/lib/seo";
import {
  BUNDLED_CERTIFICATIONS,
  BUNDLED_CLIENTS,
  BUNDLED_PARTNERS,
  type BundledReference,
} from "@/lib/references-bundled";
import { findSection, pick, type SiteEntry, type SiteSection } from "@/lib/site/ia";
import { mergeReferences, visibleRows } from "@/lib/references-merge";
import { ContactCta, SectionSwitcher } from "./shared";
import { splitLines } from "./split-lines";
import "./site.css";

const REFERENCES_SECTION = findSection("/references");

/**
 * Which CMS reference kind each page under /references draws.
 *
 * The slugs are French and the enum values are English, so the mapping is
 * spelled out rather than derived by string surgery — the previous
 * `slug.replace(...)` version silently produced `undefined` for any slug that
 * did not match, which is exactly the kind of mapping that quietly empties a
 * grid.
 */
const KIND_BY_SLUG: Record<string, CmsReferenceKind> = {
  "references-clients": "client",
  partenaires: "partner",
  certifications: "certification",
};

/**
 * Managed rows of one kind, with the matching bundled logos appended.
 *
 * `kind` comes from the CMS enum, which grew a third value when this section
 * split into three pages; anything the API sends that we do not know about is
 * ignored rather than rendered under the wrong heading.
 */
function useMergedReferences(locale: string, kind: CmsReferenceKind, bundled: BundledReference[]) {
  const { data } = useQuery({
    queryKey: ["cms", "references", locale],
    queryFn: () => cmsApi.references(locale),
    staleTime: 60_000,
  });

  return mergeReferences(visibleRows(data?.items ?? [], kind), bundled);
}

/**
 * Grid of logos. Index-keyed because merged rows have no shared id.
 *
 * A tile falls back to the reference's name when its picture is missing or
 * fails to load. The overview counts rows, not images, so a client saved
 * before its logo was uploaded was counted there and then dropped here — the
 * page looked like it was missing references the database actually held.
 */
function LogoGrid({ items }: { items: BundledReference[] }) {
  const { t } = useI18n();
  // Tile keys whose image failed, so the <img> is not retried on every render.
  const [broken, setBroken] = useState<Set<string>>(() => new Set());

  if (items.length === 0) {
    return <p className="site-refs__group-text">{t("references.empty")}</p>;
  }

  return (
    <div className="site-refs__logos">
      {items.map((item, index) => {
        const key = `${item.title}-${index}`;
        const showImage = Boolean(item.image) && !broken.has(key);
        return (
          <div key={key} className="site-refs__logo">
            {showImage ? (
              <img
                src={item.image}
                alt={item.title}
                loading="lazy"
                decoding="async"
                onError={() =>
                  setBroken((current) => {
                    const next = new Set(current);
                    next.add(key);
                    return next;
                  })
                }
              />
            ) : (
              <span className="site-refs__logo-name">{item.title}</span>
            )}
          </div>
        );
      })}
    </div>
  );
}

function Group({
  id,
  icon: Icon,
  title,
  text,
  items,
}: {
  id: string;
  icon: typeof Building2;
  title: string;
  text: string;
  items: BundledReference[];
}) {
  return (
    <section className="site-refs__group" id={id} aria-labelledby={`${id}-title`}>
      <div className="site-refs__group-head">
        <div>
          <p className="site-intro__label inline-flex items-center gap-2">
            <Icon size={14} aria-hidden="true" />
            {title}
          </p>
          <h2 id={`${id}-title`} className="site-refs__group-title">
            {title}
          </h2>
        </div>
        <p className="site-refs__group-text">{text}</p>
      </div>
      <LogoGrid items={items} />
    </section>
  );
}

/** Share the page chrome for the three sub-pages and the section overview. */
function ReferencesShell({ entry, children }: { entry?: SiteEntry; children: ReactNode }) {
  const { locale, link, t } = useI18n();
  const section = REFERENCES_SECTION!;
  const path = entry ? `${section.path}/${entry.slug}` : section.path;
  const title = entry ? pick(entry.title, locale) : pick(section.title, locale);

  useSeo({
    title: `${title} — U2I Process`,
    description: pick(
      entry?.metaDescription ?? section.metaDescription ?? section.description,
      locale,
    ),
    ogImage: entry?.image ?? section.image,
    path: link(path),
    breadcrumbs: [
      { label: locale === "en" ? "Home" : "Accueil", path: "/" },
      { label: pick(section.label, locale), path: section.path },
      ...(entry ? [{ label: pick(entry.label, locale), path }] : []),
    ],
  });

  return (
    <main className="site-page">
      <PageHero
        id={entry?.slug ?? "references"}
        breadcrumb={entry ? pick(entry.label, locale) : pick(section.label, locale)}
        eyebrow={pick(section.eyebrow, locale)}
        title={entry ? title : splitLines(title)}
        description={pick(entry?.summary ?? section.description, locale)}
        linkLabel={t("site.explore")}
        linkHref="#groups"
        image={entry?.image ?? section.image}
        imageAlt={title}
      />
      <div id="groups">{children}</div>
      <SectionSwitcher current={section} />
      <ContactCta />
    </main>
  );
}

/**
 * Entry point used by the router.
 *
 * `sectionId` is passed by the route so this file does not have to import the
 * registry's lookup twice; an unknown slug renders the overview rather than a
 * blank page, which keeps a stale link from 404-ing the whole section.
 */
export function ReferencesPage({ slug }: { slug?: string }) {
  const { locale, t } = useI18n();
  const section = REFERENCES_SECTION!;

  const entry = slug ? section.entries.find((candidate) => candidate.slug === slug) : undefined;

  if (!slug) return <ReferencesOverview section={section} />;

  if (slug === "partenaires") return <PartnersPage entry={entry} />;
  if (slug === "certifications") return <CertificationsPage entry={entry} />;
  if (slug === "references-clients") return <ClientsPage entry={entry} />;

  // Unknown slug under /references/: show the overview.
  return <ReferencesOverview section={section} />;
}

function ReferencesOverview({ section }: { section: SiteSection }) {
  const { locale, t } = useI18n();
  const { data } = useQuery({
    queryKey: ["cms", "references", locale],
    queryFn: () => cmsApi.references(locale),
    staleTime: 60_000,
  });
  const counts = (data?.items ?? []).reduce<Record<string, number>>((acc, row: CmsReference) => {
    if (row.isVisible === false) return acc;
    acc[row.kind] = (acc[row.kind] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <ReferencesShell>
      <div className="wrap site-intro">
        <p className="site-intro__label">{pick(section.eyebrow, locale)}</p>
        <p className="site-intro__text">{pick(section.description, locale)}</p>
      </div>
      <div className="wrap">
        <div className="site-grid">
          {section.entries.map((entry) => {
            const count = counts[KIND_BY_SLUG[entry.slug] ?? ""] ?? 0;
            return (
              <article key={entry.slug} className="site-card">
                <div className="site-card__media">
                  <img src={entry.image} alt="" loading="lazy" decoding="async" />
                </div>
                <div className="site-card__body">
                  <h2 className="site-card__title">{pick(entry.label, locale)}</h2>
                  <p className="site-card__text">{pick(entry.summary, locale)}</p>
                  <p className="site-card__more">
                    {count > 0
                      ? `${count} ${locale === "en" ? (count > 1 ? "entries" : "entry") : count > 1 ? "références" : "référence"}`
                      : null}
                  </p>
                  <LocalizedLink to={`/references/${entry.slug}`} className="site-card__more">
                    {t("common.readMore")} <ArrowUpRight size={15} aria-hidden="true" />
                  </LocalizedLink>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </ReferencesShell>
  );
}

function ClientsPage({ entry }: { entry: SiteEntry | undefined }) {
  const { locale, t } = useI18n();

  // Managed client rows first, then the bundled clients grouped by industry.
  const managed = useMergedReferences(locale, "client", []);

  /*
   * A bundled client is dropped from its industry group when a managed row
   * already covers it. Matching on BOTH the image and the title matters:
   *
   *  - image is how the other two pages shadow, and it is what makes hiding a
   *    bundled logo in the dashboard actually hide it;
   *  - title catches the case where an admin re-uploads the same logo under a
   *    new filename, which would otherwise show the client twice.
   *
   * Only rows that will actually draw a logo may shadow: a name-only row that
   * shadowed "Sanofi" would hide the real logo and put a word in its place.
   */
  const drawn = managed.filter((row) => Boolean(row.image));
  const managedTitles = new Set(drawn.map((row) => row.title));
  const managedImages = new Set(drawn.map((row) => row.image));

  return (
    <ReferencesShell entry={entry}>
      <div className="wrap site-intro">
        <p className="site-intro__label">{t("references.clients.intro")}</p>
      </div>
      <div className="wrap">
        {BUNDLED_CLIENTS.map((group) => {
          const items = group.clients.filter(
            (client) => !managedTitles.has(client.title) && !managedImages.has(client.image),
          );
          return (
            <Group
              key={group.industrySlug}
              id={group.industrySlug}
              icon={Building2}
              title={group.label}
              text={
                locale === "en"
                  ? `Process lines, skids and equipment delivered to ${group.label.toLowerCase()} manufacturers.`
                  : `Lignes de procédé, skids et équipements livrés à des industriels du secteur ${group.label.toLowerCase()}.`
              }
              items={items}
            />
          );
        })}
        {managed.length > 0 ? (
          <Group
            id="autres-references"
            icon={Building2}
            title={t("references.clients.managedTitle")}
            text={
              locale === "en"
                ? "Additional client references added from the dashboard."
                : "Références clients supplémentaires ajoutées depuis le tableau de bord."
            }
            items={managed}
          />
        ) : null}
      </div>
    </ReferencesShell>
  );
}

function PartnersPage({ entry }: { entry: SiteEntry | undefined }) {
  const { locale, t } = useI18n();
  const partners = useMergedReferences(locale, "partner", BUNDLED_PARTNERS);

  return (
    <ReferencesShell entry={entry}>
      <div className="wrap site-intro">
        <p className="site-intro__label">{t("references.partners.intro")}</p>
      </div>
      <div className="wrap">
        <Group
          id="partenaires"
          icon={Handshake}
          title={locale === "en" ? "Technology partners" : "Partenaires technologiques"}
          text={
            locale === "en"
              ? "Equipment manufacturers and official distributors whose machines we install and maintain."
              : "Constructeurs d'équipements et distributeurs officiels dont nous installons et entretenons les machines."
          }
          items={partners}
        />
      </div>
    </ReferencesShell>
  );
}

function CertificationsPage({ entry }: { entry: SiteEntry | undefined }) {
  const { locale, t } = useI18n();
  const certifications = useMergedReferences(locale, "certification", BUNDLED_CERTIFICATIONS);

  return (
    <ReferencesShell entry={entry}>
      <div className="wrap site-intro">
        <p className="site-intro__label">{t("references.certifications.intro")}</p>
      </div>
      <div className="wrap">
        <Group
          id="certifications"
          icon={BadgeCheck}
          title={locale === "en" ? "Quality certifications" : "Certifications qualité"}
          text={
            locale === "en"
              ? "Our quality system, and the training records of the welders who work on your lines."
              : "Notre système qualité, et les attestations de formation des soudeurs qui travaillent sur vos lignes."
          }
          items={certifications}
        />
      </div>
    </ReferencesShell>
  );
}
