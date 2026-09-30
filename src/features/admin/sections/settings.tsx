import { useCallback, useEffect, useState } from "react";
import { Save } from "lucide-react";

import { adminApi, type CmsSettings, type CmsSiteSeo } from "@/lib/cms";
import type { AdminCtx } from "../types";

type Tab = "general" | "seo";

export function SettingsSection({ ctx }: { ctx: AdminCtx }) {
  const [tab, setTab] = useState<Tab>("general");
  const [siteName, setSiteName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [address, setAddress] = useState("");
  const [footerNote, setFooterNote] = useState("");
  const [seo, setSeo] = useState<CmsSiteSeo>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    adminApi
      .settings(ctx.csrf)
      .then((res) => {
        setSiteName(res.settings?.site_name ?? "");
        setContactEmail(res.settings?.contact_email ?? "");
        setContactPhone(res.settings?.contact_phone ?? "");
        setAddress(res.settings?.address ?? "");
        setFooterNote(res.settings?.footer_note ?? "");
        setSeo(res.settings?.seo_json ?? {});
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Erreur de chargement."));
  }, [ctx.csrf]);

  useEffect(load, [load]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await adminApi.saveSettings(ctx.csrf, {
        siteName,
        contactEmail,
        contactPhone,
        address,
        footerNote,
        seoJson: seo,
      });
      ctx.notify("Réglages enregistrés.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur d'enregistrement.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="admin-section">
      <div className="admin-tabs" role="tablist">
        <button
          role="tab"
          aria-selected={tab === "general"}
          className={tab === "general" ? "is-active" : ""}
          onClick={() => setTab("general")}
        >
          Général
        </button>
        <button
          role="tab"
          aria-selected={tab === "seo"}
          className={tab === "seo" ? "is-active" : ""}
          onClick={() => setTab("seo")}
        >
          SEO par défaut
        </button>
      </div>

      <form className="admin-form" onSubmit={submit} style={{ maxWidth: 680 }}>
        {tab === "general" ? (
          <>
            <label>
              Nom du site
              <input value={siteName} onChange={(e) => setSiteName(e.target.value)} />
            </label>
            <div className="admin-form__row">
              <label>
                E-mail de contact (reçoit les messages du formulaire)
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                />
              </label>
              <label>
                Téléphone affiché
                <input value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} />
              </label>
            </div>
            <label>
              Adresse
              <input value={address} onChange={(e) => setAddress(e.target.value)} />
            </label>
            <label>
              Note de pied de page
              <textarea
                value={footerNote}
                onChange={(e) => setFooterNote(e.target.value)}
                rows={2}
              />
            </label>
          </>
        ) : (
          <>
            <label>
              Titre SEO par défaut
              <input
                value={seo.defaultTitle ?? ""}
                onChange={(e) => setSeo({ ...seo, defaultTitle: e.target.value })}
                placeholder="U2I Process — Tuyauterie Inox & Soudure Orbitale"
              />
            </label>
            <label>
              Description SEO par défaut
              <textarea
                value={seo.defaultDescription ?? ""}
                onChange={(e) => setSeo({ ...seo, defaultDescription: e.target.value })}
                rows={3}
              />
            </label>
            <label>
              Mots-clés
              <input
                value={seo.keywords ?? ""}
                onChange={(e) => setSeo({ ...seo, keywords: e.target.value })}
                placeholder="tuyauterie, inox, soudure orbitale…"
              />
            </label>
            <div className="admin-form__row">
              <label>
                Robots par défaut
                <select
                  value={seo.robots ?? ""}
                  onChange={(e) => setSeo({ ...seo, robots: e.target.value })}
                >
                  <option value="">index, follow (défaut)</option>
                  <option value="noindex">noindex, follow</option>
                  <option value="noindex,nofollow">noindex, nofollow</option>
                </select>
              </label>
              <label>
                Image de partage (Open Graph)
                <input
                  value={seo.ogImage ?? ""}
                  onChange={(e) => setSeo({ ...seo, ogImage: e.target.value })}
                  placeholder="/api/uploads/…"
                />
              </label>
            </div>
            <p className="admin-hint">
              Ces valeurs alimentent les balises meta du site. Chaque page et article peut les
              surcharger dans son onglet SEO. Le sitemap dynamique est disponible sur
              <code> /api/sitemap.php</code>.
            </p>
          </>
        )}

        {error ? <p className="admin-alert admin-alert--error">{error}</p> : null}

        <div>
          <button type="submit" className="admin-btn admin-btn--primary" disabled={busy}>
            <Save size={14} /> {busy ? "Enregistrement…" : "Enregistrer"}
          </button>
        </div>
      </form>
    </div>
  );
}
