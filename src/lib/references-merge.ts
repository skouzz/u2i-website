/**
 * How the references of a page are assembled.
 *
 * Pulled out of `references-page.tsx` so it can be executed by a test. The bug
 * it fixes — a reference counted on the overview but never rendered — shipped
 * twice before, both times because the logic lived inside a React hook where
 * no check could reach it.
 *
 * The model is unchanged: the logos bundled in the JS are the catalogue, the
 * dashboard adds to them, and a managed row replaces the bundled logo it
 * covers rather than the whole grid.
 */

import type { CmsReference, CmsReferenceKind } from "@/lib/cms";
import type { BundledReference } from "./references-bundled";

/**
 * Merge managed rows with the bundled logos of one kind.
 *
 * Two rules that are easy to get wrong, and were:
 *
 *  - a row with no picture is **kept**, with an empty `image`. The grid renders
 *    its name. Dropping it made the overview count a reference the page never
 *    showed, which is the symptom this whole file exists to prevent.
 *  - only a row that will actually draw a logo may **shadow** a bundled one. A
 *    name-only row that shadowed "Sanofi" would hide the real logo and put a
 *    word in its place.
 */
export function mergeReferences(
  managed: readonly CmsReference[],
  bundled: readonly BundledReference[],
  { matchTitle = false }: { matchTitle?: boolean } = {},
): BundledReference[] {
  const visible = managed.filter((row) => row.isVisible !== false);

  // Rows that will render as an image are the only ones allowed to shadow.
  const drawn = visible.filter((row) => Boolean(row.imageUrl));

  const shadowedImages = new Set(drawn.map((row) => row.imageUrl as string));
  const shadowedTitles = matchTitle ? new Set(drawn.map((row) => row.title)) : new Set<string>();

  const fromManaged: BundledReference[] = visible.map((row) => ({
    title: row.title,
    image: row.imageUrl ?? "",
  }));

  const fromBundle = bundled.filter(
    (entry) => !shadowedImages.has(entry.image) && !shadowedTitles.has(entry.title),
  );

  return [...fromManaged, ...fromBundle];
}

/** Visible rows of one kind — hidden ones never reach the page. */
export function visibleRows(
  items: readonly CmsReference[],
  kind: CmsReferenceKind,
): CmsReference[] {
  return items.filter((row) => row.kind === kind && row.isVisible !== false);
}
