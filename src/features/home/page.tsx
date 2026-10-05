import { useQuery } from "@tanstack/react-query";

import { cmsApi, type CmsHomeBlock } from "@/lib/cms";
import { useCmsArticles } from "@/lib/cms-queries";
import { useI18n } from "@/lib/i18n";
import { DefaultHomePage } from "./default-page";

/**
 * Homepage: renders CMS-managed sections when the admin has configured them
 * (Homepage builder), otherwise falls back to the original designed homepage.
 */
export function HomePage() {
  const { locale } = useI18n();
  const { data, isLoading } = useQuery({
    queryKey: ["cms", "home", locale],
    queryFn: () => cmsApi.home(locale),
    staleTime: 60_000,
    retry: 1,
  });

  const blocks = data?.items ?? [];

  if (isLoading) {
    return <DefaultHomePage />;
  }

  if (blocks.length === 0) {
    return <DefaultHomePage />;
  }

  return <CmsHomePage blocks={blocks} />;
}

function CmsHomePage({ blocks }: { blocks: CmsHomeBlock[] }) {
  return (
    <main id="main">
      {blocks.map((block, index) => (
        <HomeBlock key={`${block.type}-${index}`} block={block} />
      ))}
    </main>
  );
}

function HomeBlock({ block }: { block: CmsHomeBlock }) {
  const { t, link } = useI18n();
  const config = block.config ?? {};
  const items = Array.isArray(config.items) ? (config.items as Record<string, string>[]) : [];
  const buttonLabel = String(config.buttonLabel ?? "");
  const buttonUrl = String(config.buttonUrl ?? "/contact");

  switch (block.type) {
    case "hero":
      return (
        <section className="relative flex min-h-[70svh] items-center overflow-hidden bg-black">
          {block.imageUrl ? (
            <img
              src={block.imageUrl}
              alt=""
              className="absolute inset-0 h-full w-full object-cover opacity-70"
              loading="eager"
            />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-black/20" />
          <div className="wrap relative z-10 py-24">
            <h1
              className="max-w-3xl text-white"
              style={{
                fontSize: "clamp(2.6rem, 6vw, 5rem)",
                lineHeight: 1.05,
                fontWeight: 800,
                letterSpacing: "-0.025em",
              }}
            >
              {block.title}
            </h1>
            {block.subtitle ? (
              <p className="mt-4 max-w-2xl text-lg text-white/85">{block.subtitle}</p>
            ) : null}
            {block.body ? <p className="mt-2 max-w-2xl text-white/70">{block.body}</p> : null}
            {buttonLabel ? (
              <a href={buttonUrl} className="btn btn-red mt-8 inline-flex">
                {buttonLabel}
              </a>
            ) : null}
          </div>
        </section>
      );

    case "about":
      return (
        <section className="section-paper">
          <div className="wrap grid items-center gap-12 lg:grid-cols-2">
            <div>
              <h2 className="text-4xl font-black text-neutral-900">{block.title}</h2>
              <div className="mb-8 mt-4 h-1 w-16 bg-[#e0141c]" />
              <p className="whitespace-pre-line text-neutral-600">{block.body}</p>
              {buttonLabel ? (
                <a href={buttonUrl} className="btn btn-red mt-8 inline-flex">
                  {buttonLabel}
                </a>
              ) : null}
            </div>
            {block.imageUrl ? (
              <img
                src={block.imageUrl}
                alt={block.title ?? ""}
                className="w-full rounded-2xl object-cover shadow-2xl"
                loading="lazy"
              />
            ) : null}
          </div>
        </section>
      );

    case "services":
    case "projects":
    case "team":
      return (
        <section className={block.type === "projects" ? "section-dark" : "section-paper"}>
          <div className="wrap">
            <div className="mb-12 text-center">
              {block.subtitle ? (
                <p className="mb-3 text-sm font-bold uppercase tracking-widest text-[#e0141c] italic">
                  {block.subtitle}
                </p>
              ) : null}
              <h2
                className={`font-black ${block.type === "projects" ? "text-white" : "text-neutral-900"}`}
                style={{ fontSize: "clamp(2rem, 4vw, 3.2rem)" }}
              >
                {block.title}
              </h2>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((item, i) => (
                <div
                  key={i}
                  className={`group overflow-hidden rounded-2xl border transition-all duration-300 hover:-translate-y-1 ${
                    block.type === "projects"
                      ? "border-white/10 bg-neutral-900 hover:border-white/25"
                      : "border-neutral-100 bg-white shadow-sm hover:shadow-lg"
                  }`}
                >
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.title ?? item.name ?? ""}
                      className="aspect-[4/3] w-full object-cover"
                      loading="lazy"
                    />
                  ) : null}
                  <div className="p-6">
                    <h3
                      className={`mb-2 text-lg font-bold ${block.type === "projects" ? "text-white" : "text-neutral-900"}`}
                    >
                      {item.title ?? item.name ?? item.value}
                    </h3>
                    {(item.text ?? item.role ?? item.label) ? (
                      <p
                        className={`text-sm ${block.type === "projects" ? "text-white/70" : "text-neutral-600"}`}
                      >
                        {item.text ?? item.role ?? item.label}
                      </p>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      );

    case "stats":
      return (
        <section className="section-red">
          <div className="wrap">
            {block.title ? (
              <h2 className="mb-10 text-center text-3xl font-black text-white">{block.title}</h2>
            ) : null}
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {items.map((item, i) => (
                <div key={i} className="text-center">
                  <div className="text-5xl font-black text-white">{item.value}</div>
                  <div className="mt-2 text-xs font-bold uppercase tracking-[0.2em] text-white/70">
                    {item.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      );

    case "features":
      return (
        <section className="section-paper">
          <div className="wrap">
            <h2 className="mb-10 text-center text-3xl font-black text-neutral-900">
              {block.title}
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((item, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm"
                >
                  <h3 className="mb-2 font-bold text-neutral-900">{item.title ?? item.value}</h3>
                  <p className="text-sm text-neutral-600">{item.text ?? item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      );

    case "testimonials":
      return (
        <section className="section-gray">
          <div className="wrap">
            <h2 className="mb-10 text-center text-3xl font-black text-neutral-900">
              {block.title}
            </h2>
            <div className="grid gap-6 md:grid-cols-2">
              {items.map((item, i) => (
                <figure key={i} className="rounded-2xl bg-white p-8 shadow-sm">
                  <blockquote className="text-neutral-700">« {item.text} »</blockquote>
                  <figcaption className="mt-4 text-sm font-bold text-[#e0141c]">
                    {item.author}
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      );

    case "faq":
      return (
        <section className="section-paper">
          <div className="wrap mx-auto max-w-3xl">
            <h2 className="mb-10 text-center text-3xl font-black text-neutral-900">
              {block.title}
            </h2>
            {items.map((item, i) => (
              <details
                key={i}
                className="group mb-3 rounded-xl border border-neutral-200 bg-white p-5"
              >
                <summary className="cursor-pointer font-bold text-neutral-900">
                  {item.question}
                </summary>
                <p className="mt-3 text-sm text-neutral-600">{item.answer}</p>
              </details>
            ))}
          </div>
        </section>
      );

    case "gallery":
      return (
        <section className="section-paper">
          <div className="wrap">
            {block.title ? (
              <h2 className="mb-10 text-center text-3xl font-black text-neutral-900">
                {block.title}
              </h2>
            ) : null}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {items.map((item, i) => (
                <img
                  key={i}
                  src={item.image ?? item.url}
                  alt=""
                  className="aspect-square w-full rounded-xl object-cover"
                  loading="lazy"
                />
              ))}
            </div>
          </div>
        </section>
      );

    case "articles":
      return <HomeArticlesBlock title={block.title} />;

    case "cta":
      return (
        <section className="section-red">
          <div className="wrap py-4 text-center">
            <h2 className="text-3xl font-black text-white md:text-4xl">{block.title}</h2>
            {block.body ? (
              <p className="mx-auto mt-3 max-w-2xl text-white/85">{block.body}</p>
            ) : null}
            {buttonLabel ? (
              <a href={buttonUrl} className="btn btn-white mt-8 inline-flex">
                {buttonLabel}
              </a>
            ) : null}
          </div>
        </section>
      );

    case "contact":
      return (
        <section className="section-paper">
          <div className="wrap text-center">
            <h2 className="text-3xl font-black text-neutral-900">{block.title}</h2>
            {block.body ? <p className="mt-3 text-neutral-600">{block.body}</p> : null}
            <a href={link("/contact")} className="btn btn-red mt-8 inline-flex">
              {t("common.contactUs")}
            </a>
          </div>
        </section>
      );

    case "html":
      // Admin-authored raw HTML — sanitized at render to remove scripts.
      return <SanitizedHtml html={String(config.html ?? "")} />;

    default:
      return null;
  }
}

function HomeArticlesBlock({ title }: { title?: string | null }) {
  const { locale, t, link } = useI18n();
  // Shares its key with the Footer, so landing on the home page no longer
  // triggers the same article list twice.
  const { data } = useCmsArticles(locale);

  const articles = (data?.items ?? []).slice(0, 3);

  if (articles.length === 0) return null;

  return (
    <section className="section-paper">
      <div className="wrap">
        <h2 className="mb-10 text-center text-3xl font-black text-neutral-900">
          {title ?? t("news.hero.title")}
        </h2>
        <div className="grid gap-6 md:grid-cols-3">
          {articles.map((article) => (
            <a
              key={article.id}
              href={link(
                `/actualites/${locale === "en" ? (article.slugEn ?? article.slug) : article.slug}`,
              )}
              className="group block overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-sm transition hover:shadow-lg"
            >
              {article.coverImageUrl ? (
                <img
                  src={article.coverImageUrl}
                  alt={article.title}
                  className="aspect-[16/10] w-full object-cover"
                  loading="lazy"
                />
              ) : null}
              <div className="p-6">
                <h3 className="font-bold text-neutral-900 group-hover:text-[#e0141c]">
                  {article.title}
                </h3>
                {article.excerpt ? (
                  <p className="mt-2 line-clamp-3 text-sm text-neutral-600">{article.excerpt}</p>
                ) : null}
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

/** Minimal client-side sanitizer for the admin-authored HTML block. */
function SanitizedHtml({ html }: { html: string }) {
  if (typeof document === "undefined") return null;
  const template = document.createElement("template");
  template.innerHTML = html;
  const forbidden = new Set(["script", "style", "iframe", "object", "embed", "link", "meta"]);
  template.content.querySelectorAll("*").forEach((el) => {
    if (forbidden.has(el.tagName.toLowerCase())) {
      el.remove();
      return;
    }
    for (const attr of Array.from(el.attributes)) {
      const name = attr.name.toLowerCase();
      const value = attr.value.trim().toLowerCase();
      if (
        name.startsWith("on") ||
        ((name === "href" || name === "src") && value.startsWith("javascript:"))
      ) {
        el.removeAttribute(attr.name);
      }
    }
  });

  return (
    <section className="section-paper" dangerouslySetInnerHTML={{ __html: template.innerHTML }} />
  );
}
