import { useEffect, useState } from "react";
import {
  ArrowRight,
  Clock3,
  FileStack,
  FileText,
  FolderTree,
  Image as ImageIcon,
  Languages,
  LayoutTemplate,
  Mail,
  Newspaper,
  Plus,
} from "lucide-react";

import {
  adminApi,
  type AdminStats,
  type CmsArticle,
  type CmsMedia,
  type CmsMessage,
  type CmsPage,
} from "@/lib/cms";
import type { AdminCtx, SectionKey } from "../types";

/** Dashboard home: key numbers, one-click actions, recent content & messages. */
export function DashboardHome({
  ctx,
  onNavigate,
}: {
  ctx: AdminCtx;
  onNavigate: (section: SectionKey) => void;
}) {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [messages, setMessages] = useState<CmsMessage[]>([]);
  const [pages, setPages] = useState<CmsPage[]>([]);
  const [articles, setArticles] = useState<CmsArticle[]>([]);
  const [media, setMedia] = useState<CmsMedia[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    adminApi
      .stats(ctx.csrf)
      .then((res) => alive && setStats(res.stats))
      .catch((err) => alive && setError(err instanceof Error ? err.message : "Erreur"));
    adminApi
      .messages(ctx.csrf)
      .then((res) => alive && setMessages(res.items.slice(0, 5)))
      .catch(() => undefined);
    adminApi
      .recent(ctx.csrf)
      .then((res) => {
        if (!alive) return;
        setPages(res.pages ?? []);
        setArticles(res.articles ?? []);
        setMedia(res.media ?? []);
      })
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, [ctx.csrf]);

  const cards: {
    label: string;
    value: number | undefined;
    sub?: string;
    section: SectionKey;
    icon: typeof FileStack;
  }[] = [
    {
      label: "Pages publiées",
      value: stats?.pagesPublished,
      sub: `${stats?.pagesDraft ?? 0} brouillon(s) · ${stats?.pagesScheduled ?? 0} programmée(s)`,
      section: "pages",
      icon: FileStack,
    },
    {
      label: "Articles publiés",
      value: stats?.articlesPublished,
      sub: `${stats?.articlesDraft ?? 0} brouillon(s) · ${stats?.articlesScheduled ?? 0} programmé(s)`,
      section: "articles",
      icon: Newspaper,
    },
    {
      label: "Médias",
      value: stats?.media,
      sub: "images & documents",
      section: "media",
      icon: ImageIcon,
    },
    {
      label: "Messages non lus",
      value: stats?.messagesUnread,
      sub: `${stats?.messages ?? 0} au total`,
      section: "messages",
      icon: Mail,
    },
    { label: "Catégories", value: stats?.categories, section: "categories", icon: FolderTree },
    { label: "Tags", value: stats?.tags, section: "tags", icon: FileText },
    {
      label: "Accueil",
      value: undefined,
      sub: "sections configurables",
      section: "homepage",
      icon: LayoutTemplate,
    },
    {
      label: "Statuts",
      value: stats ? stats.pages + stats.articles : undefined,
      sub: "contenus gérés",
      section: "activity",
      icon: Clock3,
    },
  ];

  // Translation coverage: how much content still has no English version.
  const untranslated = (stats?.pagesUntranslated ?? 0) + (stats?.articlesUntranslated ?? 0);

  return (
    <div className="admin-section">
      <div className="admin-quick">
        <button className="admin-btn admin-btn--primary" onClick={() => onNavigate("pages")}>
          <Plus size={14} /> Créer une page
        </button>
        <button className="admin-btn admin-btn--primary" onClick={() => onNavigate("articles")}>
          <Plus size={14} /> Écrire un article
        </button>
        <button className="admin-btn" onClick={() => onNavigate("media")}>
          Ajouter des images
        </button>
        <button className="admin-btn" onClick={() => onNavigate("homepage")}>
          Personnaliser l'accueil
        </button>
        <a className="admin-btn" href="/" target="_blank" rel="noreferrer">
          Voir le site <ArrowRight size={13} />
        </a>
      </div>

      {error ? <p className="admin-alert admin-alert--error">{error}</p> : null}

      {untranslated > 0 ? (
        <div
          className="admin-alert admin-alert--warn"
          style={{ display: "flex", alignItems: "center", gap: 10 }}
        >
          <Languages size={16} />
          <span>
            <strong>{untranslated}</strong> contenu(s) sans version anglaise — ils s'affichent en
            français sous /en. Ouvrez l'éditeur pour ajouter la traduction.
          </span>
        </div>
      ) : null}

      <div className="admin-stats">
        {cards.map(({ label, value, sub, section, icon: Icon }) => (
          <button key={label} className="admin-stat" onClick={() => onNavigate(section)}>
            <Icon size={16} />
            <strong>{value ?? "…"}</strong>
            <span>{label}</span>
            {sub ? <small>{sub}</small> : null}
          </button>
        ))}
      </div>

      <div className="admin-dashboard-columns">
        <div className="admin-list">
          <div className="admin-section__head">
            <h2>Dernières pages</h2>
            <button className="admin-btn" onClick={() => onNavigate("pages")}>
              Tout voir
            </button>
          </div>
          {pages.length === 0 ? (
            <p className="admin-hint">Aucune page.</p>
          ) : (
            pages.map((page) => (
              <div key={page.id} className="admin-row">
                <span className="admin-row__title">{page.title}</span>
                <span className={`admin-badge admin-badge--${page.status ?? "draft"}`}>
                  {page.status === "published"
                    ? "Publiée"
                    : page.status === "scheduled"
                      ? "Programmée"
                      : "Brouillon"}
                </span>
                <span className="admin-row__spacer" />
                <a className="admin-btn" href={`/p/${page.slug}`} target="_blank" rel="noreferrer">
                  Voir
                </a>
              </div>
            ))
          )}

          <div className="admin-section__head" style={{ marginTop: 12 }}>
            <h2>Derniers articles</h2>
            <button className="admin-btn" onClick={() => onNavigate("articles")}>
              Tout voir
            </button>
          </div>
          {articles.length === 0 ? (
            <p className="admin-hint">Aucun article.</p>
          ) : (
            articles.map((article) => (
              <div key={article.id} className="admin-row">
                <span className="admin-row__title">{article.title}</span>
                <span className={`admin-badge admin-badge--${article.status ?? "draft"}`}>
                  {article.status === "published"
                    ? "Publié"
                    : article.status === "scheduled"
                      ? "Programmé"
                      : "Brouillon"}
                </span>
                <span className="admin-row__spacer" />
                <a
                  className="admin-btn"
                  href={`/actualites/${article.slug}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Voir
                </a>
              </div>
            ))
          )}
        </div>

        <div className="admin-list">
          <div className="admin-section__head">
            <h2>Derniers messages</h2>
            <button className="admin-btn" onClick={() => onNavigate("messages")}>
              Tout voir
            </button>
          </div>
          {messages.length === 0 ? (
            <p className="admin-hint">Aucun message pour le moment.</p>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`admin-message ${message.is_read ? "" : "admin-message--unread"}`}
              >
                <div className="admin-message__head">
                  <strong>
                    {message.first_name} {message.last_name}
                  </strong>
                  <span className="admin-row__meta">{message.email}</span>
                  <span className="admin-row__spacer" />
                  <span className="admin-row__meta">
                    {new Date(message.created_at.replace(" ", "T")).toLocaleString("fr-FR")}
                  </span>
                </div>
                <strong style={{ fontSize: 12 }}>{message.subject}</strong>
              </div>
            ))
          )}

          <div className="admin-section__head" style={{ marginTop: 12 }}>
            <h2>Médias récents</h2>
            <button className="admin-btn" onClick={() => onNavigate("media")}>
              Médiathèque
            </button>
          </div>
          {media.length > 0 ? (
            <div className="admin-media-grid">
              {media.map((m) => (
                <a
                  key={m.id}
                  href={m.url}
                  target="_blank"
                  rel="noreferrer"
                  className="admin-media-card"
                  title={m.original_name ?? ""}
                >
                  <img src={m.url} alt="" loading="lazy" />
                </a>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
