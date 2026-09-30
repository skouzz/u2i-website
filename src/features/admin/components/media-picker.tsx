import { useCallback, useEffect, useRef, useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";

import { adminApi, type CmsMedia } from "@/lib/cms";

/**
 * Modal to pick an image from the media library (or upload a new one on the
 * spot). Used by page heroes, block images, galleries and article covers.
 */
export function MediaPicker({
  csrf,
  open,
  title = "Choisir une image",
  onSelect,
  onClose,
}: {
  csrf: string;
  open: boolean;
  title?: string;
  onSelect: (url: string) => void;
  onClose: () => void;
}) {
  const [items, setItems] = useState<CmsMedia[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(() => {
    setLoading(true);
    adminApi
      .media(csrf)
      .then((res) => setItems(res.items))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [csrf]);

  useEffect(() => {
    if (open) {
      load();
    }
  }, [open, load]);

  if (!open) {
    return null;
  }

  const upload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      let lastUrl = "";
      for (const file of Array.from(files)) {
        const media = await adminApi.uploadMedia(csrf, file);
        lastUrl = media.url;
      }
      if (lastUrl) {
        onSelect(lastUrl);
        onClose();
      }
      load();
    } catch {
      // Error surfaced by the caller's UI; keep the picker open.
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="admin-modal" role="dialog" aria-modal="true" aria-label={title} onClick={onClose}>
      <div className="admin-modal__box" onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal__head">
          <h3>{title}</h3>
          <button type="button" className="admin-modal__close" onClick={onClose} aria-label="Fermer">
            <X size={16} />
          </button>
        </div>

        <label className="admin-btn admin-btn--primary admin-modal__upload">
          <ImagePlus size={14} /> {uploading ? "Envoi…" : "Téléverser une image"}
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => upload(e.target.files)}
          />
        </label>

        {loading ? (
          <div className="admin-modal__grid">
            <Loader2 size={20} className="admin-spin" />
          </div>
        ) : items.length === 0 ? (
          <p className="admin-hint">
            La médiathèque est vide — téléversez une première image.
          </p>
        ) : (
          <div className="admin-modal__grid">
            {items.map((media) => (
              <button
                key={media.id}
                type="button"
                className="admin-modal__item"
                onClick={() => {
                  onSelect(media.url);
                  onClose();
                }}
              >
                <img src={media.url} alt={media.original_name ?? ""} loading="lazy" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
