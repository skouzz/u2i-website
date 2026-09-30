import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, CalendarDays, UserRound } from "lucide-react";

import { cmsApi } from "@/lib/cms";
import "./news.css";
import { formatDate } from "./list";
import { Route } from "@/routes/actualites/$slug";

/**
 * Minimal HTML sanitizer for CMS-authored article bodies.
 * Removes script/style/iframe/object/embed blocks and on* / javascript: attributes.
 */
function sanitizeArticleHtml(html: string): string {
  const template = document.createElement("template");
  template.innerHTML = html;

  const forbiddenTags = new Set(["script", "style", "iframe", "object", "embed", "link", "meta"]);
  template.content.querySelectorAll("*").forEach((el) => {
    if (forbiddenTags.has(el.tagName.toLowerCase())) {
      el.remove();
      return;
    }
    for (const attr of Array.from(el.attributes)) {
      const name = attr.name.toLowerCase();
      const value = attr.value.trim().toLowerCase();
      if (name.startsWith("on") || (name === "href" && value.startsWith("javascript:"))) {
        el.removeAttribute(attr.name);
      }
    }
  });

  return template.innerHTML;
}

export function ArticleDetailPage() {
  const { slug } = Route.useParams();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["cms", "article", slug],
    queryFn: () => cmsApi.article(slug),
    retry: 1,
  });

  const article = data?.article;

  return (
    <main className="news-page">
      <article className="article-page">
        <div className="article-wrap">
          <Link to="/actualites" className="article-back">
            <ArrowLeft size={14} /> Toutes les actualités
          </Link>

          {isLoading && <div className="news-empty">Chargement…</div>}

          {isError && <div className="news-empty">Article introuvable.</div>}

          {article && (
            <>
              <h1 className="article-title">{article.title}</h1>
              <div className="article-meta">
                {article.publishedAt ? (
                  <span>
                    <CalendarDays size={11} style={{ verticalAlign: "-1px" }} /> {formatDate(article.publishedAt)}
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
