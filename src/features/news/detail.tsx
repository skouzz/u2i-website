import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, CalendarDays, UserRound } from "lucide-react";

import { cmsApi } from "@/lib/cms";
import { useI18n } from "@/lib/i18n";
import { LocalizedLink } from "@/lib/i18n/LocalizedLink";
import { useSeo } from "@/lib/seo";
import { sanitizeArticleHtml } from "@/lib/sanitize-html";
import { ArticleSkeleton } from "@/components/loading";
import "./news.css";
import { formatDate } from "./list";

/**
 * Shared by the French (/actualites/$slug) and English (/en/actualites/$slug)
 * routes — the slug is passed in so one implementation serves both.
 */
export function ArticleDetailPage({ slug }: { slug: string }) {
  const { locale, t } = useI18n();
  const wantsPreview =
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("preview") === "1";
  const { data, isLoading, isError } = useQuery({
    queryKey: ["cms", "article", slug, wantsPreview ? "preview" : "live", locale],
    queryFn: () => cmsApi.article(slug, wantsPreview, locale),
    retry: 1,
  });

  const article = data?.article;

  useSeo({
    title: article
      ? `${article.title} — ${locale === "en" ? "U2I News" : "Actualités U2I"}`
      : undefined,
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
      { label: t("nav.home"), path: "/" },
      { label: t("nav.news"), path: "/actualites" },
      { label: article?.title ?? slug, path: `/actualites/${slug}` },
    ],
  });

  return (
    <main className="news-page">
      <article className="article-page">
        <div className="article-wrap">
          <LocalizedLink to="/actualites" className="article-back">
            <ArrowLeft size={14} /> {t("news.detail.back")}
          </LocalizedLink>

          {isLoading && <ArticleSkeleton />}

          {isError && <div className="news-empty">{t("news.detail.notFound")}</div>}

          {article && (
            <>
              <h1 className="article-title">{article.title}</h1>
              <div className="article-meta">
                {article.publishedAt ? (
                  <span>
                    <CalendarDays size={11} style={{ verticalAlign: "-1px" }} />{" "}
                    {formatDate(article.publishedAt, locale)}
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
