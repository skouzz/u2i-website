import { useCallback, useEffect, useState } from "react";
import { ArrowDown, ArrowUp, Eye, EyeOff, Plus, Save, Trash2 } from "lucide-react";

import { adminApi, type CmsHomeBlock, type CmsMedia, type HomeBlockType } from "@/lib/cms";
import type { AdminCtx } from "../types";
import { MediaPicker } from "../components/media-picker";

const BLOCK_TYPES: { value: HomeBlockType; label: string }[] = [
  { value: "hero", label: "Bannière (Hero)" },
  { value: "about", label: "À propos" },
  { value: "services", label: "Services / Secteurs" },
  { value: "stats", label: "Chiffres clés" },
  { value: "features", label: "Atouts (Features)" },
  { value: "projects", label: "Projets / Équipements" },
  { value: "testimonials", label: "Témoignages" },
  { value: "team", label: "Équipe" },
  { value: "articles", label: "Derniers articles" },
  { value: "gallery", label: "Galerie" },
  { value: "cta", label: "Appel à l'action" },
  { value: "contact", label: "Contact" },
  { value: "faq", label: "FAQ" },
  { value: "html", label: "HTML libre" },
];

type Blocks = CmsHomeBlock[];

export function HomepageSection({ ctx }: { ctx: AdminCtx }) {
  const [blocks, setBlocks] = useState<Blocks>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    adminApi
      .homeBlocks(ctx.csrf)
      .then((res) => setBlocks(res.items))
      .catch((err) => setError(err instanceof Error ? err.message : "Erreur de chargement."))
      .finally(() => setLoading(false));
  }, [ctx.csrf]);

  useEffect(load, [load]);

  const update = (index: number, patch: Partial<CmsHomeBlock>) => {
    setBlocks((prev) => prev.map((block, i) => (i === index ? { ...block, ...patch } : block)));
  };

  const move = (index: number, delta: number) => {
    const target = index + delta;
    if (target < 0 || target >= blocks.length) return;
    const next = [...blocks];
    [next[index], next[target]] = [next[target], next[index]];
    setBlocks(next);
  };

  const save = async () => {
    setBusy(true);
    setError(null);
    try {
      await adminApi.saveHomeBlocks(ctx.csrf, blocks);
      ctx.notify("Page d'accueil enregistrée.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur d'enregistrement.");
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-section">
        <p className="admin-hint">Chargement des sections…</p>
      </div>
    );
  }

  return (
    <div className="admin-section">
      <div className="admin-section__head">
        <h2>Sections de la page d'accueil ({blocks.length})</h2>
        <button className="admin-btn admin-btn--primary" onClick={save} disabled={busy}>
          <Save size={14} /> {busy ? "Enregistrement…" : "Enregistrer"}
        </button>
      </div>

      <p className="admin-hint">
        L'ordre des sections ci-dessous définit l'ordre d'affichage sur la page d'accueil. Si aucune
        section n'est définie, la page d'accueil par défaut (design d'origine) s'affiche.
      </p>

      {error ? <p className="admin-alert admin-alert--error">{error}</p> : null}

      {blocks.map((block, index) => (
        <fieldset
          key={block.id ?? index}
          className="admin-form"
          style={{ position: "relative", gap: 10 }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <select
              value={block.type}
              onChange={(e) => update(index, { type: e.target.value as HomeBlockType })}
              style={{ maxWidth: 220 }}
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
              title={block.isVisible ? "Visible" : "Masquée"}
              onClick={() => update(index, { isVisible: !block.isVisible })}
            >
              {block.isVisible ? <Eye size={13} /> : <EyeOff size={13} />}
            </button>
            <button
              type="button"
              className="admin-btn"
              title="Monter"
              onClick={() => move(index, -1)}
              disabled={index === 0}
            >
              <ArrowUp size={13} />
            </button>
            <button
              type="button"
              className="admin-btn"
              title="Descendre"
              onClick={() => move(index, 1)}
              disabled={index === blocks.length - 1}
            >
              <ArrowDown size={13} />
            </button>
            <button
              type="button"
              className="admin-btn admin-btn--danger"
              title="Supprimer la section"
              onClick={() => setBlocks((prev) => prev.filter((_, i) => i !== index))}
            >
              <Trash2 size={13} />
            </button>
          </div>

          <div className="admin-form__row">
            <label>
              Titre
              <input
                value={block.title ?? ""}
                onChange={(e) => update(index, { title: e.target.value })}
              />
            </label>
            <label>
              Sous-titre
              <input
                value={block.subtitle ?? ""}
                onChange={(e) => update(index, { subtitle: e.target.value })}
              />
            </label>
          </div>

          <label>
            Texte
            <textarea
              value={block.body ?? ""}
              onChange={(e) => update(index, { body: e.target.value })}
              rows={3}
            />
          </label>

          <label>
            Image
            <div className="admin-form__inline">
              <input
                value={block.imageUrl ?? ""}
                onChange={(e) => update(index, { imageUrl: e.target.value })}
                placeholder="/api/uploads/…"
              />
              <HomeBlockImagePicker ctx={ctx} onPick={(url) => update(index, { imageUrl: url })} />
            </div>
          </label>

          {block.type === "stats" ||
          block.type === "services" ||
          block.type === "testimonials" ||
          block.type === "faq" ||
          block.type === "team" ? (
            <ItemsConfig
              block={block}
              onChange={(items) => update(index, { config: { ...block.config, items } })}
            />
          ) : null}

          {block.type === "cta" || block.type === "hero" ? (
            <div className="admin-form__row">
              <label>
                Libellé du bouton
                <input
                  value={String(block.config?.buttonLabel ?? "")}
                  onChange={(e) =>
                    update(index, { config: { ...block.config, buttonLabel: e.target.value } })
                  }
                />
              </label>
              <label>
                Lien du bouton
                <input
                  value={String(block.config?.buttonUrl ?? "")}
                  onChange={(e) =>
                    update(index, { config: { ...block.config, buttonUrl: e.target.value } })
                  }
                />
              </label>
            </div>
          ) : null}

          {block.type === "html" ? (
            <label>
              HTML libre (réservé aux administrateurs avertis)
              <textarea
                value={String(block.config?.html ?? "")}
                onChange={(e) =>
                  update(index, { config: { ...block.config, html: e.target.value } })
                }
                rows={5}
                className="admin-form__body"
              />
            </label>
          ) : null}
        </fieldset>
      ))}

      <div>
        <button
          type="button"
          className="admin-btn"
          onClick={() =>
            setBlocks((prev) => [
              ...prev,
              {
                type: "about",
                title: "",
                subtitle: "",
                body: "",
                imageUrl: "",
                config: {},
                isVisible: true,
              },
            ])
          }
        >
          <Plus size={14} /> Ajouter une section
        </button>
      </div>

      <div style={{ position: "sticky", bottom: 0, background: "#f7f8f6", padding: "10px 0" }}>
        <button className="admin-btn admin-btn--primary" onClick={save} disabled={busy}>
          <Save size={14} /> {busy ? "Enregistrement…" : "Enregistrer"}
        </button>
      </div>
    </div>
  );
}

function HomeBlockImagePicker({ ctx, onPick }: { ctx: AdminCtx; onPick: (url: string) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" className="admin-btn" onClick={() => setOpen(true)}>
        Choisir…
      </button>
      <MediaPicker
        csrf={ctx.csrf}
        open={open}
        title="Choisir une image"
        onSelect={onPick}
        onClose={() => setOpen(false)}
      />
    </>
  );
}

/** Repeatable item list for stats / services / testimonials / faq / team. */
function ItemsConfig({
  block,
  onChange,
}: {
  block: CmsHomeBlock;
  onChange: (items: Record<string, string>[]) => void;
}) {
  const items = Array.isArray(block.config?.items)
    ? (block.config?.items as Record<string, string>[])
    : [];
  const fieldLabels: Record<string, { key: string; label: string }[]> = {
    stats: [
      { key: "value", label: "Valeur" },
      { key: "label", label: "Libellé" },
    ],
    services: [
      { key: "title", label: "Titre" },
      { key: "text", label: "Texte" },
      { key: "image", label: "Image (URL)" },
    ],
    testimonials: [
      { key: "author", label: "Auteur" },
      { key: "text", label: "Citation" },
    ],
    faq: [
      { key: "question", label: "Question" },
      { key: "answer", label: "Réponse" },
    ],
    team: [
      { key: "name", label: "Nom" },
      { key: "role", label: "Rôle" },
      { key: "image", label: "Photo (URL)" },
    ],
  };
  const fields = fieldLabels[block.type] ?? [];

  return (
    <div className="admin-form" style={{ background: "#f7f8f6", gap: 8 }}>
      <span className="admin-hint">Éléments ({items.length})</span>
      {items.map((item, i) => (
        <div key={i} className="admin-form__row" style={{ alignItems: "end" }}>
          {fields.map((field) => (
            <label key={field.key}>
              {field.label}
              <input
                value={item[field.key] ?? ""}
                onChange={(e) => {
                  const next = [...items];
                  next[i] = { ...next[i], [field.key]: e.target.value };
                  onChange(next);
                }}
              />
            </label>
          ))}
          <button
            type="button"
            className="admin-btn admin-btn--danger"
            onClick={() => onChange(items.filter((_, j) => j !== i))}
          >
            <Trash2 size={13} />
          </button>
        </div>
      ))}
      <button type="button" className="admin-btn" onClick={() => onChange([...items, {}])}>
        <Plus size={12} /> Ajouter un élément
      </button>
    </div>
  );
}

// Keep the CmsMedia import used for future direct-upload flows.
void (null as unknown as CmsMedia | undefined);
