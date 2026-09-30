import { useQuery } from "@tanstack/react-query";
import { Clock3, Mail, MapPin, Phone } from "lucide-react";

import { PageHero } from "@/components/PageHero";
import { PageBlocksSkeleton } from "@/components/loading";
import workshopImage from "@/assets/about-workshop.jpg";
import { cmsApi, type CmsBlock } from "@/lib/cms";
import { useSeo } from "@/lib/seo";
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
          {block.body ? <p className="cms-block-text">{block.body}</p> : null}
        </>
      );

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
  const { data, isLoading, isError } = useQuery({
    queryKey: ["cms", "page", slug],
    queryFn: () => cmsApi.page(slug),
    retry: 1,
  });

  const page = data?.page;

  useSeo({
    title: page ? `${page.heroTitle ?? page.title} — U2I Process` : undefined,
    description: page?.heroText ?? undefined,
    seo: page?.seo,
    ogImage: page?.heroImageUrl,
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
            <div className="news-empty">
              Cette page n'est pas encore disponible — elle sera visible dès qu'elle sera publiée
              dans le dashboard d'administration.
            </div>
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
        linkLabel="Nous contacter"
        linkHref="/contact"
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
