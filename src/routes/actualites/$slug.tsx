import { createFileRoute } from "@tanstack/react-router";

import { ArticleDetailPage } from "@/features/news/detail";

export const Route = createFileRoute("/actualites/$slug")({
  component: FrenchArticleRoute,
});

function FrenchArticleRoute() {
  const { slug } = Route.useParams();
  return <ArticleDetailPage slug={slug} />;
}
