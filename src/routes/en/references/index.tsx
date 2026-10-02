import { createFileRoute } from "@tanstack/react-router";

import { ReferencesPage } from "@/features/site/references-page";

/** English overview of the three reference pages. */
export const Route = createFileRoute("/en/references/")({
  component: ReferencesOverviewRoute,
});

function ReferencesOverviewRoute() {
  return <ReferencesPage />;
}
