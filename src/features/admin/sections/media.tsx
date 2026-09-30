import { useCallback, useEffect, useRef, useState } from "react";
import { Check, Loader2, Pencil, Trash2, Upload, X } from "lucide-react";

import { adminApi, type CmsMedia } from "@/lib/cms";
import type { AdminCtx } from "../types";

export function MediaSection({ ctx }: { ctx: AdminCtx }) {
  const [items, setItems] = useState<CmsMedia[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [copied, setCopied] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<CmsMedia | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(() => {
    adminApi
      .media(ctx.csrf)
      .then((res) => setItems(res.items))
      .catch((err) => setError(err instanceof Error ? err.message : "Erreur de chargement."));
  }, [ctx.csrf]);

  useEffect(load, [load]);

  const upload = async (files: FileList | File[] | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    setError(null);
    try {
      for (const file of Array.from(files)) {
        await adminApi.uploadMedia(ctx.csrf, file);
      }
      ctx.notify("Fichier(s) envoyé(s).");
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
    if (
      !window.confirm(
        "Supprimer ce fichier de la médiathèque ? S'il est utilisé sur une page ou un article, remplacez-le d'abord.",
      )
    )
      return;
    try {
      await adminApi.deleteMedia(ctx.csrf, media.id);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de suppression.");
    }
  };

  const filtered = items.filter((item) => {
    if (!search) return true;
    const haystack =
      `${item.original_name ?? ""} ${item.title ?? ""} ${item.alt_text ?? ""}`.toLowerCase();
    return haystack.includes(search.toLowerCase());
  });

  return (
    <div className="admin-section">
      <div className="admin-section__head">
        <h2>{filtered.length} fichier(s)</h2>
        <div className="admin-toolbar">
          <input
            className="admin-search"
            placeholder="Rechercher par nom, titre, alt…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <label
            className={`admin-btn admin-btn--primary ${dragOver ? "is-dragover" : ""}`}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              upload(e.dataTransfer.files);
            }}
          >
            <Upload size={14} /> {uploading ? "Envoi…" : "Ajouter des fichiers"}
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml,application/pdf"
              multiple
              hidden
              onChange={(e) => upload(e.target.files)}
            />
          </label>
        </div>
      </div>

      {error ? <p className="admin-alert admin-alert--error">{error}</p> : null}

      <div
        className={`admin-media-dropzone ${dragOver ? "is-dragover" : ""}`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          upload(e.dataTransfer.files);
        }}
      >
        {uploading ? (
          <Loader2 size={22} className="admin-spin" />
        ) : filtered.length === 0 ? (
          <p className="admin-hint">
            {search
              ? "Aucun fichier ne correspond à la recherche."
              : "Glissez-déposez des fichiers ici (JPG, PNG, WebP, GIF, SVG, PDF — 12 Mo max) ou utilisez le bouton Ajouter."}
          </p>
        ) : (
          <div className="admin-media-grid">
            {filtered.map((media) => (
              <div key={media.id} className="admin-media-card">
                {media.url.endsWith(".svg") || media.url.endsWith(".pdf") ? (
                  <div className="admin-media-card__fallback">
                    {media.url.split(".").pop()?.toUpperCase()}
                  </div>
                ) : (
                  <img
                    src={media.url}
                    alt={media.alt_text ?? media.original_name ?? ""}
                    loading="lazy"
                  />
                )}
                <code title={media.url}>{media.url}</code>
                {media.title ? (
                  <span className="admin-media-card__title">{media.title}</span>
                ) : null}
                <div style={{ display: "flex", gap: 6 }}>
                  <button className="admin-btn" onClick={() => copyUrl(media)}>
                    {copied === media.id ? <Check size={13} /> : "Copier l'URL"}
                  </button>
                  <button
                    className="admin-btn"
                    onClick={() => setEditing(media)}
                    title="Modifier les infos"
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    className="admin-btn admin-btn--danger"
                    onClick={() => remove(media)}
                    title="Supprimer"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {editing ? (
        <MediaMetaDialog
          csrf={ctx.csrf}
          media={editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            load();
          }}
        />
      ) : null}
    </div>
  );
}

function MediaMetaDialog({
  csrf,
  media,
  onClose,
  onSaved,
}: {
  csrf: string;
  media: CmsMedia;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [title, setTitle] = useState(media.title ?? "");
  const [altText, setAltText] = useState(media.alt_text ?? "");
  const [caption, setCaption] = useState(media.caption ?? "");
  const [description, setDescription] = useState(media.description ?? "");
  const [busy, setBusy] = useState(false);

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    try {
      await adminApi.updateMedia(csrf, media.id, { title, altText, caption, description });
      onSaved();
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Erreur.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className="admin-modal"
      role="dialog"
      aria-modal="true"
      aria-label="Informations du fichier"
      onClick={onClose}
    >
      <div className="admin-modal__box" onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal__head">
          <h3>Informations du fichier</h3>
          <button
            type="button"
            className="admin-modal__close"
            onClick={onClose}
            aria-label="Fermer"
          >
            <X size={16} />
          </button>
        </div>
        <form className="admin-form" onSubmit={save} style={{ border: 0, padding: 0 }}>
          <label>
            Titre
            <input value={title} onChange={(e) => setTitle(e.target.value)} />
          </label>
          <label>
            Texte alternatif (accessibilité & SEO)
            <input value={altText} onChange={(e) => setAltText(e.target.value)} />
          </label>
          <label>
            Légende
            <input value={caption} onChange={(e) => setCaption(e.target.value)} />
          </label>
          <label>
            Description
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </label>
          <div style={{ display: "flex", gap: 10 }}>
            <button type="submit" className="admin-btn admin-btn--primary" disabled={busy}>
              Enregistrer
            </button>
            <button type="button" className="admin-btn" onClick={onClose}>
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
