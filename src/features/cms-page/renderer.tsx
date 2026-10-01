import { useQuery } from "@tanstack/react-query";
import { Clock3, Mail, MapPin, Phone } from "lucide-react";

import { PageHero } from "@/components/PageHero";
import { PageBlocksSkeleton } from "@/components/loading";
import workshopImage from "@/assets/about-workshop.jpg";
import { cmsApi, type CmsBlock } from "@/lib/cms";
import { useI18n } from "@/lib/i18n";
import { useSeo } from "@/lib/seo";
import { sanitizeArticleHtml as sanitizeBlockHtml } from "@/lib/sanitize-html";
import "@/features/contact/contact.css";
import "./cms-page.css";

interface CmsPageRouteProps {
  slug: string;
  fallbackImage?: string;
}

function BlockRenderer({ block }: { block: CmsBlock }) {
  switch (block.type) {
    case "heading":
      return block.title ? <h2 className="cms-block-heading">{block.title}</h2> : null;

    case "text":
      return (
        <>
          {block.title ? <h3 className="cms-block-subheading">{block.title}</h3> : null}
          {block.body ? (
            <div
              className="cms-block-text"
              dangerouslySetInnerHTML={{ __html: sanitizeBlockHtml(block.body) }}
            />
          ) : null}
        </>
      );

    case "button":
      if (!block.title || !block.body) return null;
      return (
        <p className="cms-block-button">
          <a
            className="contact-submit"
            href={block.body}
            target={block.body.startsWith("http") ? "_blank" : undefined}
            rel={block.body.startsWith("http") ? "noreferrer" : undefined}
          >
            {block.title}
          </a>
        </p>
      );

    case "quote":
      return block.body ? (
        <blockquote className="cms-block-quote">
          <p>{block.body}</p>
          {block.title ? <cite>— {block.title}</cite> : null}
        </blockquote>
      ) : null;

    case "spacer": {
      const height = Math.min(Math.max(parseInt(block.body ?? "48", 10) || 48, 8), 400);
      return <div style={{ height }} aria-hidden="true" />;
    }

    case "video": {
      const src = block.imageUrl ?? "";
      const embed = src.match(
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]{6,})/,
      );
      if (!src) return null;
      return embed ? (
        <figure className="cms-block-video">
          <div className="cms-block-video__frame">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${embed[1]}`}
              title={block.title ?? "Vidéo"}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              loading="lazy"
            />
          </div>
          {block.title ? <figcaption>{block.title}</figcaption> : null}
        </figure>
      ) : (
        <p className="cms-block-text">
          <a href={src} target="_blank" rel="noreferrer">
            {block.title || "Voir la vidéo"}
          </a>
        </p>
      );
    }

    case "html":
      // Admin-authored HTML (dashboard access is authenticated + CSRF-guarded).
      return block.body ? (
        <div className="cms-block-html" dangerouslySetInnerHTML={{ __html: block.body }} />
      ) : null;

    case "image":
      return block.imageUrl ? (
        <figure className="cms-block-image">
          <img src={block.imageUrl} alt={block.title ?? ""} loading="lazy" />
          {block.title ? <figcaption>{block.title}</figcaption> : null}
        </figure>
      ) : null;

    case "gallery":
      return (
        <div className="cms-block-gallery">
          {(block.images ?? []).map((src, index) => (
            <img
              key={`${src}-${index}`}
              src={src}
              alt={block.title ?? `Image ${index + 1}`}
              loading="lazy"
            />
          ))}
        </div>
      );

    case "contact_info":
      return (
        <div className="contact-details cms-block-contact" style={{ gridColumn: "1 / -1" }}>
          <h3>Coordonnées</h3>
          <a className="contact-detail" href={`tel:${(block.title ?? "").replace(/\s+/g, "")}`}>
            <span className="contact-detail__icon">
              <Phone size={19} aria-hidden="true" />
            </span>
            <span>
              <small>Téléphone</small>
              <strong>{block.title ?? ""}</strong>
            </span>
          </a>
          <a className="contact-detail" href={`mailto:${block.body ?? ""}`}>
            <span className="contact-detail__icon">
              <Mail size={19} aria-hidden="true" />
            </span>
            <span>
              <small>E-mail</small>
              <strong>{block.body ?? ""}</strong>
            </span>
          </a>
          <div className="contact-detail">
            <span className="contact-detail__icon">
              <MapPin size={19} aria-hidden="true" />
            </span>
            <span>
              <small>Adresse</small>
              <strong>{block.imageUrl ?? ""}</strong>
            </span>
          </div>
          <div className="contact-hours">
            <Clock3 size={16} aria-hidden="true" />
            <span>Du lundi au vendredi</span>
          </div>
        </div>
      );

    default:
      return null;
  }
}

export function CmsPageRoute({ slug, fallbackImage }: CmsPageRouteProps) {
  const { locale, t, link } = useI18n();
  // Draft preview: the API only honors ?preview=1 for logged-in admins — this
  // flag just asks the backend; authorization is enforced server-side.
  const wantsPreview =
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("preview") === "1";
  const { data, isLoading, isError } = useQuery({
    queryKey: ["cms", "page", slug, wantsPreview ? "preview" : "live", locale],
    queryFn: () => cmsApi.page(slug, wantsPreview, locale),
    retry: 1,
  });

  const page = data?.page;

  useSeo({
    title: page ? `${page.heroTitle ?? page.title} — U2I Process` : undefined,
    description: page?.heroText ?? undefined,
    seo: page?.seo,
    ogImage: page?.heroImageUrl,
    path: `/p/${slug}`,
    breadcrumbs: [
      { label: t("nav.home"), path: "/" },
      { label: page?.title ?? slug, path: `/p/${slug}` },
    ],
  });

  if (isLoading) {
    return (
      <main className="contact-page">
        <PageBlocksSkeleton />
      </main>
    );
  }

  if (isError || !page) {
    return (
      <main className="contact-page">
        <div className="contact-main">
          <div className="contact-wrap">
            <div className="news-empty">{t("cms.notAvailable")}</div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="contact-page">
      <PageHero
        id={page.slug}
        breadcrumb={page.eyebrow ?? page.title}
        eyebrow={page.eyebrow ?? ""}
        title={<>{page.heroTitle ?? page.title}</>}
        description={page.heroText ?? ""}
        linkLabel={t("common.contactUs")}
        linkHref={link("/contact")}
        image={page.heroImageUrl ?? fallbackImage ?? workshopImage}
        imageAlt={page.title}
      />

      <section className="contact-main" style={{ background: "#fff" }}>
        <div className="contact-wrap cms-blocks">
          {data.blocks.map((block, index) => (
            <BlockRenderer key={index} block={block} />
          ))}
        </div>
      </section>
    </main>
  );
}
