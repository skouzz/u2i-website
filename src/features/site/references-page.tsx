/**
 * The two pages under /references.
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
 * Clients and partners share ONE page, drawn by the section root itself rather
 * than by a card that then links somewhere else: they answer the same question
 * ("who do you work with?"), and splitting them only sent visitors hunting
 * through two nearly identical logo walls. Within the clients, the logos are
 * NOT split by industry either — one flat grid, because a logo already says
 * which sector it belongs to. Certifications keeps its own page, since a
 * quality certificate is a different kind of evidence from a customer logo.
 *
 * Routing is by slug inside one component rather than two, because both pages
 * share the hero, the section chrome and the merge logic; only the grid body
 * differs.
 */

import { useQuery } from "@tanstack/react-query";
import { BadgeCheck, Handshake } from "lucide-react";
import type { ReactNode } from "react";

import { PageHero } from "@/components/PageHero";
import { useI18n } from "@/lib/i18n";
import { LocalizedLink } from "@/lib/i18n/LocalizedLink";
import { cmsApi, type CmsReferenceKind } from "@/lib/cms";
import { useSeo } from "@/lib/seo";
import {
  BUNDLED_CERTIFICATIONS,
  BUNDLED_CLIENTS_FLAT,
  BUNDLED_PARTNERS,
  indexReferenceStems,
  referenceStemKey,
  referenceTitleKey,
  type BundledReference,
} from "@/lib/references-bundled";
import { findSection, pick, type SiteEntry } from "@/lib/site/ia";
import { ContactCta, SectionSwitcher } from "./shared";
import { splitLines } from "./split-lines";
import "./site.css";

const REFERENCES_SECTION = findSection("/references");

/** The combined clients + partners page. It is what the section root draws. */
const CLIENTS_PARTNERS_SLUG = "clients-partenaires";

/** Certifications keep their own page. */
const CERTIFICATIONS_SLUG = "certifications";

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

  const managed = (data?.items ?? []).filter((row) => row.kind === kind);
  // A bundled logo is shadowed by a managed row that carries the same image OR
  // the same title, both compared on normalised keys. Image alone is not enough:
  // an admin who re-uploaded a logo under a new filename, or a row saved in an
  // earlier build whose URL carries that build's hash, would otherwise be
  // published twice — the certificates were exactly that, 8 in the database and
  // the same 8 again from the bundle.
  const shadowedImages = indexReferenceStems(managed.map((row) => row.imageUrl));
  const shadowedTitles = new Set(managed.map((row) => referenceTitleKey(row.title)));

  const fromManaged: BundledReference[] = managed
    .filter((row) => row.isVisible !== false && row.imageUrl)
    .map((row) => ({ title: row.title, image: row.imageUrl as string }));

  const fromBundle = bundled.filter(
    (entry) =>
      !shadowedImages.has(referenceStemKey(entry.image)) &&
      !shadowedTitles.has(referenceTitleKey(entry.title)),
  );

  return [...fromManaged, ...fromBundle];
}

/** Grid of logos. Index-keyed because merged rows have no shared id. */
function LogoGrid({ items }: { items: BundledReference[] }) {
  const { t } = useI18n();

  if (items.length === 0) {
    return <p className="site-refs__group-text">{t("references.empty")}</p>;
  }

  return (
    <div className="site-refs__logos">
      {items.map((item, index) => (
        <div key={`${item.title}-${index}`} className="site-refs__logo">
          <img src={item.image} alt={item.title} loading="lazy" decoding="async" />
        </div>
      ))}
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
  icon: typeof Handshake;
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

/** Share the page chrome for the combined page and the certifications page. */
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
      <SubPages current={path} />
      <SectionSwitcher current={section} />
      <ContactCta />
    </main>
  );
}

/**
 * Links between the pages of this section.
 *
 * Needed because the section root now draws the clients and partners directly
 * rather than an index of cards: without this, certifications would only be
 * reachable by typing its URL. Reuses the section switcher's styling rather
 * than adding a second look for the same job.
 */
function SubPages({ current }: { current: string }) {
  const { locale } = useI18n();
  const section = REFERENCES_SECTION!;

  return (
    <section className="site-switcher" aria-labelledby="references-subpages-label">
      <div className="wrap">
        <h2 id="references-subpages-label" className="site-switcher__label">
          {locale === "en" ? "In this section" : "Dans cette rubrique"}
        </h2>
        <div className="site-switcher__links">
          {section.entries.map((entry) => {
            // The combined page has no page of its own: it IS the section root.
            const to =
              entry.slug === CLIENTS_PARTNERS_SLUG ? section.path : `${section.path}/${entry.slug}`;
            const isCurrent = to === current;
            return (
              <LocalizedLink
                key={entry.slug}
                to={to}
                className={isCurrent ? "is-current" : undefined}
                aria-current={isCurrent ? "page" : undefined}
              >
                {pick(entry.label, locale)}
              </LocalizedLink>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/**
 * Entry point used by the router.
 *
 * The section root and the combined slug both draw the merged clients +
 * partners page. So do the two retired slugs and any unknown one: a stale link
 * lands on the references themselves rather than on a blank page or a 404.
 */ export function ReferencesPage({ slug }: { slug?: string }) {
  const section = REFERENCES_SECTION!;

  if (slug === CERTIFICATIONS_SLUG) {
    const entry = section.entries.find((candidate) => candidate.slug === CERTIFICATIONS_SLUG);
    return <CertificationsPage entry={entry} />;
  }

  // Everything else draws the combined page: the section root, the combined
  // slug itself, the retired `/references/partenaires` and
  // `/references/references-clients` still sitting in old sitemaps and
  // bookmarks, and any unknown slug.
  //
  // It is rendered as the SECTION, not as an entry of it, so every one of those
  // URLs presents and canonicalises to /references instead of claiming a page
  // of its own that does not exist.
  return <ClientsAndPartnersPage />;
}

/**
 * Clients and partners on one page.
 *
 * Clients come first, grouped by industry, because they are the reason a
 * visitor is here; the technology partners close the page, since they explain
 * whose machines those lines are built around.
 */
/**
 * EVERY reference in ONE grid, with no register named anywhere.
 *
 * Certifications are NOT drawn here: they are documents, not companies, and
 * they have their own page under the same section.
 *
 * The page used to split its logos by register — clients here, partners there,
 * each under its own heading — and the split was worse than cosmetic: it made
 * the page read as if one group were missing, and a visitor who wanted to know
 * simply "who do you work with?" had to scan two walls to answer it.
 *
 * Every logo the site knows about is therefore drawn together under one neutral
 * heading: the managed rows first, then every bundled logo no managed row
 * already covers. The CMS stores them in one collection too — a company is a
 * `reference`, whatever it used to be filed as — so the page has nothing to
 * split on. There is no industry subgroup, no heading per group, and no
 * filter: one list, and the grid is the list.
 *
 * No industry subgroups either. The bundled clients used to be split into
 * "Pharmaceutique" and "Agroalimentaire" headings, which added headers and
 * sentences to say what the logos already show.
 *
 * Both kinds are read from the SAME query (one request), then merged here.
 */
function ClientsAndPartnersPage() {
  const { locale, t } = useI18n();

  // Every company, whatever it used to be filed as. Passing an empty bundle
  // keeps this hook to "what the dashboard stores"; the bundled logos are
  // merged below so they go through one shadowing pass.
  const managed = useMergedReferences(locale, "reference", []);

  /*
   * A bundled logo is dropped from the grid when a managed row already covers
   * it. Matching on BOTH the image and the title matters:
   *
   *  - image is what makes hiding a bundled logo in the dashboard actually hide
   *    it, instead of letting the bundled copy reappear;
   *  - title catches the case where an admin re-uploads the same logo under a
   *    new filename, which would otherwise show the logo twice.
   *
   * Both comparisons are made on normalised keys (filename stem, folded title)
   * rather than raw strings. The database is filled by hand and by import, so a
   * title arrives spelled "CEVA Santé Animale" on one row and "CEVA sante
   * animale" on another, and an image URL stored in an earlier build carries
   * that build's hash. Compared literally, each of those pairs rendered twice —
   * which is how the certifications ended up published as 16 entries for 8
   * certificates.
   */
  const managedTitles = new Set(managed.map((row) => referenceTitleKey(row.title)));
  const managedImages = indexReferenceStems(managed.map((row) => row.image));

  const isShadowed = (entry: BundledReference) =>
    managedTitles.has(referenceTitleKey(entry.title)) ||
    managedImages.has(referenceStemKey(entry.image));

  const clients = BUNDLED_CLIENTS_FLAT.filter((entry) => !isShadowed(entry));
  const partners = BUNDLED_PARTNERS.filter((entry) => !isShadowed(entry));
  // One collection, so one list: the bundled logos are appended in the order
  // they ship, which is every company regardless of the register it came from.

  return (
    <ReferencesShell>
      {/* The intro, from the three references.partners.* keys. */}
      <div className="wrap site-intro">
        <p className="site-intro__label">{t("references.partners.eyebrow")}</p>
        <h2 className="site-intro__title">{t("references.partners.title")}</h2>
        <p className="site-intro__text">{t("references.partners.text")}</p>
      </div>
      <div className="wrap">
        <Group
          id="references"
          icon={Handshake}
          title={t("references.all.title")}
          text={t("references.all.text")}
          items={[...managed, ...clients, ...partners]}
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
