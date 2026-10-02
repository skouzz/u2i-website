import { createFileRoute, useParams } from "@tanstack/react-router";

import { ReferencesPage } from "@/features/site/references-page";

/** One of the three reference pages: clients, partners or certifications. */
export const Route = createFileRoute("/references/$slug")({
  component: ReferencesChildRoute,
});

function ReferencesChildRoute() {
  const { slug } = Route.useParams();
  return <ReferencesPage slug={slug} />;
}
