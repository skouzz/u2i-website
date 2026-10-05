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
  BUNDLED_CLIENTS_FLAT,
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

/*
 * The three kinds the public pages draw, and where each one ends up.
 *
 * Clients and partners are two separate groups HERE because the public page
 * still separates them with a heading — but they now share one page, so the
 * hints point at the grids on /references rather than at pages of their own.
 */
const GROUPS: { kind: CmsReferenceKind; label: string; hint: string }[] = [
  {
    kind: "client",
    label: "Clients",
    hint: "Logos des industriels pour qui nous avons réalisé des lignes, dans la grille « Nos clients » de la page Références.",
  },
  {
    kind: "partner",
    label: "Partenaires",
    hint: "Fournisseurs de technologies et distributeurs d'équipement, dans la grille « Partenaires technologiques » de la page Références.",
  },
  {
    kind: "certification",
    label: "Certifications",
    hint: "Logos et documents affichés dans la grille « Certifications qualité », sur la page Références › Certifications.",
  },
];

export function ReferencesSection({ ctx }: { ctx: AdminCtx }) {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Type used by the "Ajouter" button; each row can override it afterwards.
  // Defaults to client, which is the group an admin adds to most often.
  const [newKind, setNewKind] = useState<CmsReferenceKind>("client");
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
      return insertAtStartOfKind(prev, blank);
    });
    setPendingFocus(clientId);
  };

  /**
   * Focus a freshly added row, scrolling only if it is off-screen.
   *
   * New rows are inserted at the TOP of their group, so a partner appears
   * directly under the Partenaires header — no scrolling needed. A
   * certification still lands below every partner, so this only scrolls when
   * the row genuinely is not already within the viewport.
   */
  useEffect(() => {
    if (!pendingFocus) return;
    const scrollTimer = window.setTimeout(() => {
      const row = document.querySelector<HTMLElement>(`[data-ref-id="${pendingFocus}"]`);
      if (row) {
        const box = row.getBoundingClientRect();
        const offscreen = box.top < 0 || box.bottom > window.innerHeight;
        if (offscreen) {
          row.scrollIntoView({ behavior: "smooth", block: "center" });
        }
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
   * Move a row into another group (client ↔ partenaire ↔ certification).
   *
   * The row is re-inserted at the top of its new group so the flat list stays
   * grouped by kind, which is what the ordering sent to the server assumes.
   */
  const changeKind = (index: number, kind: CmsReferenceKind) => {
    setItems((prev) => {
      const row = prev[index];
      if (!row || row.kind === kind) return prev;
      const rest = prev.filter((_, i) => i !== index);
      return insertAtStartOfKind(rest, { ...row, kind });
    });
  };

  /**
   * Insert a row at the TOP of its group.
   *
   * New entries then appear directly under the group header, next to the
   * Ajouter button, instead of at the bottom of a long list where they are
   * easy to miss. Groups stay contiguous, which is what the ordering sent to
   * the server assumes.
   */
  function insertAtStartOfKind(list: Item[], row: Item): Item[] {
    const firstOfKind = list.findIndex((i) => i.kind === row.kind);
    const at = firstOfKind === -1 ? list.length : firstOfKind;
    return [...list.slice(0, at), row, ...list.slice(at)];
  }

  /**
   * Append rows at the end of their own group, preserving their order.
   *
   * Used when importing the bundled logos: they must keep their original
   * sequence, and pushing them onto the end of the flat list would interleave
   * partners and certifications into P… C… P… C…, which breaks the grouped
   * ordering the server stores.
   */
  function appendKeepingGroups(list: Item[], rows: Item[]): Item[] {
    let out = list;
    for (const row of rows) {
      const lastOfKind = out.map((i) => i.kind).lastIndexOf(row.kind);
      const at = lastOfKind === -1 ? out.length : lastOfKind + 1;
      out = [...out.slice(0, at), row, ...out.slice(at)];
    }
    return out;
  }

  /**
   * Re-group a list that re-filing just scrambled.
   *
   * Changing a row's kind in place leaves it sitting where it was — a client
   * logo re-filed out of the partners block would stay interleaved inside it,
   * and this file relies on the groups staying contiguous for the ↑ ↓ buttons
   * and for the order the server stores. Stable, so rows keep their relative
   * order inside each group.
   */
  function regroupByKind(list: Item[]): Item[] {
    return list
      .map((item, index) => ({ item, index }))
      .sort(
        (a, b) =>
          GROUPS.findIndex((g) => g.kind === a.item.kind) -
            GROUPS.findIndex((g) => g.kind === b.item.kind) || a.index - b.index,
      )
      .map((entry) => entry.item);
  }

  /**
   * Append the bundled logos that are not in the editor yet, and re-file the
   * ones that were saved under the wrong kind.
   *
   * Without this the section starts empty on a fresh database and every one of
   * the 30+ existing logos would have to be typed in by hand before it could be
   * edited or reordered. It appends rather than replaces so importing can never
   * discard logos that were just added by hand.
   *
   * Presence is judged per KIND, not just per image. A database populated
   * before the editor could create a client row stored every client logo as a
   * `partner`: matching on the image alone called them "already present", so
   * the import added nothing and the Clients group stayed empty forever — the
   * symptom of partners showing up where clients were expected. Re-filing keeps
   * the row (and its edits) instead of inserting a second copy of the same logo.
   */
  const importBundled = () => {
    const missing: Item[] = [];
    const rekind = new Map<string, CmsReferenceKind>();

    const collect = (list: { image: string; title: string }[], kind: CmsReferenceKind) => {
      for (const entry of list) {
        const existing = items.find((item) => (item.imageUrl ?? "").trim() === entry.image);
        if (!existing) {
          missing.push({
            clientId: newClientId(),
            kind,
            title: entry.title,
            imageUrl: entry.image,
            websiteUrl: "",
            isVisible: true,
          });
        } else if (existing.kind !== kind) {
          rekind.set(entry.image, kind);
        }
      }
    };

    collect(BUNDLED_CLIENTS_FLAT, "client");
    collect(BUNDLED_PARTNERS, "partner");
    collect(BUNDLED_CERTIFICATIONS, "certification");

    if (missing.length === 0 && rekind.size === 0) {
      ctx.notify("Tous les logos d'origine sont déjà dans la liste, au bon groupe.");
      return;
    }
    setItems((prev) => {
      const retyped = prev.map((item) => {
        const image = (item.imageUrl ?? "").trim();
        const kind = rekind.get(image);
        return kind ? { ...item, kind } : item;
      });
      return appendKeepingGroups(regroupByKind(retyped), missing);
    });
    const parts: string[] = [];
    if (missing.length > 0) parts.push(`${missing.length} logo(s) ajouté(s)`);
    if (rekind.size > 0) parts.push(`${rekind.size} logo(s) remis dans le bon groupe`);
    ctx.notify(`${parts.join(" — ")} — enregistrez pour les appliquer.`);
  };

  /**
   * How many bundled logos the import would still add or re-file.
   *
   * Counts both cases, so the button stays enabled (with an honest count) when
   * every logo is in the list but the client ones are filed as partners.
   */
  const missingBundled = useMemo(() => {
    const byImage = new Map<string, CmsReferenceKind>();
    for (const item of items) {
      const image = (item.imageUrl ?? "").trim();
      if (image && !byImage.has(image)) byImage.set(image, item.kind);
    }
    const count = (list: { image: string }[], kind: CmsReferenceKind) =>
      list.filter((entry) => {
        const found = byImage.get(entry.image);
        return found === undefined || found !== kind;
      }).length;
    return (
      count(BUNDLED_CLIENTS_FLAT, "client") +
      count(BUNDLED_PARTNERS, "partner") +
      count(BUNDLED_CERTIFICATIONS, "certification")
    );
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
        <h2>Références</h2>
        <button className="admin-btn admin-btn--primary" onClick={save} disabled={busy}>
          <Save size={14} /> {busy ? "Enregistrement…" : "Enregistrer"}
        </button>
      </div>

      <p className="admin-hint">
        Ces éléments s'ajoutent aux logos fournis avec le site : la page Références affiche les
        références enregistrées puis, pour celles que vous ne gérez pas ici, les logos d'origine.
        Masquer une référence d'origine la retire de la page sans l'effacer de la liste.
      </p>

      <div
        className="admin-form"
        style={{ gap: 8, background: "#f7f8f6", borderRadius: 10, padding: 14 }}
      >
        <p className="admin-hint">
          {items.length === 0
            ? "La liste est vide. Importez les logos d'origine pour les rendre modifiables, ou ajoutez-les à la main."
            : "Ajoutez en lot les logos d'origine absents, et remettez dans le bon groupe ceux qui sont enregistrés sous le mauvais type."}
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
              <option value="client">Client (industriel)</option>
              <option value="partner">Partenaire (fournisseur)</option>
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
            <option value="client">Client</option>
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
