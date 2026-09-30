import { useState } from "react";
import { ImagePlus, MoveDown, Plus, Trash2 } from "lucide-react";

import type { AdminPagePayload } from "@/lib/cms";
import { MediaPicker } from "./media-picker";

const BLOCK_TYPES = [
  { value: "heading", label: "Titre de section" },
  { value: "text", label: "Texte" },
  { value: "image", label: "Image" },
  { value: "gallery", label: "Galerie" },
  { value: "contact_info", label: "Coordonnées" },
] as const;

type Blocks = NonNullable<AdminPagePayload["blocks"]>;

export function BlockFields({ blocks, onChange, csrf }: { blocks: Blocks; onChange: (blocks: Blocks) => void; csrf: string }) {
  const [picker, setPicker] = useState<{ index: number; multiple: boolean } | null>(null);

  const update = (index: number, patch: Partial<Blocks[number]>) => {
    onChange(blocks.map((block, i) => (i === index ? { ...block, ...patch } : block)));
  };

  const move = (index: number, delta: number) => {
    const target = index + delta;
    if (target < 0 || target >= blocks.length) return;
    const next = [...blocks];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <span style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", color: "#414849" }}>
        Sections de la page ({blocks.length})
      </span>

      {blocks.length === 0 ? (
        <p className="admin-hint">
          Aucune section. Ajoutez des titres, textes, images ou galeries — elles
          s'afficheront dans l'ordre sur la page.
        </p>
      ) : null}

      {blocks.map((block, index) => (
        <fieldset key={index} className="admin-form" style={{ position: "relative", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <select
              value={block.type}
              onChange={(e) => update(index, { type: e.target.value as (typeof BLOCK_TYPES)[number]["value"] })}
              style={{ maxWidth: 200 }}
            >
              {BLOCK_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
            <span className="admin-row__spacer" />
            <button type="button" className="admin-btn" onClick={() => move(index, -1)} title="Monter">
              <MoveDown size={13} style={{ transform: "rotate(180deg)" }} />
            </button>
            <button type="button" className="admin-btn" onClick={() => move(index, 1)} title="Descendre">
              <MoveDown size={13} />
            </button>
            <button
              type="button"
              className="admin-btn admin-btn--danger"
              onClick={() => onChange(blocks.filter((_, i) => i !== index))}
              title="Supprimer la section"
            >
              <Trash2 size={13} />
            </button>
          </div>

          {block.type !== "gallery" && block.type !== "contact_info" ? (
            <label>
              {block.type === "image" ? "Légende" : "Titre"}
              <input value={block.title ?? ""} onChange={(e) => update(index, { title: e.target.value })} />
            </label>
          ) : null}

          {block.type === "text" ? (
            <label>
              Texte
              <textarea value={block.body ?? ""} onChange={(e) => update(index, { body: e.target.value })} rows={5} />
            </label>
          ) : null}

          {block.type === "image" ? (
            <label>
              Image
              <div className="admin-form__inline">
                <input
                  value={block.imageUrl ?? ""}
                  onChange={(e) => update(index, { imageUrl: e.target.value })}
                  placeholder="/api/uploads/…"
                />
                <button type="button" className="admin-btn" onClick={() => setPicker({ index, multiple: false })}>
                  <ImagePlus size={13} /> Choisir…
                </button>
              </div>
            </label>
          ) : null}

          {block.type === "gallery" ? (
            <>
              <div className="admin-form__inline">
                <span className="admin-hint">{(block.images ?? []).length} image(s) dans la galerie</span>
                <button
                  type="button"
                  className="admin-btn"
                  onClick={() => setPicker({ index, multiple: true })}
                >
                  <ImagePlus size={13} /> Ajouter des images
                </button>
              </div>
              {(block.images ?? []).length > 0 ? (
                <div className="admin-gallery-preview">
                  {(block.images ?? []).map((src, i) => (
                    <div key={`${src}-${i}`} className="admin-gallery-preview__item">
                      <img src={src} alt="" loading="lazy" />
                      <button
                        type="button"
                        title="Retirer"
                        onClick={() => update(index, { images: (block.images ?? []).filter((_, j) => j !== i) })}
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : null}
            </>
          ) : null}

          {block.type === "contact_info" ? (
            <div className="admin-form__row">
              <label>
                Téléphone
                <input value={block.title ?? ""} onChange={(e) => update(index, { title: e.target.value })} />
              </label>
              <label>
                E-mail
                <input value={block.body ?? ""} onChange={(e) => update(index, { body: e.target.value })} />
              </label>
              <label>
                Adresse
                <input value={block.imageUrl ?? ""} onChange={(e) => update(index, { imageUrl: e.target.value })} />
              </label>
            </div>
          ) : null}
        </fieldset>
      ))}

      <div>
        <button
          type="button"
          className="admin-btn"
          onClick={() => onChange([...blocks, { type: "text", title: "", body: "" }])}
        >
          <Plus size={14} /> Ajouter une section
        </button>
      </div>

      {picker ? (
        <MediaPicker
          csrf={csrf}
          open
          title={picker.multiple ? "Ajouter à la galerie" : "Choisir une image"}
          onSelect={(url) => {
            if (picker.multiple) {
              const current = blocks[picker.index]?.images ?? [];
              update(picker.index, { images: [...current, url] });
            } else {
              update(picker.index, { imageUrl: url });
            }
          }}
          onClose={() => setPicker(null)}
        />
      ) : null}
    </div>
  );
}
