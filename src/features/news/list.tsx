import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowRight, CalendarDays, Newspaper } from "lucide-react";

import { PageHero } from "@/components/PageHero";
import workshopImage from "@/assets/about-workshop.jpg";
import { cmsApi } from "@/lib/cms";
import "./news.css";

export const formatDate = (value?: string | null): string => {
  if (!value) return "";
  try {
    return new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" }).format(new Date(value));
  } catch {
    return value.slice(0, 10);
  }
};

export function NewsListPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["cms", "articles"],
    queryFn: cmsApi.articles,
    retry: 1,
  });

  const articles = data?.items ?? [];

  return (
    <main className="news-page">
      <PageHero
        id="actualites"
        breadcrumb="Actualités"
        eyebrow="Le journal d'U2I"
        title={
          <>
            Nos
            <br />
            <span>actualités.</span>
          </>
        }
        description="Projets, nouveaux équipements, certifications : suivez la vie de l'atelier et de l'équipe U2I."
        linkLabel="#coordonnees"
        linkHref="/contact"
        image={workshopImage}
        imageAlt="L'atelier U2I à Akouda"
      />

      <section className="contact-main" style={{ background: "#fff" }}>
        <div className="contact-wrap">
          {isLoading && <div className="news-empty">Chargement des actualités…</div>}

          {isError && (
            <div className="news-empty">
              Les actualités ne sont pas encore disponibles. Le CMS sera actif après
              l'installation de la base de données sur l'hébergement.
            </div>
          )}

          {!isLoading && !isError && articles.length === 0 && (
            <div className="news-empty">
              <Newspaper size={28} style={{ marginBottom: 10 }} />
              <br />
              Aucune actualité pour le moment — publiez votre premier article depuis
              le dashboard d'administration.
            </div>
          )}

          <div className="news-grid">
            {articles.map((article) => (
              <Link
                key={article.id}
                to="/actualites/$slug"
                params={{ slug: article.slug }}
                className="news-card"
              >
                <div className="news-card__media">
                  {article.coverImageUrl ? (
                    <img src={article.coverImageUrl} alt={article.title} loading="lazy" />
                  ) : null}
                </div>
                <div className="news-card__body">
                  <span className="news-card__date">
                    <CalendarDays size={11} style={{ verticalAlign: "-1px" }} />{" "}
                    {formatDate(article.publishedAt)}
                  </span>
                  <h2 className="news-card__title">{article.title}</h2>
                  {article.excerpt ? <p className="news-card__excerpt">{article.excerpt}</p> : null}
                  <span className="news-card__more">
                    Lire l'article <ArrowRight size={13} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
