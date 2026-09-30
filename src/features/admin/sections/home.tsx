import { useEffect, useState } from "react";
import {
  ArrowRight,
  FileStack,
  Image as ImageIcon,
  Mail,
  Newspaper,
  Plus,
} from "lucide-react";

import { adminApi, type AdminStats, type CmsMessage } from "@/lib/cms";
import type { AdminCtx, SectionKey } from "../types";

/** Dashboard home: key numbers, one-click actions, latest messages. */
export function DashboardHome({
  ctx,
  onNavigate,
}: {
  ctx: AdminCtx;
  onNavigate: (section: SectionKey) => void;
}) {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [messages, setMessages] = useState<CmsMessage[]>([]);
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
    return () => {
      alive = false;
    };
  }, [ctx.csrf]);

  const cards: { label: string; value: number | undefined; sub?: string; section: SectionKey; icon: typeof FileStack }[] = [
    { label: "Pages publiées", value: stats?.pagesPublished, sub: `${stats?.pages ?? 0} au total`, section: "pages", icon: FileStack },
    { label: "Articles publiés", value: stats?.articlesPublished, sub: `${stats?.articles ?? 0} au total`, section: "articles", icon: Newspaper },
    { label: "Images", value: stats?.media, section: "media", icon: ImageIcon },
    { label: "Messages non lus", value: stats?.messagesUnread, sub: `${stats?.messages ?? 0} au total`, section: "messages", icon: Mail },
  ];

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
        <a className="admin-btn" href="/" target="_blank" rel="noreferrer">
          Voir le site <ArrowRight size={13} />
        </a>
      </div>

      {error ? <p className="admin-alert admin-alert--error">{error}</p> : null}

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

      <div className="admin-section__head">
        <h2>Derniers messages</h2>
        <button className="admin-btn" onClick={() => onNavigate("messages")}>
          Tout voir
        </button>
      </div>
      <div className="admin-list">
        {messages.length === 0 ? (
          <p className="admin-hint">Aucun message pour le moment.</p>
        ) : (
          messages.map((message) => (
            <div key={message.id} className={`admin-message ${message.is_read ? "" : "admin-message--unread"}`}>
              <div className="admin-message__head">
                <strong>
                  {message.first_name} {message.last_name}
                </strong>
                <span className="admin-row__meta">{message.email}</span>
                <span className="admin-row__spacer" />
                <span className="admin-row__meta">{new Date(message.created_at).toLocaleString("fr-FR")}</span>
              </div>
              <strong style={{ fontSize: 12 }}>{message.subject}</strong>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
