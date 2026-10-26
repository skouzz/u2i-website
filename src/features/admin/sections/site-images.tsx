import { useCallback, useEffect, useState } from "react";
import { Eye, EyeOff, Plus, Save, Trash2, Upload } from "lucide-react";

import { adminApi, type CmsSiteImage, type CmsSiteImagePayload } from "@/lib/cms";
import type { AdminCtx } from "../types";
import { MediaPicker } from "../components/media-picker";

/** Sections where images can be managed. */
const SECTIONS = [
  { value: "hero_slides", label: "Hero slides (page d'accueil)" },
  { value: "sectors", label: "Secteurs (cartes page d'accueil)" },
  { value: "equipments", label: "Équipements (cartes page d'accueil)" },
  { value: "partners", label: "Partenaires (logo marquee)" },
  { value: "certifications", label: "Certifications (grille homepage)" },
  { value: "sector_gallery", label: "Galerie secteurs (/secteurs)" },
  { value: "equipment_gallery", label: "Galerie équipements (/équipements)" },
] as const;

export function SiteImagesSection({ ctx }: { ctx: AdminCtx }) {
  const [items, setItems] = useState<CmsSiteImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<string>("hero_slides");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [editingKey, setEditingKey] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    adminApi
      .siteImages(ctx.csrf, activeSection)
      .then((res) => setItems(res.items))
      .catch((err) => setError(err instanceof Error ? err.message : "Erreur de chargement."))
      .finally(() => setLoading(false));
  }, [ctx.csrf, activeSection]);

  useEffect(load, [load]);

  const currentSection = SECTIONS.find((s) => s.value === activeSection);

  const update = (keyName: string, patch: Partial<CmsSiteImage>) => {
    setItems((prev) =>
      prev.map((item) => (item.keyName === keyName ? { ...item, ...patch } : item))
    );
  };

  const add = () => {
    const keyName = `new_${Date.now()}`;
    setItems((prev) => [
      ...prev,
      {
        id: 0,
        section: activeSection,
        keyName,
        imageUrl: "",
        altText: "",
        sortOrder: prev.length,
        isVisible: true,
      },
    ]);
    setEditingKey(keyName);
  };

  const remove = (keyName: string) => {
    if (!window.confirm("Supprimer cette image ?")) return;
    setItems((prev) => prev.filter((item) => item.keyName !== keyName));
  };

  const save = async () => {
    setBusy(true);
    setError(null);
    try {
      const payload: CmsSiteImagePayload[] = items.map((item) => ({
        section: item.section,
        keyName: item.keyName,
        imageUrl: item.imageUrl,
        altText: item.altText,
        sortOrder: item.sortOrder,
        isVisible: item.isVisible ?? true,
      }));
      await adminApi.saveSiteImages(ctx.csrf, payload);
      ctx.notify("Images enregistrées.");
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
        <p className="admin-hint">Chargement des images…</p>
      </div>
    );
  }

  return (
    <div className="admin-section">
      <div className="admin-section__head">
        <h2>Gérer les images</h2>
        <button className="admin-btn admin-btn--primary" onClick={save} disabled={busy}>
          <Save size={14} /> {busy ? "Enregistrement…" : "Enregistrer"}
        </button>
      </div>

      <p className="admin-hint">
        Choisissez une section pour voir et modifier ses images. Les images sont stockées dans
        la médiathèque et organisées par section et clé.
      </p>

      {/* Section selector */}
      <div className="admin-form" style={{ gap: 8, marginBottom: 16 }}>
        <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          Section
          <select
            value={activeSection}
            onChange={(e) => {
              setActiveSection(e.target.value);
              setEditingKey(null);
            }}
          >
            {SECTIONS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {error ? <p className="admin-alert admin-alert--error">{error}</p> : null}

      {/* Add button */}
      <div className="admin-form" style={{ gap: 10, background: "#fff", borderRadius: 10, padding: 14, marginBottom: 16 }}>
        <button type="button" className="admin-btn admin-btn--primary" onClick={add}>
          <Plus size={14} /> Ajouter une image
        </button>
        <MediaPicker
          csrf={ctx.csrf}
          open={pickerOpen}
          title={`Image — ${currentSection?.label ?? activeSection}`}
          onSelect={(url) => {
            setItems((prev) =>
              prev.map((item) =>
                item.keyName === editingKey ? { ...item, imageUrl: url } : item
              )
            );
            setPickerOpen(false);
          }}
          onClose={() => setPickerOpen(false)}
        />
      </div>

      {/* Image list */}
      {items.length === 0 ? (
        <div className="admin-form" style={{ gap: 10, background: "#fff", borderRadius: 10, padding: 24, textAlign: "center" }}>
          <p className="admin-hint">
            Aucune image dans cette section. Cliquez sur « Ajouter une image » pour commencer.
          </p>
        </div>
      ) : (
        <div className="admin-form" style={{ gap: 12, background: "#fff", borderRadius: 10, padding: 14 }}>
          {items.map((item) => (
            <ImageRow
              key={item.keyName}
              ctx={ctx}
              item={item}
              isActive={item.keyName === editingKey}
              onUpdate={(patch) => update(item.keyName, patch)}
              onRemove={() => remove(item.keyName)}
              onSelectImage={() => {
                setEditingKey(item.keyName);
                setPickerOpen(true);
              }}
            />
          ))}
        </div>
      )}

      <div style={{ position: "sticky", bottom: 0, background: "#f7f8f6", padding: "10px 0" }}>
        <button className="admin-btn admin-btn--primary" onClick={save} disabled={busy}>
          <Save size={14} /> {busy ? "Enregistrement…" : "Enregistrer"}
        </button>
      </div>
    </div>
  );
}

function ImageRow({
  ctx,
  item,
  isActive,
  onUpdate,
  onRemove,
  onSelectImage,
}: {
  ctx: AdminCtx;
  item: CmsSiteImage;
  isActive: boolean;
  onUpdate: (patch: Partial<CmsSiteImage>) => void;
  onRemove: () => void;
  onSelectImage: () => void;
}) {
  return (
    <div
      className="admin-form"
      style={{
        gap: 12,
        background: isActive ? "#fff8f8" : "#f7f8f6",
        border: `1px solid ${isActive ? "#e0141c" : "#e4e7e4"}`,
        borderRadius: 10,
        padding: 12,
      }}
    >
      {/* Preview + actions */}
      <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.altText ?? ""}
            style={{
              width: 80,
              height: 60,
              objectFit: "cover",
              borderRadius: 6,
              flexShrink: 0,
            }}
          />
        ) : (
          <div
            style={{
              width: 80,
              height: 60,
              borderRadius: 6,
              background: "#e4e7e4",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Upload size={20} style={{ opacity: 0.4 }} />
          </div>
        )}

        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontWeight: 600, fontSize: 13 }}>{item.keyName}</span>
            <button
              type="button"
              className="admin-btn"
              title={item.isVisible ? "Visible" : "Masquée"}
              onClick={() => onUpdate({ isVisible: !item.isVisible })}
            >
              {item.isVisible ? <Eye size={13} /> : <EyeOff size={13} />}
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

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <label style={{ flex: 1, minWidth: 150 }}>
              Clé (identifiant)
              <input
                value={item.keyName}
                onChange={(e) => onUpdate({ keyName: e.target.value })}
                style={{ fontSize: 12 }}
              />
            </label>
            <label style={{ flex: 1, minWidth: 150 }}>
              Texte alternatif (SEO)
              <input
                value={item.altText ?? ""}
                onChange={(e) => onUpdate({ altText: e.target.value })}
                placeholder="Description de l'image"
                style={{ fontSize: 12 }}
              />
            </label>
            <label>
              URL de l'image
              <div style={{ display: "flex", gap: 4 }}>
                <input
                  value={item.imageUrl ?? ""}
                  onChange={(e) => onUpdate({ imageUrl: e.target.value })}
                  placeholder="/api/uploads/…"
                  style={{ fontSize: 11 }}
                />
                <button type="button" className="admin-btn" onClick={onSelectImage}>
                  Choisir…
                </button>
              </div>
            </label>
          </div>
        </div>
      </div>

      <MediaPicker
        csrf={ctx.csrf}
        open={false}
        title="Choisir une image"
        onSelect={(url) => onUpdate({ imageUrl: url })}
        onClose={() => {}}
      />
    </div>
  );
}
