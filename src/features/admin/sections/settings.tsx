import { useCallback, useEffect, useState } from "react";
import { Save } from "lucide-react";

import { adminApi } from "@/lib/cms";
import type { AdminCtx } from "../types";

export function SettingsSection({ ctx }: { ctx: AdminCtx }) {
  const [siteName, setSiteName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [address, setAddress] = useState("");
  const [footerNote, setFooterNote] = useState("");
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
      <form className="admin-form" onSubmit={submit} style={{ maxWidth: 640 }}>
        <label>
          Nom du site
          <input value={siteName} onChange={(e) => setSiteName(e.target.value)} />
        </label>
        <div className="admin-form__row">
          <label>
            E-mail de contact (reçoit les messages du formulaire)
            <input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
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
          <textarea value={footerNote} onChange={(e) => setFooterNote(e.target.value)} rows={2} />
        </label>

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
