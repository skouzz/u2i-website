import { createFileRoute } from "@tanstack/react-router";

import { CmsPageRoute } from "@/features/cms-page/renderer";

/**
 * Catch-all route: renders CMS pages created in the dashboard at /p/<slug>.
 * Static routes (/, /about, /contact, …) take precedence automatically.
 */
export const Route = createFileRoute("/p/$")({
  component: CmsPageFallbackRoute,
});

function CmsPageFallbackRoute() {
  const { _splat } = Route.useParams();
  return <CmsPageRoute slug={_splat ?? ""} />;
}
