import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowUp, Eye, EyeOff, Plus, Save, Trash2 } from "lucide-react";

import {
  adminApi,
  type CmsReference,
  type CmsReferenceKind,
  type CmsReferencePayload,
} from "@/lib/cms";
import {
  BUNDLED_CERTIFICATIONS,
  BUNDLED_PARTNERS,
  titleFromImageUrl,
} from "@/lib/references-bundled";
import type { AdminCtx } from "../types";
import { MediaPicker } from "../components/media-picker";

type Item = CmsReference;

/**
 * Client-side identity for unsaved rows.
 *
 * Every row gets one the moment it is created. React keys must never fall back
 * to the array index here, because inserting a row shifts every later index —
 * the new row would collide with an existing key and React would reuse that
 * row's component, so the freshly added form never appeared.
 */
let clientSeq = 0;
const newClientId = () => `u2i-ref-${Date.now().toString(36)}-${++clientSeq}`;

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
  // Type used by the "Ajouter" button; each row can override it afterwards.
  const [newKind, setNewKind] = useState<CmsReferenceKind>("partner");
  // Row most recently added, used to scroll it into view and highlight it.
  const [pendingFocus, setPendingFocus] = useState<string | null>(null);

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
    const clientId = newClientId();
    setItems((prev) => {
      const blank: Item = {
        clientId,
        kind,
        title: "",
        imageUrl: "",
        websiteUrl: "",
        isVisible: true,
      };
      return insertAtEndOfKind(prev, blank);
    });
    setPendingFocus(clientId);
  };

  /**
   * Reveal and focus a freshly added row.
   *
   * The Ajouter button sits at the top of the section, but a new row is
   * appended at the end of its group — with the 28 bundled partners imported
   * that is some way down the page. The row was rendering, just off-screen,
   * so the counter moved and it looked like nothing had happened.
   */
  useEffect(() => {
    if (!pendingFocus) return;
    const scrollTimer = window.setTimeout(() => {
      const row = document.querySelector<HTMLElement>(`[data-ref-id="${pendingFocus}"]`);
      if (row) {
        row.scrollIntoView({ behavior: "smooth", block: "center" });
        row.querySelector<HTMLInputElement>('input[data-field="title"]')?.focus();
      }
    }, 80);
    const clearTimer = window.setTimeout(() => setPendingFocus(null), 3000);
    return () => {
      window.clearTimeout(scrollTimer);
      window.clearTimeout(clearTimer);
    };
  }, [pendingFocus]);

  /**
   * Move a row into another group (partenaire ↔ certification).
   *
   * The row is re-inserted at the end of its new group so the flat list stays
   * grouped by kind, which is what the ordering sent to the server assumes.
   */
  const changeKind = (index: number, kind: CmsReferenceKind) => {
    setItems((prev) => {
      const row = prev[index];
      if (!row || row.kind === kind) return prev;
      const rest = prev.filter((_, i) => i !== index);
      return insertAtEndOfKind(rest, { ...row, kind });
    });
  };

  /** Append after the last item sharing `kind`, so groups stay contiguous. */
  function insertAtEndOfKind(list: Item[], row: Item): Item[] {
    const lastOfKind = list.map((i) => i.kind).lastIndexOf(row.kind);
    const at = lastOfKind === -1 ? list.length : lastOfKind + 1;
    return [...list.slice(0, at), row, ...list.slice(at)];
  }

  /**
   * Append the bundled logos that are not in the editor yet.
   *
   * Without this the section starts empty on a fresh database and every one of
   * the 30+ existing logos would have to be typed in by hand before it could be
   * edited or reordered. It appends rather than replaces so importing can never
   * discard logos that were just added by hand.
   */
  const importBundled = () => {
    const present = new Set(items.map((i) => (i.imageUrl ?? "").trim()).filter(Boolean));
    const missing: Item[] = [
      ...BUNDLED_PARTNERS.filter((p) => !present.has(p.image)).map((p) => ({
        clientId: newClientId(),
        kind: "partner" as const,
        title: p.title,
        imageUrl: p.image,
        websiteUrl: "",
        isVisible: true,
      })),
      ...BUNDLED_CERTIFICATIONS.filter((c) => !present.has(c.image)).map((c) => ({
        clientId: newClientId(),
        kind: "certification" as const,
        title: c.title,
        imageUrl: c.image,
        websiteUrl: "",
        isVisible: true,
      })),
    ];

    if (missing.length === 0) {
      ctx.notify("Tous les logos d'origine sont déjà dans la liste.");
      return;
    }
    setItems((prev) => [...prev, ...missing]);
    ctx.notify(`${missing.length} logo(s) ajouté(s) — enregistrez pour les appliquer.`);
  };

  const missingBundled = useMemo(() => {
    const present = new Set(items.map((i) => (i.imageUrl ?? "").trim()).filter(Boolean));
    const count = (list: { image: string }[]) =>
      list.filter((entry) => !present.has(entry.image)).length;
    return count(BUNDLED_PARTNERS) + count(BUNDLED_CERTIFICATIONS);
  }, [items]);

  const save = async () => {
    setBusy(true);
    setError(null);
    try {
      // A row is worth keeping when it has an image even if the title was left
      // blank — the previous version filtered those out, so uploading a logo
      // and pressing Save silently discarded it with no error anywhere.
      // Fall back to a title derived from the filename instead of dropping it.
      const payload: CmsReferencePayload[] = items
        .filter((item) => item.title.trim() !== "" || (item.imageUrl ?? "").trim() !== "")
        .map(({ kind, title, imageUrl, websiteUrl, isVisible, i18n }) => {
          const cleanTitle = title.trim();
          const image = (imageUrl ?? "").trim();
          return {
            kind,
            title: cleanTitle !== "" ? cleanTitle : titleFromImageUrl(image),
            imageUrl: image,
            websiteUrl: (websiteUrl ?? "").trim(),
            isVisible: isVisible ?? true,
            i18n,
          };
        });

      const dropped = items.length - payload.length;
      await adminApi.saveReferences(ctx.csrf, payload);
      ctx.notify(
        dropped > 0
          ? `Références enregistrées (${dropped} ligne(s) ignorée(s) : sans titre ni image).`
          : "Références enregistrées.",
      );
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

      <div
        className="admin-form"
        style={{ gap: 8, background: "#f7f8f6", borderRadius: 10, padding: 14 }}
      >
        <p className="admin-hint">
          {items.length === 0
            ? "La liste est vide. Importez les logos d'origine pour les rendre modifiables, ou ajoutez-les à la main."
            : "Ajoutez en lot les logos d'origine qui ne sont pas encore dans la liste."}
        </p>
        <div>
          <button
            type="button"
            className="admin-btn admin-btn--primary"
            onClick={importBundled}
            disabled={missingBundled === 0}
          >
            <Plus size={14} />
            {missingBundled === 0
              ? "Tous les logos d'origine sont présents"
              : `Ajouter les ${missingBundled} logo(s) d'origine manquant(s)`}
          </button>
        </div>
      </div>

      <div
        className="admin-form"
        style={{ gap: 10, background: "#fff", borderRadius: 10, padding: 14 }}
      >
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "end", gap: 10 }}>
          <label style={{ margin: 0, minWidth: 200 }}>
            Type de référence
            <select
              value={newKind}
              onChange={(e) => setNewKind(e.target.value as CmsReferenceKind)}
            >
              <option value="partner">Partenaire (logo client)</option>
              <option value="certification">Certification</option>
            </select>
          </label>
          <button
            type="button"
            className="admin-btn admin-btn--primary"
            onClick={() => add(newKind)}
          >
            <Plus size={13} /> Ajouter
          </button>
        </div>
        <p className="admin-hint">
          Une ligne vide est créée dans le groupe choisi. Vous pouvez changer son type à tout moment
          avec le sélecteur « Type » de la ligne.
        </p>
      </div>

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
            </div>

            <p className="admin-hint">{group.hint}</p>

            {groupIndexes.length === 0 ? (
              <p className="admin-hint">Aucune référence. Utilisez « Ajouter » ci-dessus.</p>
            ) : null}

            {groupIndexes.map(({ item, index }, position) => (
              <ReferenceRow
                // Never key on the array position: rows are inserted in the
                // middle, so a positional key collides and React reuses the
                // wrong row's component instead of mounting the new form.
                key={item.id ?? item.clientId ?? `${group.kind}-${position}`}
                ctx={ctx}
                item={item}
                isFirst={position === 0}
                isLast={position === groupIndexes.length - 1}
                onChange={(patch) => update(index, patch)}
                onKindChange={(kind) => changeKind(index, kind)}
                isNew={item.clientId === pendingFocus}
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
  isNew,
  onChange,
  onKindChange,
  onMove,
  onRemove,
}: {
  ctx: AdminCtx;
  item: Item;
  isFirst: boolean;
  isLast: boolean;
  /** Highlight a just-added row so it is obvious where it landed. */
  isNew?: boolean;
  onChange: (patch: Partial<Item>) => void;
  onKindChange: (kind: CmsReferenceKind) => void;
  onMove: (delta: number) => void;
  onRemove: () => void;
}) {
  const [open, setOpen] = useState(false);
  const en = item.i18n?.en?.title ?? "";

  return (
    <div
      className="admin-form"
      data-ref-id={item.clientId}
      style={{
        gap: 10,
        background: isNew ? "#fff8f8" : "#fff",
        border: `1px solid ${isNew ? "#e0141c" : "#e4e7e4"}`,
        borderRadius: 10,
        padding: 12,
        scrollMargin: 96,
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
        <button
          type="button"
          className="admin-btn"
          title="Monter"
          onClick={() => onMove(-1)}
          disabled={isFirst}
        >
          <ArrowUp size={13} />
        </button>
        <button
          type="button"
          className="admin-btn"
          title="Descendre"
          onClick={() => onMove(1)}
          disabled={isLast}
        >
          <ArrowDown size={13} />
        </button>
        <button
          type="button"
          className="admin-btn admin-btn--danger"
          title="Supprimer"
          onClick={onRemove}
        >
          <Trash2 size={13} />
        </button>
      </div>

      <div className="admin-form__row" style={{ alignItems: "end" }}>
        <label style={{ maxWidth: 190 }}>
          Type
          <select
            value={item.kind}
            onChange={(e) => onKindChange(e.target.value as CmsReferenceKind)}
          >
            <option value="partner">Partenaire</option>
            <option value="certification">Certification</option>
          </select>
        </label>
        <label>
          Titre
          <input
            data-field="title"
            value={item.title ?? ""}
            onChange={(e) => onChange({ title: e.target.value })}
          />
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
