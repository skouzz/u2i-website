/**
 * Route factories for the IA-driven pages.
 *
 * Each section needs a hub route and a `$slug` route, in both languages — ten
 * pairs of files that would all contain the same two lines. These factories
 * build the component instead, so a route file is a single `createFileRoute`
 * call naming its section.
 *
 * The section is resolved at module load, not at render, so a route file
 * pointing at a section that does not exist fails loudly on import (and
 * therefore at build time) instead of rendering an empty page in production.
 */

import { useParams } from "@tanstack/react-router";

import { findSection, type SiteSection } from "@/lib/site/ia";
import { EntryDetailPage } from "./detail-page";
import { SectionHubPage } from "./hub-page";

function requireSection(sectionPath: string): SiteSection {
  const section = findSection(sectionPath);
  if (!section) {
    throw new Error(
      `Route refers to "${sectionPath}", which is not a section in src/lib/site/ia.ts.`,
    );
  }
  return section;
}

/** Component for the index route of a section. */
export function hubFor(sectionPath: string) {
  const section = requireSection(sectionPath);
  return function SectionHub() {
    return <SectionHubPage section={section} />;
  };
}

/**
 * Component for the `$slug` route of a section.
 *
 * The slug is read loosely because the same component serves both the French
 * and the English route: each has its own generated param type, and threading
 * the route id through the factory would mean the factory could no longer be
 * called from a plain module.
 */
export function detailFor(sectionPath: string) {
  const section = requireSection(sectionPath);
  return function SectionEntry() {
    const params = useParams({ strict: false }) as { slug?: string };
    return (
      <EntryDetailPage
        section={section}
        entry={section.entries.find((e) => e.slug === params.slug)}
      />
    );
  };
}
