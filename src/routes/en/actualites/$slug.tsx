import { createFileRoute } from "@tanstack/react-router";

import { ArticleDetailPage } from "@/features/news/detail";

export const Route = createFileRoute("/en/actualites/$slug")({
  component: EnglishArticleRoute,
});

function EnglishArticleRoute() {
  const { slug } = Route.useParams();
  return <ArticleDetailPage slug={slug} />;
}
