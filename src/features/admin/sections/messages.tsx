import { useCallback, useEffect, useState } from "react";
import { Check, MailOpen, Trash2 } from "lucide-react";

import { adminApi, type CmsMessage } from "@/lib/cms";
import type { AdminCtx } from "../types";

export function MessagesSection({
  ctx,
  onUnreadChange,
}: {
  ctx: AdminCtx;
  onUnreadChange?: () => void;
}) {
  const [items, setItems] = useState<CmsMessage[]>([]);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    adminApi
      .messages(ctx.csrf)
      .then((res) => setItems(res.items))
      .catch((err) => setError(err instanceof Error ? err.message : "Erreur de chargement."));
  }, [ctx.csrf]);

  useEffect(load, [load]);

  const markRead = async (message: CmsMessage) => {
    try {
      await adminApi.markMessageRead(ctx.csrf, message.id);
      load();
      onUnreadChange?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur.");
    }
  };

  const remove = async (message: CmsMessage) => {
    if (!window.confirm("Supprimer ce message ?")) return;
    try {
      await adminApi.deleteMessage(ctx.csrf, message.id);
      load();
      onUnreadChange?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de suppression.");
    }
  };

  return (
    <div className="admin-section">
      <div className="admin-section__head">
        <h2>
          {items.filter((m) => !m.is_read).length} non lu(s) sur {items.length}
        </h2>
      </div>

      {error ? <p className="admin-alert admin-alert--error">{error}</p> : null}

      <div className="admin-list">
        {items.length === 0 ? (
          <p className="admin-hint">Aucun message reçu via le formulaire de contact.</p>
        ) : null}
        {items.map((message) => (
          <div
            key={message.id}
            className={`admin-message ${message.is_read ? "" : "admin-message--unread"}`}
          >
            <div className="admin-message__head">
              <strong>
                {message.first_name} {message.last_name}
              </strong>
              <span className="admin-row__meta">{message.email}</span>
              {message.company ? (
                <span className="admin-row__meta">· {message.company}</span>
              ) : null}
              {message.is_read ? null : (
                <span className="admin-badge admin-badge--draft">Non lu</span>
              )}
              <span className="admin-row__spacer" />
              <span className="admin-row__meta">
                {new Date(message.created_at).toLocaleString("fr-FR")}
              </span>
            </div>
            <strong style={{ fontSize: 12 }}>{message.subject}</strong>
            <p>{message.message}</p>
            <div style={{ display: "flex", gap: 8 }}>
              {message.is_read ? null : (
                <button className="admin-btn" onClick={() => markRead(message)}>
                  <MailOpen size={13} /> Marquer comme lu
                </button>
              )}
              <a
                className="admin-btn"
                href={`mailto:${message.email}?subject=Re: ${encodeURIComponent(message.subject)}`}
              >
                <Check size={13} /> Répondre
              </a>
              <button className="admin-btn admin-btn--danger" onClick={() => remove(message)}>
                <Trash2 size={13} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
