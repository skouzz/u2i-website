import { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Copy,
  Eye,
  EyeOff,
  GripVertical,
  ImagePlus,
  Languages,
  Plus,
  Trash2,
} from "lucide-react";

import type { AdminPagePayload, CmsBlockType } from "@/lib/cms";
import { RichTextEditor } from "./editor-fields";
import { MediaPicker } from "./media-picker";

const BLOCK_TYPES = [
  { value: "heading", label: "Titre de section" },
  { value: "text", label: "Texte / riche" },
  { value: "image", label: "Image" },
  { value: "gallery", label: "Galerie" },
  { value: "contact_info", label: "Coordonnées" },
  { value: "button", label: "Bouton / lien" },
  { value: "quote", label: "Citation" },
  { value: "spacer", label: "Espaceur" },
  { value: "video", label: "Vidéo (URL)" },
  { value: "html", label: "HTML personnalisé" },
] as const;

type Blocks = NonNullable<AdminPagePayload["blocks"]>;

const BLOCK_TYPE_LABELS = new Map<string, string>(BLOCK_TYPES.map((t) => [t.value, t.label]));

export function BlockFields({
  blocks,
  onChange,
  csrf,
}: {
  blocks: Blocks;
  onChange: (blocks: Blocks) => void;
  csrf: string;
}) {
  const [picker, setPicker] = useState<{ index: number; multiple: boolean } | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

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

  /** HTML5 drag-and-drop reorder (mouse + touch via native DnD on pointer devices). */
  const onDragStart = (index: number) => (event: React.DragEvent) => {
    setDragIndex(index);
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", String(index));
  };

  const onDragOver = (index: number) => (event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    if (overIndex !== index) setOverIndex(index);
  };

  const onDrop = (index: number) => (event: React.DragEvent) => {
    event.preventDefault();
    const from = dragIndex ?? Number(event.dataTransfer.getData("text/plain"));
    if (Number.isFinite(from) && from !== index && from >= 0 && from < blocks.length) {
      const next = [...blocks];
      const [moved] = next.splice(from, 1);
      next.splice(index, 0, moved);
      onChange(next);
    }
    setDragIndex(null);
    setOverIndex(null);
  };

  const onDragEnd = () => {
    setDragIndex(null);
    setOverIndex(null);
  };

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <span style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", color: "#414849" }}>
        Sections de la page ({blocks.length}) — glissez pour réordonner
      </span>

      {blocks.length === 0 ? (
        <p className="admin-hint">
          Aucune section. Ajoutez des titres, textes, images, galeries, boutons… elles s'afficheront
          dans l'ordre sur la page.
        </p>
      ) : null}

      {blocks.map((block, index) => (
        <fieldset
          key={index}
          className="admin-form"
          style={{
            position: "relative",
            gap: 10,
            opacity: block.isVisible === false ? 0.55 : 1,
            borderLeft:
              overIndex === index && dragIndex !== null
                ? "3px solid var(--admin-red)"
                : "1px solid var(--admin-line)",
          }}
          onDragOver={onDragOver(index)}
          onDrop={onDrop(index)}
          draggable={false}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span
              className="admin-block-drag"
              title="Glisser pour déplacer (ou utilisez les flèches)"
              draggable
              onDragStart={onDragStart(index)}
              onDragEnd={onDragEnd}
            >
              <GripVertical size={14} />
            </span>

            <select
              value={block.type}
              onChange={(e) =>
                update(index, { type: e.target.value as (typeof BLOCK_TYPES)[number]["value"] })
              }
              style={{ maxWidth: 200 }}
              aria-label="Type de section"
            >
              {BLOCK_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
            <span className="admin-row__spacer" />
            <button
              type="button"
              className="admin-btn"
              onClick={() => update(index, { isVisible: block.isVisible === false })}
              title={block.isVisible === false ? "Afficher la section" : "Masquer la section"}
            >
              {block.isVisible === false ? <EyeOff size={13} /> : <Eye size={13} />}
            </button>
            <button
              type="button"
              className="admin-btn"
              onClick={() => {
                const copy = { ...block, images: block.images ? [...block.images] : undefined };
                const next = [...blocks];
                next.splice(index + 1, 0, copy);
                onChange(next);
              }}
              title="Dupliquer la section"
            >
              <Copy size={13} />
            </button>
            <button
              type="button"
              className="admin-btn"
              onClick={() => move(index, -1)}
              title="Monter"
            >
              <ChevronUp size={13} />
            </button>
            <button
              type="button"
              className="admin-btn"
              onClick={() => move(index, 1)}
              title="Descendre"
            >
              <ChevronDown size={13} />
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

          {block.type !== "gallery" &&
          block.type !== "contact_info" &&
          block.type !== "spacer" &&
          block.type !== "button" ? (
            <label>
              {block.type === "image" ? "Légende / alt" : "Titre"}
              <input
                value={block.title ?? ""}
                onChange={(e) => update(index, { title: e.target.value })}
              />
            </label>
          ) : null}

          {block.type === "text" ? (
            <label>
              Texte
              <RichTextEditor
                value={block.body ?? ""}
                onChange={(html) => update(index, { body: html })}
                minHeight={180}
              />
            </label>
          ) : null}

          {block.type === "quote" ? (
            <label>
              Citation
              <textarea
                value={block.body ?? ""}
                onChange={(e) => update(index, { body: e.target.value })}
                rows={3}
              />
            </label>
          ) : null}

          {block.type === "html" ? (
            <label>
              Code HTML (administrateurs de confiance uniquement)
              <textarea
                value={block.body ?? ""}
                onChange={(e) => update(index, { body: e.target.value })}
                rows={6}
                style={{ fontFamily: "ui-monospace, monospace", fontSize: 12 }}
              />
            </label>
          ) : null}

          {block.type === "button" ? (
            <div className="admin-form__row">
              <label>
                Libellé du bouton
                <input
                  value={block.title ?? ""}
                  onChange={(e) => update(index, { title: e.target.value })}
                />
              </label>
              <label>
                Lien (URL interne ou externe)
                <input
                  value={block.body ?? ""}
                  onChange={(e) => update(index, { body: e.target.value })}
                  placeholder="/contact ou https://…"
                />
              </label>
            </div>
          ) : null}

          {block.type === "spacer" ? (
            <div className="admin-form__row">
              <label>
                Hauteur (px)
                <input
                  type="number"
                  min={8}
                  max={400}
                  value={block.body ?? "48"}
                  onChange={(e) => update(index, { body: e.target.value })}
                />
              </label>
              <p className="admin-hint" style={{ alignSelf: "end" }}>
                Section vide qui ajoute de l'espace entre deux blocs.
              </p>
            </div>
          ) : null}

          {block.type === "video" ? (
            <div className="admin-form__row">
              <label>
                URL de la vidéo (YouTube, Vimeo…)
                <input
                  value={block.imageUrl ?? ""}
                  onChange={(e) => update(index, { imageUrl: e.target.value })}
                  placeholder="https://www.youtube.com/watch?v=…"
                />
              </label>
              <label>
                Légende (optionnelle)
                <input
                  value={block.title ?? ""}
                  onChange={(e) => update(index, { title: e.target.value })}
                />
              </label>
            </div>
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
                <button
                  type="button"
                  className="admin-btn"
                  onClick={() => setPicker({ index, multiple: false })}
                >
                  <ImagePlus size={13} /> Choisir…
                </button>
              </div>
            </label>
          ) : null}

          {block.type === "gallery" ? (
            <>
              <div className="admin-form__inline">
                <span className="admin-hint">
                  {(block.images ?? []).length} image(s) dans la galerie
                </span>
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
                        onClick={() =>
                          update(index, { images: (block.images ?? []).filter((_, j) => j !== i) })
                        }
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
                <input
                  value={block.title ?? ""}
                  onChange={(e) => update(index, { title: e.target.value })}
                />
              </label>
              <label>
                E-mail
                <input
                  value={block.body ?? ""}
                  onChange={(e) => update(index, { body: e.target.value })}
                />
              </label>
              <label>
                Adresse
                <input
                  value={block.imageUrl ?? ""}
                  onChange={(e) => update(index, { imageUrl: e.target.value })}
                />
              </label>
            </div>
          ) : null}

          {/* Per-block English override. Only text blocks carry translatable
              strings; images, galleries and spacers are language-neutral. */}
          {block.type !== "gallery" &&
          block.type !== "contact_info" &&
          block.type !== "spacer" &&
          block.type !== "button" ? (
            <details
              style={{
                border: "1px dashed #d1d5db",
                borderRadius: 8,
                padding: "8px 10px",
                background: "#fafafa",
              }}
            >
              <summary
                style={{
                  cursor: "pointer",
                  fontSize: 12,
                  fontWeight: 700,
                  color: "#414849",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <Languages size={12} /> English text
                {block.i18n?.en && Object.keys(block.i18n.en).length > 0 ? (
                  <span className="admin-badge admin-badge--ok">EN</span>
                ) : (
                  <span className="admin-badge admin-badge--muted">FR only</span>
                )}
              </summary>
              <div style={{ display: "grid", gap: 8, marginTop: 10 }}>
                {block.type !== "image" ? (
                  <label>
                    English title
                    <input
                      value={block.i18n?.en?.title ?? ""}
                      onChange={(e) =>
                        update(index, {
                          i18n: {
                            ...block.i18n,
                            en: { ...block.i18n?.en, title: e.target.value },
                          },
                        })
                      }
                    />
                  </label>
                ) : null}
                {block.type === "text" || block.type === "quote" || block.type === "html" ? (
                  <label>
                    English body
                    <textarea
                      rows={4}
                      value={block.i18n?.en?.body ?? ""}
                      onChange={(e) =>
                        update(index, {
                          i18n: {
                            ...block.i18n,
                            en: { ...block.i18n?.en, body: e.target.value },
                          },
                        })
                      }
                    />
                  </label>
                ) : null}
              </div>
            </details>
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

export { BLOCK_TYPE_LABELS };
