/**
 * Primary navigation, derived from the IA.
 *
 * The top-level order is fixed here (it is a brand decision, not content):
 * Accueil, Industries, Expertises, Équipements, Projets, Références, U2I,
 * Actualités, Contact. Everything else — which sections have children, what
 * those children are called, where they live — comes from `ia.ts`, so the menu
 * can never drift from the set of pages that actually exist.
 *
 * Labels are resolved per locale here rather than passed around as keys,
 * because the navbar also renders menus authored in French in the dashboard.
 *
 * NOTE: IA labels are already correct in both languages and must NOT be pushed
 * through `translateNavLabel`. That map exists to translate CMS-authored French
 * labels, and it maps "industries" onto the legacy `nav.sectors` key — running
 * it over the IA silently renamed the new "Industries" menu item back to
 * "Secteurs". The CMS branch in the Navbar still uses it; nothing else does.
 */

import { pick, SITE_SECTIONS, type SiteEntry, type SiteSection } from "./ia";
import type { Locale } from "@/lib/i18n";

/** A child entry in the menu, with its label already in the active language. */
export interface NavChild {
  label: string;
  path: string;
  /** The IA record behind the link — lets the mega-panel show a real summary. */
  entry: SiteEntry;
}

/** A section with children: the label opens a panel as well as linking. */
export interface NavSectionItem {
  kind: "section";
  label: string;
  /** The section's own overview page. */
  path: string;
  description: string;
  image: string;
  children: NavChild[];
}

/** A plain link with no children (Accueil, Équipements, Actualités, Contact). */
export interface NavLinkItem {
  kind: "link";
  label: string;
  path: string;
}

export type NavItem = NavSectionItem | NavLinkItem;

export const HOME_PATH = "/";
export const EQUIPMENT_PATH = "/equipements";
export const NEWS_PATH = "/actualites";
export const CONTACT_PATH = "/contact";

/** Standalone pages that are not part of the IA registry. */
const EQUIPMENT_ITEM = { path: EQUIPMENT_PATH, fr: "Équipements", en: "Equipment" };
const NEWS_ITEM = { path: NEWS_PATH, fr: "Actualités", en: "News" };
const CONTACT_ITEM = { path: CONTACT_PATH, fr: "Contact", en: "Contact" };

function standaloneItem(
  item: { path: string; fr: string; en: string },
  locale: Locale,
): NavLinkItem {
  return { kind: "link", label: locale === "en" ? item.en : item.fr, path: item.path };
}

function requireSection(id: string): SiteSection {
  const found = SITE_SECTIONS.find((candidate) => candidate.id === id);
  if (!found) throw new Error(`Navigation refers to unknown section "${id}".`);
  return found;
}

/**
 * The full menu, ordered for the navbar and the footer.
 *
 * Home leads, then the IA sections and the standalone pages interleaved the
 * way they are meant to read, with Contact last.
 */
export function buildNavigation(locale: Locale): NavItem[] {
  const sectionItem = (section: SiteSection): NavSectionItem => ({
    kind: "section",
    label: pick(section.label, locale),
    path: section.path,
    description: pick(section.description, locale),
    image: section.image,
    children: section.entries.map((entry) => ({
      label: pick(entry.label, locale),
      path: `${section.path}/${entry.slug}`,
      entry,
    })),
  });

  return [
    { kind: "link", label: locale === "en" ? "Home" : "Accueil", path: HOME_PATH },
    sectionItem(requireSection("industries")),
    sectionItem(requireSection("expertises")),
    standaloneItem(EQUIPMENT_ITEM, locale),
    sectionItem(requireSection("projets")),
    sectionItem(requireSection("references")),
    sectionItem(requireSection("u2i")),
    standaloneItem(NEWS_ITEM, locale),
    standaloneItem(CONTACT_ITEM, locale),
  ];
}

/** Every locale-agnostic URL the IA can produce, for the sitemap. */
export function allSitePaths(): string[] {
  const sectionPaths = SITE_SECTIONS.flatMap((section) => [
    section.path,
    ...section.entries.map((entry) => `${section.path}/${entry.slug}`),
  ]);
  return [HOME_PATH, ...sectionPaths, EQUIPMENT_PATH, NEWS_PATH, CONTACT_PATH];
}
