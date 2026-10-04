import { createFileRoute } from "@tanstack/react-router";

import { ReferencesPage } from "@/features/site/references-page";

/**
 * English mirror of /references/:slug.
 *
 * Slugs are shared across languages (they are part of the IA record, not a
 * translated string), so the English URLs read /en/references/partenaires —
 * a little ungainly, but it keeps one canonical slug per page and avoids a
 * translation table that could drift out of sync with the menu.
 */
export const Route = createFileRoute("/en/references/$slug")({
  component: ReferencesChildRoute,
});

function ReferencesChildRoute() {
  const { slug } = Route.useParams();
  return <ReferencesPage slug={slug} />;
}
