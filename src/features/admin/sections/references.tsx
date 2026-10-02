import { useCallback, useEffect, useState } from "react";
import { ArrowDown, ArrowUp, Eye, EyeOff, Plus, Save, Trash2 } from "lucide-react";

import {
  adminApi,
  type CmsReference,
  type CmsReferenceKind,
  type CmsReferencePayload,
} from "@/lib/cms";
import type { AdminCtx } from "../types";
import { MediaPicker } from "../components/media-picker";

type Item = CmsReference;

const GROUPS: { kind: CmsReferenceKind; label: string; hint: string }[] = [
  {
    kind: "partner",
    label: "Partenaires",
    hint: "Logos affichés dans la grille « Nos clients » de la page Références.",
  },
  {
    kind: "certification",
    label: "Certifications",
    hint: "Logos et documents affichés dans la grille « Certifications ».",
  },
];

export function ReferencesSection({ ctx }: { ctx: AdminCtx }) {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    adminApi
      .references(ctx.csrf)
      .then((res) => setItems(res.items))
      .catch((err) => setError(err instanceof Error ? err.message : "Erreur de chargement."))
      .finally(() => setLoading(false));
  }, [ctx.csrf]);

  useEffect(load, [load]);

  /** Patch one item by its position in the flat list. */
  const update = (index: number, patch: Partial<Item>) => {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  };

  /** Reorder within the whole list; re-sorting keeps each kind contiguous. */
  const move = (index: number, delta: number) => {
    const target = index + delta;
    // Don't let an item cross into another group's ordering by accident —
    // swapping with a neighbouring item of the same kind keeps it sane.
    if (target < 0 || target >= items.length) return;
    if (items[target].kind !== items[index].kind) return;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    setItems(next);
  };

  const add = (kind: CmsReferenceKind) => {
    setItems((prev) => {
      const blank: Item = { kind, title: "", imageUrl: "", websiteUrl: "", isVisible: true };
      // Append after the last item of the same kind so grouping stays tidy.
      const lastOfKind = prev.map((i) => i.kind).lastIndexOf(kind);
      const at = lastOfKind === -1 ? prev.length : lastOfKind + 1;
      return [...prev.slice(0, at), blank, ...prev.slice(at)];
    });
  };

  const save = async () => {
    setBusy(true);
    setError(null);
    try {
      // The server owns sort_order and rejects rows without a title, so the
      // payload drops ids and any blank rows the editor left behind.
      const payload: CmsReferencePayload[] = items
        .filter((item) => item.title.trim() !== "")
        .map(({ kind, title, imageUrl, websiteUrl, isVisible, i18n }) => ({
          kind,
          title: title.trim(),
          imageUrl: imageUrl ?? "",
          websiteUrl: websiteUrl ?? "",
          isVisible: isVisible ?? true,
          i18n,
        }));
      await adminApi.saveReferences(ctx.csrf, payload);
      ctx.notify("Références enregistrées.");
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur d'enregistrement.");
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-section">
        <p className="admin-hint">Chargement des références…</p>
      </div>
    );
  }

  return (
    <div className="admin-section">
      <div className="admin-section__head">
        <h2>Références clients</h2>
        <button className="admin-btn admin-btn--primary" onClick={save} disabled={busy}>
          <Save size={14} /> {busy ? "Enregistrement…" : "Enregistrer"}
        </button>
      </div>

      <p className="admin-hint">
        Ces éléments remplacent les logos codés en dur sur la page Références. Tant qu'aucune
        référence n'est enregistrée, la page affiche la liste d'origine.
      </p>

      {error ? <p className="admin-alert admin-alert--error">{error}</p> : null}

      {GROUPS.map((group) => {
        const groupIndexes = items
          .map((item, index) => ({ item, index }))
          .filter((entry) => entry.item.kind === group.kind);

        return (
          <fieldset key={group.kind} className="admin-form" style={{ gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <strong>
                {group.label} ({groupIndexes.length})
              </strong>
              <span className="admin-row__spacer" />
              <button
                type="button"
                className="admin-btn"
                onClick={() => add(group.kind)}
                title={`Ajouter une référence « ${group.label} »`}
              >
                <Plus size={13} /> Ajouter
              </button>
            </div>

            <p className="admin-hint">{group.hint}</p>

            {groupIndexes.length === 0 ? (
              <p className="admin-hint">Aucune référence. Utilisez « Ajouter » pour commencer.</p>
            ) : null}

            {groupIndexes.map(({ item, index }, position) => (
              <ReferenceRow
                key={item.id ?? `new-${index}`}
                ctx={ctx}
                item={item}
                isFirst={position === 0}
                isLast={position === groupIndexes.length - 1}
                onChange={(patch) => update(index, patch)}
                onMove={(delta) => move(index, delta)}
                onRemove={() => setItems((prev) => prev.filter((_, i) => i !== index))}
              />
            ))}
          </fieldset>
        );
      })}

      <div style={{ position: "sticky", bottom: 0, background: "#f7f8f6", padding: "10px 0" }}>
        <button className="admin-btn admin-btn--primary" onClick={save} disabled={busy}>
          <Save size={14} /> {busy ? "Enregistrement…" : "Enregistrer"}
        </button>
      </div>
    </div>
  );
}

function ReferenceRow({
  ctx,
  item,
  isFirst,
  isLast,
  onChange,
  onMove,
  onRemove,
}: {
  ctx: AdminCtx;
  item: Item;
  isFirst: boolean;
  isLast: boolean;
  onChange: (patch: Partial<Item>) => void;
  onMove: (delta: number) => void;
  onRemove: () => void;
}) {
  const [open, setOpen] = useState(false);
  const en = item.i18n?.en?.title ?? "";

  return (
    <div
      className="admin-form"
      style={{
        gap: 10,
        background: "#fff",
        border: "1px solid #e4e7e4",
        borderRadius: 10,
        padding: 12,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt=""
            style={{
              width: 44,
              height: 44,
              objectFit: "contain",
              borderRadius: 6,
              background: "#f4f5f3",
              flexShrink: 0,
            }}
          />
        ) : (
          <span
            style={{
              width: 44,
              height: 44,
              borderRadius: 6,
              background: "#f0f1ef",
              flexShrink: 0,
            }}
          />
        )}

        <span style={{ fontWeight: 600, opacity: item.title ? 1 : 0.5 }}>
          {item.title || "(sans titre)"}
        </span>
        {en ? (
          <span style={{ fontSize: 11, color: "#6b7370" }}>EN: {en}</span>
        ) : (
          <span style={{ fontSize: 11, color: "#a3552f" }}>EN manquant</span>
        )}

        <span className="admin-row__spacer" />
        <button
          type="button"
          className="admin-btn"
          title={item.isVisible ? "Visible" : "Masquée"}
          onClick={() => onChange({ isVisible: !item.isVisible })}
        >
          {item.isVisible ? <Eye size={13} /> : <EyeOff size={13} />}
        </button>
        <button type="button" className="admin-btn" title="Monter" onClick={() => onMove(-1)} disabled={isFirst}>
          <ArrowUp size={13} />
        </button>
        <button type="button" className="admin-btn" title="Descendre" onClick={() => onMove(1)} disabled={isLast}>
          <ArrowDown size={13} />
        </button>
        <button type="button" className="admin-btn admin-btn--danger" title="Supprimer" onClick={onRemove}>
          <Trash2 size={13} />
        </button>
      </div>

      <div className="admin-form__row" style={{ alignItems: "end" }}>
        <label>
          Titre
          <input value={item.title ?? ""} onChange={(e) => onChange({ title: e.target.value })} />
        </label>
        <label>
          Titre (EN)
          <input
            value={en}
            onChange={(e) =>
              onChange({
                i18n: { ...item.i18n, en: { ...item.i18n?.en, title: e.target.value } },
              })
            }
            placeholder="Optionnel — sinon le titre français est utilisé"
          />
        </label>
      </div>

      <label>
        Image
        <div className="admin-form__inline">
          <input
            value={item.imageUrl ?? ""}
            onChange={(e) => onChange({ imageUrl: e.target.value })}
            placeholder="/api/uploads/…"
          />
          <button type="button" className="admin-btn" onClick={() => setOpen(true)}>
            Choisir…
          </button>
        </div>
      </label>

      <label>
        Lien (URL du site client, optionnel)
        <input
          value={item.websiteUrl ?? ""}
          onChange={(e) => onChange({ websiteUrl: e.target.value })}
          placeholder="https://…"
        />
      </label>

      <MediaPicker
        csrf={ctx.csrf}
        open={open}
        title="Choisir un logo"
        onSelect={(url) => onChange({ imageUrl: url })}
        onClose={() => setOpen(false)}
      />
    </div>
  );
}