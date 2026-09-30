import { useCallback, useEffect, useState } from "react";
import { Plus, Save, Trash2 } from "lucide-react";

import {
  adminApi,
  type CmsFooterConfig,
  type CmsHeaderConfig,
  type CmsSettings,
  type CmsSocialLinks,
} from "@/lib/cms";
import type { AdminCtx } from "../types";
import { MediaPicker } from "../components/media-picker";

const SOCIAL_FIELDS: { key: keyof CmsSocialLinks; label: string }[] = [
  { key: "facebook", label: "Facebook" },
  { key: "instagram", label: "Instagram" },
  { key: "linkedin", label: "LinkedIn" },
  { key: "youtube", label: "YouTube" },
  { key: "tiktok", label: "TikTok" },
  { key: "twitter", label: "X / Twitter" },
  { key: "whatsapp", label: "WhatsApp" },
];

export function WebsiteSection({ ctx, variant }: { ctx: AdminCtx; variant: "header" | "footer" }) {
  const [settings, setSettings] = useState<CmsSettings | null>(null);
  const [header, setHeader] = useState<CmsHeaderConfig>({});
  const [footer, setFooter] = useState<CmsFooterConfig>({});
  const [social, setSocial] = useState<CmsSocialLinks>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  const load = useCallback(() => {
    adminApi
      .settings(ctx.csrf)
      .then((res) => {
        setSettings(res.settings);
        setHeader(res.settings?.header_json ?? {});
        setFooter(res.settings?.footer_json ?? {});
        setSocial(res.settings?.social_json ?? {});
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Erreur de chargement."));
  }, [ctx.csrf]);

  useEffect(load, [load]);

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await adminApi.saveSettings(ctx.csrf, {
        siteName: settings?.site_name ?? "",
        contactEmail: settings?.contact_email ?? "",
        contactPhone: settings?.contact_phone ?? "",
        address: settings?.address ?? "",
        footerNote: settings?.footer_note ?? "",
        headerJson: header,
        footerJson: footer,
        socialJson: social,
      });
      ctx.notify(variant === "header" ? "En-tête enregistré." : "Pied de page enregistré.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur d'enregistrement.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="admin-section">
      <form className="admin-form" onSubmit={save} style={{ maxWidth: 760 }}>
        {variant === "header" ? (
          <>
            <h2 style={{ margin: 0, fontSize: 15 }}>En-tête du site</h2>
            <div className="admin-form__row">
              <label>
                Logo (URL)
                <div className="admin-form__inline">
                  <input
                    value={header.logoUrl ?? ""}
                    onChange={(e) => setHeader({ ...header, logoUrl: e.target.value })}
                    placeholder="/api/uploads/…"
                  />
                  <button type="button" className="admin-btn" onClick={() => setPickerOpen(true)}>
                    Choisir…
                  </button>
                </div>
              </label>
            </div>
            <div className="admin-form__row">
              <label>
                Téléphone affiché
                <input
                  value={header.phone ?? ""}
                  onChange={(e) => setHeader({ ...header, phone: e.target.value })}
                  placeholder="+216 …"
                />
              </label>
              <label>
                E-mail affiché
                <input
                  value={header.email ?? ""}
                  onChange={(e) => setHeader({ ...header, email: e.target.value })}
                />
              </label>
            </div>
            <label>
              Bandeau d'annonce
              <input
                value={header.announcement ?? ""}
                onChange={(e) => setHeader({ ...header, announcement: e.target.value })}
                placeholder="Vous avez un nouveau projet ? Contactez-nous !"
              />
            </label>
            <label className="admin-form__check">
              <input
                type="checkbox"
                checked={header.announcementEnabled ?? true}
                onChange={(e) => setHeader({ ...header, announcementEnabled: e.target.checked })}
              />
              Afficher le bandeau d'annonce
            </label>
            <label className="admin-form__check">
              <input
                type="checkbox"
                checked={header.showSocial ?? true}
                onChange={(e) => setHeader({ ...header, showSocial: e.target.checked })}
              />
              Afficher les icônes sociales dans l'en-tête
            </label>
          </>
        ) : (
          <>
            <h2 style={{ margin: 0, fontSize: 15 }}>Pied de page</h2>
            <div className="admin-form__row">
              <label>
                Logo du pied de page (URL)
                <div className="admin-form__inline">
                  <input
                    value={footer.logoUrl ?? ""}
                    onChange={(e) => setFooter({ ...footer, logoUrl: e.target.value })}
                    placeholder="/api/uploads/…"
                  />
                </div>
              </label>
            </div>
            <label>
              Description
              <textarea
                value={footer.description ?? ""}
                onChange={(e) => setFooter({ ...footer, description: e.target.value })}
                rows={2}
              />
            </label>
            <label>
              Copyright
              <input
                value={footer.copyright ?? ""}
                onChange={(e) => setFooter({ ...footer, copyright: e.target.value })}
                placeholder="© 2026 U2I Process…"
              />
            </label>
            <div className="admin-form__row">
              <label>
                Libellé du bouton d'appel à l'action
                <input
                  value={footer.ctaLabel ?? ""}
                  onChange={(e) => setFooter({ ...footer, ctaLabel: e.target.value })}
                />
              </label>
              <label>
                Lien du bouton
                <input
                  value={footer.ctaUrl ?? ""}
                  onChange={(e) => setFooter({ ...footer, ctaUrl: e.target.value })}
                />
              </label>
            </div>

            <fieldset className="admin-form" style={{ background: "#f7f8f6", gap: 10 }}>
              <legend
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  textTransform: "uppercase",
                  color: "#414849",
                  padding: "0 6px",
                }}
              >
                Colonnes de liens
              </legend>
              {(footer.columns ?? []).map((column, i) => (
                <div key={i} className="admin-form" style={{ background: "#fff", gap: 8 }}>
                  <div className="admin-form__row" style={{ alignItems: "end" }}>
                    <label>
                      Titre de la colonne
                      <input
                        value={column.heading}
                        onChange={(e) => {
                          const next = [...(footer.columns ?? [])];
                          next[i] = { ...next[i], heading: e.target.value };
                          setFooter({ ...footer, columns: next });
                        }}
                      />
                    </label>
                    <button
                      type="button"
                      className="admin-btn admin-btn--danger"
                      onClick={() =>
                        setFooter({
                          ...footer,
                          columns: (footer.columns ?? []).filter((_, j) => j !== i),
                        })
                      }
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                  {column.links.map((link, j) => (
                    <div key={j} className="admin-form__row" style={{ alignItems: "end" }}>
                      <label>
                        Libellé
                        <input
                          value={link.label}
                          onChange={(e) => {
                            const next = [...(footer.columns ?? [])];
                            next[i].links[j] = { label: e.target.value, url: link.url };
                            setFooter({ ...footer, columns: next });
                          }}
                        />
                      </label>
                      <label>
                        URL
                        <input
                          value={link.url}
                          onChange={(e) => {
                            const next = [...(footer.columns ?? [])];
                            next[i].links[j] = { label: link.label, url: e.target.value };
                            setFooter({ ...footer, columns: next });
                          }}
                        />
                      </label>
                      <button
                        type="button"
                        className="admin-btn admin-btn--danger"
                        onClick={() => {
                          const next = [...(footer.columns ?? [])];
                          next[i].links = next[i].links.filter((_, k) => k !== j);
                          setFooter({ ...footer, columns: next });
                        }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    className="admin-btn"
                    onClick={() => {
                      const next = [...(footer.columns ?? [])];
                      next[i].links = [...next[i].links, { label: "", url: "/" }];
                      setFooter({ ...footer, columns: next });
                    }}
                  >
                    <Plus size={12} /> Ajouter un lien
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="admin-btn"
                onClick={() =>
                  setFooter({
                    ...footer,
                    columns: [...(footer.columns ?? []), { heading: "", links: [] }],
                  })
                }
              >
                <Plus size={12} /> Ajouter une colonne
              </button>
            </fieldset>
          </>
        )}

        <fieldset className="admin-form" style={{ background: "#f7f8f6", gap: 10 }}>
          <legend
            style={{
              fontSize: 11,
              fontWeight: 800,
              textTransform: "uppercase",
              color: "#414849",
              padding: "0 6px",
            }}
          >
            Réseaux sociaux
          </legend>
          <div className="admin-form__row">
            {SOCIAL_FIELDS.map(({ key, label }) => (
              <label key={key}>
                {label}
                <input
                  value={social[key] ?? ""}
                  onChange={(e) => setSocial({ ...social, [key]: e.target.value })}
                  placeholder="https://…"
                />
              </label>
            ))}
          </div>
        </fieldset>

        {error ? <p className="admin-alert admin-alert--error">{error}</p> : null}

        <div>
          <button type="submit" className="admin-btn admin-btn--primary" disabled={busy}>
            <Save size={14} /> {busy ? "Enregistrement…" : "Enregistrer"}
          </button>
        </div>
      </form>

      <MediaPicker
        csrf={ctx.csrf}
        open={pickerOpen}
        title="Logo de l'en-tête"
        onSelect={(url) => setHeader((h) => ({ ...h, logoUrl: url }))}
        onClose={() => setPickerOpen(false)}
      />
    </div>
  );
}
