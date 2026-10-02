import { createFileRoute } from "@tanstack/react-router";

import { ReferencesPage } from "@/features/site/references-page";

/** Overview of the three reference pages (clients / partners / certifications). */
export const Route = createFileRoute("/references/")({
  component: ReferencesOverviewRoute,
});

function ReferencesOverviewRoute() {
  return <ReferencesPage />;
}
