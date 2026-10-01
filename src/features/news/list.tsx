import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight, CalendarDays, Newspaper } from "lucide-react";

import { PageHero } from "@/components/PageHero";
import { NewsGridSkeleton } from "@/components/loading";
import workshopImage from "@/assets/about-workshop.jpg";
import { cmsApi } from "@/lib/cms";
import { useI18n } from "@/lib/i18n";
import { LocalizedLink } from "@/lib/i18n/LocalizedLink";
import { useSeo } from "@/lib/seo";
import "./news.css";

/** Localized date formatting: "12 mars 2026" / "March 12, 2026". */
export const formatDate = (value?: string | null, locale: "fr" | "en" = "fr"): string => {
  if (!value) return "";
  try {
    return new Intl.DateTimeFormat(locale === "en" ? "en-GB" : "fr-FR", {
      dateStyle: "long",
    }).format(new Date(value));
  } catch {
    return value.slice(0, 10);
  }
};

export function NewsListPage() {
  const { locale, t, link } = useI18n();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["cms", "articles", locale],
    queryFn: () => cmsApi.articles(locale),
    retry: 1,
  });

  const articles = data?.items ?? [];

  useSeo({
    title:
      locale === "en" ? "News — U2I Process" : "Actualités — U2I Process",
    description:
      locale === "en"
        ? "Projects, new equipment, certifications: follow life at the U2I workshop."
        : "Projets, nouveaux équipements, certifications : suivez la vie de l'atelier et de l'équipe U2I.",
  });

  return (
    <main className="news-page">
      <PageHero
        id="actualites"
        breadcrumb={t("news.hero.eyebrow")}
        eyebrow={t("news.hero.eyebrow")}
        title={
          locale === "en" ? (
            <>
              Our
              <br />
              <span>news.</span>
            </>
          ) : (
            <>
              Nos
              <br />
              <span>actualités.</span>
            </>
          )
        }
        description={t("news.hero.text")}
        linkLabel={t("common.contactUs")}
        linkHref={link("/contact")}
        image={workshopImage}
        imageAlt={locale === "en" ? "The U2I workshop in Akouda" : "L'atelier U2I à Akouda"}
      />

      <section className="contact-main" style={{ background: "#fff" }}>
        <div className="contact-wrap">
          {isLoading && <NewsGridSkeleton count={6} />}

          {isError && (
            <div className="news-empty">
              {locale === "en"
                ? "News is not available yet. The CMS goes live once the database is installed on the host."
                : "Les actualités ne sont pas encore disponibles. Le CMS sera actif après l'installation de la base de données sur l'hébergement."}
            </div>
          )}

          {!isLoading && !isError && articles.length === 0 && (
            <div className="news-empty">
              <Newspaper size={28} style={{ marginBottom: 10 }} />
              <br />
              {t("news.list.empty")}
            </div>
          )}

          <div className="news-grid">
            {articles.map((article) => (
              <LocalizedLink
                key={article.id}
                // Under /en the English slug is the canonical URL; without one
                // the French slug still resolves (server-side fallback).
                to={`/actualites/${locale === "en" ? (article.slugEn ?? article.slug) : article.slug}`}
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
                    {formatDate(article.publishedAt, locale)}
                  </span>
                  <h2 className="news-card__title">{article.title}</h2>
                  {article.excerpt ? <p className="news-card__excerpt">{article.excerpt}</p> : null}
                  <span className="news-card__more">
                    {locale === "en" ? "Read article" : "Lire l'article"} <ArrowRight size={13} />
                  </span>
                </div>
              </LocalizedLink>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
