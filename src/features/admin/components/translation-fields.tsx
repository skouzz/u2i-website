import { AlertTriangle, Languages } from "lucide-react";

/** One editable English field paired with its French source. */
export type TranslationField = {
  /** Key used in the i18n_json blob, and the French field's identity. */
  key: string;
  /** French label shown above both inputs. */
  label: string;
  /** Current French value — shown read-only as the reference. */
  source: string;
  /** Current English value. */
  value: string;
  multiline?: boolean;
  /** Marks fields that should be translated for SEO/clarity. */
  required?: boolean;
};

type Props = {
  fields: TranslationField[];
  /** Persist the whole English overlay for the entity. */
  onChange: (i18n: Record<string, Record<string, string>>) => void;
  /** Optional English slug editor, shown above the fields. */
  slugEn?: { value: string; onChange: (v: string) => void; frenchSlug: string } | null;
  /** Keys still untranslated, from the server-side coverage report. */
  missing?: string[];
};

/**
 * English translation panel for a page or article.
 *
 * The French fields stay the source of truth and are shown read-only next to
 * each English input, so an editor always sees what they are translating. Empty
 * English fields are simply not sent — the public API then falls back to
 * French, which is what the untranslated badge counts.
 */
export function TranslationFields({ fields, onChange, slugEn, missing = [] }: Props) {
  const setField = (key: string, value: string) => {
    const next: Record<string, Record<string, string>> = { en: {} };
    for (const f of fields) {
      const v = f.key === key ? value : f.value;
      if (v.trim() !== "") next.en[f.key] = v;
    }
    onChange(next);
  };

  return (
    <fieldset className="admin-form" style={{ gap: 14 }}>
      <legend
        style={{
          fontSize: 11,
          fontWeight: 800,
          textTransform: "uppercase",
          color: "#414849",
          padding: "0 6px",
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        <Languages size={13} /> English version
      </legend>

      <p className="admin-hint" style={{ margin: 0 }}>
        Leave a field empty to keep the French text on the English page. Untranslated pages still
        appear under /en — they simply show their French content.
      </p>

      {slugEn ? (
        <label>
          English URL (slug)
          <input
            value={slugEn.value}
            onChange={(e) => slugEn.onChange(e.target.value)}
            placeholder={slugEn.frenchSlug || "my-page-slug"}
          />
          <span className="admin-hint">
            /en/p/{slugEn.value || slugEn.frenchSlug}
            {!slugEn.value && " — falls back to the French slug"}
          </span>
        </label>
      ) : null}

      {fields.map((field) => {
        const isMissing = missing.includes(field.key) && field.value.trim() === "";
        return (
          <div
            key={field.key}
            style={{
              border: "1px solid #e5e7eb",
              borderRadius: 10,
              padding: 12,
              display: "grid",
              gap: 8,
              background: isMissing ? "#fffbeb" : "#fff",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: 12,
                fontWeight: 700,
                color: "#414849",
              }}
            >
              {field.label}
              {isMissing ? (
                <span
                  title={`${field.label} is not translated yet`}
                  style={{ display: "inline-flex", alignItems: "center", gap: 3, color: "#b45309" }}
                >
                  <AlertTriangle size={12} /> not translated
                </span>
              ) : null}
            </div>

            <div style={{ display: "grid", gap: 6 }}>
              <span style={{ fontSize: 11, color: "#9ca3af", fontWeight: 600 }}>FR (source)</span>
              <div
                style={{
                  fontSize: 13,
                  color: "#6b7280",
                  background: "#f9fafb",
                  border: "1px solid #f3f4f6",
                  borderRadius: 6,
                  padding: "7px 9px",
                  whiteSpace: "pre-wrap",
                  maxHeight: 90,
                  overflow: "auto",
                }}
              >
                {field.source || <em style={{ color: "#9ca3af" }}>—</em>}
              </div>
            </div>

            <div style={{ display: "grid", gap: 6 }}>
              <span style={{ fontSize: 11, color: "#e0141c", fontWeight: 700 }}>EN</span>
              {field.multiline ? (
                <textarea
                  value={field.value}
                  onChange={(e) => setField(field.key, e.target.value)}
                  placeholder={`English ${field.label.toLowerCase()}…`}
                  rows={field.key === "body" ? 10 : 3}
                />
              ) : (
                <input
                  value={field.value}
                  onChange={(e) => setField(field.key, e.target.value)}
                  placeholder={`English ${field.label.toLowerCase()}…`}
                />
              )}
            </div>
          </div>
        );
      })}
    </fieldset>
  );
}

/** Small inline badge listing an entity's translation state. */
export function TranslationBadge({
  isTranslated,
  missing = [],
}: {
  isTranslated?: boolean;
  missing?: string[];
}) {
  if (isTranslated && missing.length === 0) {
    return (
      <span className="admin-badge admin-badge--ok" title="Fully translated into English">
        EN
      </span>
    );
  }
  if (isTranslated) {
    return (
      <span
        className="admin-badge admin-badge--warn"
        title={`English version is partial — missing: ${missing.join(", ")}`}
      >
        <AlertTriangle size={11} /> EN partial
      </span>
    );
  }
  return (
    <span
      className="admin-badge admin-badge--muted"
      title="No English version yet — the French text is shown under /en"
    >
      FR only
    </span>
  );
}
