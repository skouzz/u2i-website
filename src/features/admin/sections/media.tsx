import { useCallback, useEffect, useRef, useState } from "react";
import { Check, Trash2, Upload } from "lucide-react";

import { adminApi, type CmsMedia } from "@/lib/cms";
import type { AdminCtx } from "../types";

export function MediaSection({ ctx }: { ctx: AdminCtx }) {
  const [items, setItems] = useState<CmsMedia[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [copied, setCopied] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(() => {
    adminApi
      .media(ctx.csrf)
      .then((res) => setItems(res.items))
      .catch((err) => setError(err instanceof Error ? err.message : "Erreur de chargement."));
  }, [ctx.csrf]);

  useEffect(load, [load]);

  const upload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    setError(null);
    try {
      for (const file of Array.from(files)) {
        await adminApi.uploadMedia(ctx.csrf, file);
      }
      ctx.notify("Image(s) envoyée(s).");
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Échec de l'upload.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const copyUrl = async (media: CmsMedia) => {
    try {
      await navigator.clipboard.writeText(media.url);
      setCopied(media.id);
      window.setTimeout(() => setCopied(null), 1500);
    } catch {
      window.prompt("Copiez l'URL :", media.url);
    }
  };

  const remove = async (media: CmsMedia) => {
    if (!window.confirm("Supprimer cette image ?")) return;
    try {
      await adminApi.deleteMedia(ctx.csrf, media.id);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de suppression.");
    }
  };

  return (
    <div className="admin-section">
      <div className="admin-section__head">
        <h2>{items.length} image(s)</h2>
        <label className="admin-btn admin-btn--primary">
          <Upload size={14} /> {uploading ? "Envoi…" : "Ajouter des images"}
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={(e) => upload(e.target.files)}
          />
        </label>
      </div>

      {error ? <p className="admin-alert admin-alert--error">{error}</p> : null}

      <div className="admin-media-grid">
        {items.map((media) => (
          <div key={media.id} className="admin-media-card">
            <img src={media.url} alt={media.original_name ?? ""} loading="lazy" />
            <code>{media.url}</code>
            <div style={{ display: "flex", gap: 6 }}>
              <button className="admin-btn" onClick={() => copyUrl(media)}>
                {copied === media.id ? <Check size={13} /> : "Copier l'URL"}
              </button>
              <button className="admin-btn admin-btn--danger" onClick={() => remove(media)}>
                <Trash2 size={13} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {items.length === 0 ? (
        <p className="admin-hint">
          La médiathèque est vide. Envoyez vos images ici, puis collez leur URL dans
          les pages ou articles.
        </p>
      ) : null}
    </div>
  );
}
