import { createFileRoute } from "@tanstack/react-router";

import { CmsPageRoute } from "@/features/cms-page/renderer";

/**
 * English catch-all for CMS pages created in the dashboard: /en/p/<slug>.
 * The slug may be the English slug or, when no translation exists, the French
 * one — the API resolves both.
 */
export const Route = createFileRoute("/en/p/$")({
  component: EnglishCmsPageRoute,
});

function EnglishCmsPageRoute() {
  const { _splat } = Route.useParams();
  return <CmsPageRoute slug={_splat ?? ""} />;
}
