import { useState } from "react";
import { Save } from "lucide-react";

import { adminApi } from "@/lib/cms";
import type { AdminCtx } from "../types";

export function AccountSection({ ctx }: { ctx: AdminCtx }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setDone(false);

    if (newPassword !== confirm) {
      setError("Les deux mots de passe ne correspondent pas.");
      return;
    }
    if (newPassword.length < 8) {
      setError("Le nouveau mot de passe doit contenir au moins 8 caractères.");
      return;
    }

    setBusy(true);
    try {
      await adminApi.changePassword(ctx.csrf, currentPassword, newPassword);
      setDone(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirm("");
      ctx.notify("Mot de passe mis à jour.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="admin-section">
      <form className="admin-form" onSubmit={submit} style={{ maxWidth: 480 }}>
        <p className="admin-hint">
          Le mot de passe est enregistré chiffré (bcrypt) dans la table
          <code> admins </code> de la base de données.
        </p>

        <label>
          Mot de passe actuel
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </label>
        <label>
          Nouveau mot de passe (min. 8 caractères)
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            autoComplete="new-password"
            required
          />
        </label>
        <label>
          Confirmer le nouveau mot de passe
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            autoComplete="new-password"
            required
          />
        </label>

        {error ? <p className="admin-alert admin-alert--error">{error}</p> : null}
        {done ? <p className="admin-alert admin-alert--success">Mot de passe mis à jour.</p> : null}

        <div>
          <button type="submit" className="admin-btn admin-btn--primary" disabled={busy}>
            <Save size={14} /> {busy ? "Enregistrement…" : "Changer le mot de passe"}
          </button>
        </div>
      </form>
    </div>
  );
}
