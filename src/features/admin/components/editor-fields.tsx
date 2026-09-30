import { useEffect, useRef, useState } from "react";
import { History, Loader2 } from "lucide-react";

import { adminApi, type CmsRevisionMeta, type CmsSeo, type CmsStatus } from "@/lib/cms";

// ── SEO fields ───────────────────────────────────────────────────────────────

export function SeoFields({ seo, onChange }: { seo: CmsSeo; onChange: (seo: CmsSeo) => void }) {
  const set = (patch: Partial<CmsSeo>) => onChange({ ...seo, ...patch });

  return (
    <fieldset className="admin-form" style={{ gap: 12 }}>
      <legend
        style={{
          fontSize: 11,
          fontWeight: 800,
          textTransform: "uppercase",
          color: "#414849",
          padding: "0 6px",
        }}
      >
        Référencement (SEO)
      </legend>
      <div className="admin-form__row">
        <label>
          Titre SEO
          <input
            value={seo.seoTitle ?? ""}
            onChange={(e) => set({ seoTitle: e.target.value })}
            placeholder="Titre dans les résultats Google"
          />
        </label>
        <label>
          URL canonique
          <input
            value={seo.canonicalUrl ?? ""}
            onChange={(e) => set({ canonicalUrl: e.target.value })}
            placeholder="https://…"
          />
        </label>
      </div>
      <label>
        Méta description
        <textarea
          value={seo.seoDescription ?? ""}
          onChange={(e) => set({ seoDescription: e.target.value })}
          rows={2}
        />
      </label>
      <div className="admin-form__row">
        <label>
          Titre Open Graph (partage)
          <input value={seo.ogTitle ?? ""} onChange={(e) => set({ ogTitle: e.target.value })} />
        </label>
        <label>
          Image Open Graph
          <input
            value={seo.ogImage ?? ""}
            onChange={(e) => set({ ogImage: e.target.value })}
            placeholder="/api/uploads/…"
          />
        </label>
      </div>
      <div className="admin-form__row">
        <label>
          Description Open Graph
          <input
            value={seo.ogDescription ?? ""}
            onChange={(e) => set({ ogDescription: e.target.value })}
          />
        </label>
        <label>
          Robots
          <select value={seo.robots ?? ""} onChange={(e) => set({ robots: e.target.value })}>
            <option value="">index, follow (défaut)</option>
            <option value="noindex">noindex, follow</option>
            <option value="nofollow">index, nofollow</option>
            <option value="noindex,nofollow">noindex, nofollow</option>
          </select>
        </label>
      </div>
    </fieldset>
  );
}

// ── Status / workflow fields ─────────────────────────────────────────────────

const STATUS_OPTIONS: { value: CmsStatus; label: string }[] = [
  { value: "draft", label: "Brouillon" },
  { value: "pending", label: "En relecture" },
  { value: "scheduled", label: "Programmé" },
  { value: "published", label: "Publié" },
  { value: "archived", label: "Archivé" },
];

export function StatusFields({
  status,
  scheduledAt,
  onChange,
}: {
  status: CmsStatus;
  scheduledAt: string;
  onChange: (patch: { status?: CmsStatus; scheduledAt?: string }) => void;
}) {
  return (
    <div className="admin-form__row">
      <label>
        Statut
        <select value={status} onChange={(e) => onChange({ status: e.target.value as CmsStatus })}>
          {STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      {status === "scheduled" ? (
        <label>
          Publication programmée le *
          <input
            type="datetime-local"
            value={scheduledAt}
            onChange={(e) => onChange({ scheduledAt: e.target.value })}
            required
          />
        </label>
      ) : null}
    </div>
  );
}

// ── Rich text editor (toolbar + contentEditable) ─────────────────────────────

type Command = { cmd: string; value?: string; label: string; title: string };

const INLINE_COMMANDS: Command[] = [
  { cmd: "bold", label: "G", title: "Gras" },
  { cmd: "italic", label: "I", title: "Italique" },
  { cmd: "underline", label: "S", title: "Souligné" },
];

const BLOCK_COMMANDS: Command[] = [
  { cmd: "formatBlock", value: "h2", label: "H2", title: "Titre de section" },
  { cmd: "formatBlock", value: "h3", label: "H3", title: "Sous-titre" },
  { cmd: "formatBlock", value: "p", label: "¶", title: "Paragraphe" },
  { cmd: "formatBlock", value: "blockquote", label: "❝", title: "Citation" },
];

const LIST_COMMANDS: Command[] = [
  { cmd: "insertUnorderedList", label: "• List", title: "Liste à puces" },
  { cmd: "insertOrderedList", label: "1. List", title: "Liste numérotée" },
];

/**
 * Lightweight rich-text editor built on contentEditable + document.execCommand.
 * No dependency, works everywhere, and outputs clean HTML for the CMS body.
 */
export function RichTextEditor({
  value,
  onChange,
  onPickImage,
  minHeight = 280,
}: {
  value: string;
  onChange: (html: string) => void;
  onPickImage?: () => void;
  minHeight?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  // Track whether the change came from user input to avoid cursor jumps.
  const internal = useRef(false);

  useEffect(() => {
    if (ref.current && !internal.current && ref.current.innerHTML !== value) {
      ref.current.innerHTML = value || "";
    }
  }, [value]);

  const exec = (command: Command) => {
    ref.current?.focus();
    document.execCommand(command.cmd, false, command.value);
    if (ref.current) {
      internal.current = true;
      onChange(ref.current.innerHTML);
      internal.current = false;
    }
  };

  const button = (command: Command, index: number) => (
    <button
      key={`${command.cmd}-${command.value ?? ""}-${index}`}
      type="button"
      className="admin-rte__btn"
      title={command.title}
      onMouseDown={(e) => {
        e.preventDefault();
        exec(command);
      }}
    >
      {command.label}
    </button>
  );

  return (
    <div
      className="admin-rte"
      style={{ "--rte-min-height": `${minHeight}px` } as React.CSSProperties}
    >
      <div className="admin-rte__toolbar" role="toolbar" aria-label="Mise en forme">
        {INLINE_COMMANDS.map(button)}
        <span className="admin-rte__sep" />
        {BLOCK_COMMANDS.map(button)}
        <span className="admin-rte__sep" />
        {LIST_COMMANDS.map(button)}
        <span className="admin-rte__sep" />
        <button
          type="button"
          className="admin-rte__btn"
          title="Lien"
          onMouseDown={(e) => {
            e.preventDefault();
            const url = window.prompt("URL du lien :", "https://");
            if (url) exec({ cmd: "createLink", value: url, label: "", title: "" });
          }}
        >
          🔗
        </button>
        <button
          type="button"
          className="admin-rte__btn"
          title="Insérer un tableau"
          onMouseDown={(e) => {
            e.preventDefault();
            exec({
              cmd: "insertHTML",
              value:
                '<table border="1" cellpadding="6" cellspacing="0"><tr><th>Colonne 1</th><th>Colonne 2</th></tr><tr><td>&nbsp;</td><td>&nbsp;</td></tr></table><p></p>',
              label: "",
              title: "",
            });
          }}
        >
          ▦
        </button>
        {onPickImage ? (
          <button
            type="button"
            className="admin-rte__btn"
            title="Insérer une image"
            onMouseDown={(e) => {
              e.preventDefault();
              onPickImage();
            }}
          >
            🖼
          </button>
        ) : null}
        <button
          type="button"
          className="admin-rte__btn"
          title="Supprimer la mise en forme"
          onMouseDown={(e) => {
            e.preventDefault();
            exec({ cmd: "removeFormat", label: "", title: "" });
          }}
        >
          ⌫
        </button>
      </div>
      <div
        ref={ref}
        className="admin-rte__area"
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        aria-multiline="true"
        onInput={() => {
          if (ref.current) {
            internal.current = true;
            onChange(ref.current.innerHTML);
            internal.current = false;
          }
        }}
      />
    </div>
  );
}

// ── Revisions dialog ─────────────────────────────────────────────────────────

export function RevisionsDialog({
  csrf,
  entityType,
  entityId,
  onClose,
  onRestored,
}: {
  csrf: string;
  entityType: "page" | "article";
  entityId: number;
  onClose: () => void;
  onRestored: () => void;
}) {
  const [items, setItems] = useState<CmsRevisionMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<number | null>(null);

  useEffect(() => {
    let alive = true;
    adminApi
      .revisions(csrf, entityType, entityId)
      .then((res) => alive && setItems(res.items))
      .catch(() => undefined)
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [csrf, entityType, entityId]);

  const restore = async (revisionId: number) => {
    if (
      !window.confirm("Restaurer cette version ? L'état actuel sera sauvegardé avant restauration.")
    )
      return;
    setBusy(revisionId);
    try {
      await adminApi.restoreRevision(csrf, revisionId);
      window.alert("Version restaurée. Rechargez l'éditeur pour voir le contenu restauré.");
      onRestored();
      onClose();
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Erreur de restauration.");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div
      className="admin-modal"
      role="dialog"
      aria-modal="true"
      aria-label="Historique des versions"
      onClick={onClose}
    >
      <div className="admin-modal__box" onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal__head">
          <h3>Historique des versions</h3>
          <button
            type="button"
            className="admin-modal__close"
            onClick={onClose}
            aria-label="Fermer"
          >
            ✕
          </button>
        </div>
        {loading ? (
          <Loader2 size={20} className="admin-spin" />
        ) : items.length === 0 ? (
          <p className="admin-hint">
            Aucune version antérieure. Une sauvegarde est créée automatiquement à chaque
            modification.
          </p>
        ) : (
          <div className="admin-list">
            {items.map((rev) => (
              <div key={rev.id} className="admin-row">
                <span className="admin-row__title">#{rev.id}</span>
                <span className="admin-row__meta">{rev.author ?? "—"}</span>
                <span className="admin-row__spacer" />
                <span className="admin-row__meta">
                  {new Date(rev.created_at.replace(" ", "T")).toLocaleString("fr-FR")}
                </span>
                <button
                  type="button"
                  className="admin-btn"
                  disabled={busy === rev.id}
                  onClick={() => restore(rev.id)}
                >
                  <History size={13} /> Restaurer
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
