import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, CalendarDays, UserRound } from "lucide-react";

import { cmsApi } from "@/lib/cms";
import { useSeo } from "@/lib/seo";
import { sanitizeArticleHtml } from "@/lib/sanitize-html";
import { ArticleSkeleton } from "@/components/loading";
import "./news.css";
import { formatDate } from "./list";
import { Route } from "@/routes/actualites/$slug";

export function ArticleDetailPage() {
  const { slug } = Route.useParams();
  const wantsPreview =
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("preview") === "1";
  const { data, isLoading, isError } = useQuery({
    queryKey: ["cms", "article", slug, wantsPreview ? "preview" : "live"],
    queryFn: () => cmsApi.article(slug, wantsPreview),
    retry: 1,
  });

  const article = data?.article;

  useSeo({
    title: article ? `${article.title} — Actualités U2I` : undefined,
    description: article?.excerpt ?? undefined,
    seo: article?.seo,
    ogImage: article?.coverImageUrl,
    ogType: "article",
    path: `/actualites/${slug}`,
    article: article
      ? {
          headline: article.title,
          description: article.excerpt,
          image: article.coverImageUrl,
          datePublished: article.publishedAt,
          dateModified: article.updatedAt ?? article.publishedAt,
          author: article.author,
        }
      : null,
    breadcrumbs: [
      { label: "Accueil", path: "/" },
      { label: "Actualités", path: "/actualites" },
      { label: article?.title ?? slug, path: `/actualites/${slug}` },
    ],
  });

  return (
    <main className="news-page">
      <article className="article-page">
        <div className="article-wrap">
          <Link to="/actualites" className="article-back">
            <ArrowLeft size={14} /> Toutes les actualités
          </Link>

          {isLoading && <ArticleSkeleton />}

          {isError && <div className="news-empty">Article introuvable.</div>}

          {article && (
            <>
              <h1 className="article-title">{article.title}</h1>
              <div className="article-meta">
                {article.publishedAt ? (
                  <span>
                    <CalendarDays size={11} style={{ verticalAlign: "-1px" }} />{" "}
                    {formatDate(article.publishedAt)}
                  </span>
                ) : null}
                {article.author ? (
                  <span>
                    <UserRound size={11} style={{ verticalAlign: "-1px" }} /> {article.author}
                  </span>
                ) : null}
              </div>

              {article.coverImageUrl ? (
                <div className="article-cover">
                  <img src={article.coverImageUrl} alt={article.title} />
                </div>
              ) : null}

              {article.body ? (
                <div
                  className="article-body"
                  dangerouslySetInnerHTML={{ __html: sanitizeArticleHtml(article.body) }}
                />
              ) : article.excerpt ? (
                <p className="article-body">{article.excerpt}</p>
              ) : null}
            </>
          )}
        </div>
      </article>
    </main>
  );
}
