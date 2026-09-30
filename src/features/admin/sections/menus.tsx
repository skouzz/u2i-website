import { useCallback, useEffect, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Copy,
  ExternalLink,
  Eye,
  EyeOff,
  Plus,
  Save,
  Trash2,
} from "lucide-react";

import { adminApi, type CmsMenuItem, type CmsPage } from "@/lib/cms";
import type { AdminCtx } from "../types";

type EditorItem = {
  clientId: string;
  parentId: string | null;
  label: string;
  url: string;
  isEnabled: boolean;
  opensNewTab: boolean;
};

let clientIdSeq = 0;
const nextClientId = () => `c${Date.now()}-${clientIdSeq++}`;

export function MenusSection({ ctx }: { ctx: AdminCtx }) {
  const [menus, setMenus] = useState<
    { id: number; location: string; label: string; items: CmsMenuItem[] }[]
  >([]);
  const [activeMenuId, setActiveMenuId] = useState<number | null>(null);
  const [items, setItems] = useState<EditorItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [newMenuLabel, setNewMenuLabel] = useState("");
  const [pages, setPages] = useState<CmsPage[]>([]);

  const load = useCallback(async () => {
    try {
      const res = await adminApi.menus(ctx.csrf);
      setMenus(res.items);
      setActiveMenuId((current) => current ?? res.items[0]?.id ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de chargement.");
    }
  }, [ctx.csrf]);

  useEffect(() => {
    load();
    adminApi
      .pages(ctx.csrf)
      .then((res) => setPages(res.items))
      .catch(() => undefined);
  }, [load, ctx.csrf]);

  // Load items of the selected menu into the editor.
  useEffect(() => {
    const menu = menus.find((m) => m.id === activeMenuId);
    if (!menu) {
      setItems([]);
      return;
    }
    setItems(
      menu.items.map((item) => ({
        clientId: String(item.id ?? nextClientId()),
        parentId: item.parentId ? String(item.parentId) : null,
        label: item.label ?? "",
        url: item.url ?? "/",
        isEnabled: item.isEnabled !== undefined ? Boolean(item.isEnabled) : true,
        opensNewTab: Boolean(item.opensNewTab ?? false),
      })),
    );
  }, [menus, activeMenuId]);

  const activeMenu = menus.find((m) => m.id === activeMenuId);

  const update = (clientId: string, patch: Partial<EditorItem>) => {
    setItems((prev) =>
      prev.map((item) => (item.clientId === clientId ? { ...item, ...patch } : item)),
    );
  };

  const move = (index: number, delta: number) => {
    setItems((prev) => {
      const next = [...prev];
      [next[index], next[index + delta]] = [next[index + delta], next[index]];
      return next;
    });
  };

  const addItem = (parentId: string | null = null) => {
    setItems((prev) => [
      ...prev,
      {
        clientId: nextClientId(),
        parentId,
        label: "",
        url: "/",
        isEnabled: true,
        opensNewTab: false,
      },
    ]);
  };

  const addPage = (slug: string, label: string) => {
    if (!slug) return;
    setItems((prev) => [
      ...prev,
      {
        clientId: nextClientId(),
        parentId: null,
        label,
        url: `/p/${slug}`,
        isEnabled: true,
        opensNewTab: false,
      },
    ]);
  };

  const save = async () => {
    if (!activeMenuId) return;
    setBusy(true);
    setError(null);
    try {
      // Persist child references via their clientId so the backend can map
      // them to real database ids after insertion.
      await adminApi.saveMenu(
        ctx.csrf,
        activeMenuId,
        items.map((item, index) => ({
          clientId: item.clientId,
          parentId: item.parentId,
          label: item.label,
          url: item.url,
          isEnabled: item.isEnabled,
          opensNewTab: item.opensNewTab,
          sort_order: index,
        })),
      );
      ctx.notify("Menu enregistré — le site est mis à jour immédiatement.");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur d'enregistrement.");
    } finally {
      setBusy(false);
    }
  };

  const createMenu = async () => {
    if (!newMenuLabel.trim()) return;
    try {
      await adminApi.createMenu(ctx.csrf, newMenuLabel.trim());
      setNewMenuLabel("");
      ctx.notify("Menu créé.");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur.");
    }
  };

  const deleteMenu = async (menu: { id: number; label: string }) => {
    if (
      !window.confirm(`Supprimer le menu « ${menu.label} » ? Tous ses éléments seront supprimés.`)
    )
      return;
    try {
      await adminApi.deleteMenu(ctx.csrf, menu.id);
      setActiveMenuId(null);
      ctx.notify("Menu supprimé.");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur.");
    }
  };

  return (
    <div className="admin-section">
      <div className="admin-section__head">
        <h2>Gestion des menus</h2>
        <div className="admin-toolbar">
          <input
            className="admin-search"
            placeholder="Nom du nouveau menu…"
            value={newMenuLabel}
            onChange={(e) => setNewMenuLabel(e.target.value)}
          />
          <button className="admin-btn" onClick={createMenu}>
            <Plus size={14} /> Créer un menu
          </button>
        </div>
      </div>

      {error ? <p className="admin-alert admin-alert--error">{error}</p> : null}

      <div className="admin-form__row">
        <label>
          Menu à éditer
          <select
            value={activeMenuId ?? ""}
            onChange={(e) => setActiveMenuId(Number(e.target.value))}
          >
            {menus.map((menu) => (
              <option key={menu.id} value={menu.id}>
                {menu.label} ({menu.location}) — {menu.items.length} élément(s)
              </option>
            ))}
          </select>
        </label>
        {activeMenu ? (
          <button
            className="admin-btn admin-btn--danger"
            onClick={() => deleteMenu(activeMenu)}
            style={{ alignSelf: "end" }}
          >
            <Trash2 size={13} /> Supprimer ce menu
          </button>
        ) : null}
      </div>

      {activeMenu ? (
        <>
          <p className="admin-hint">
            Le <strong>menu principal</strong> alimente la barre de navigation du site ; les
            éléments indentés (avec parent) deviennent des sous-menus déroulants. Glissez un élément
            sous un autre en définissant son parent.
          </p>

          <div className="admin-list">
            {items
              .filter((item) => item.parentId === null)
              .map((item) => {
                const index = items.indexOf(item);
                const children = items.filter((child) => child.parentId === item.clientId);
                return (
                  <div key={item.clientId} className="admin-menu-branch">
                    <MenuRow
                      item={item}
                      depth={0}
                      index={index}
                      total={items.length}
                      onMove={move}
                      onUpdate={update}
                      onRemove={() =>
                        setItems((prev) =>
                          prev.filter((i) => i !== item && i.parentId !== item.clientId),
                        )
                      }
                    />
                    {children.map((child) => {
                      const childIndex = items.indexOf(child);
                      return (
                        <MenuRow
                          key={child.clientId}
                          item={child}
                          depth={1}
                          index={childIndex}
                          total={items.length}
                          onMove={move}
                          onUpdate={update}
                          onRemove={() => setItems((prev) => prev.filter((i) => i !== child))}
                        />
                      );
                    })}
                    <button
                      type="button"
                      className="admin-btn"
                      style={{ margin: "4px 0 10px 34px" }}
                      onClick={() => addItem(item.clientId)}
                    >
                      <Plus size={12} /> Sous-élément
                    </button>
                  </div>
                );
              })}
          </div>

          <div className="admin-toolbar">
            <button className="admin-btn" onClick={() => addItem(null)}>
              <Plus size={14} /> Ajouter un élément
            </button>
            <select
              value=""
              onChange={(e) => {
                const page = pages.find((p) => String(p.id) === e.target.value);
                if (page) addPage(page.slug, page.navLabel ?? page.title);
              }}
            >
              <option value="">Ajouter une page du site…</option>
              {pages.map((page) => (
                <option key={page.id} value={page.id}>
                  {page.title} (/p/{page.slug})
                </option>
              ))}
            </select>
            <button className="admin-btn admin-btn--primary" onClick={save} disabled={busy}>
              <Save size={14} /> {busy ? "Enregistrement…" : "Enregistrer le menu"}
            </button>
          </div>
        </>
      ) : (
        <p className="admin-hint">Créez un menu pour commencer.</p>
      )}
    </div>
  );
}

function MenuRow({
  item,
  depth,
  index,
  total,
  onMove,
  onUpdate,
  onRemove,
}: {
  item: EditorItem;
  depth: number;
  index: number;
  total: number;
  onMove: (index: number, delta: number) => void;
  onUpdate: (clientId: string, patch: Partial<EditorItem>) => void;
  onRemove: () => void;
}) {
  return (
    <div className="admin-row" style={{ marginLeft: depth * 28 }}>
      <div className="admin-row__order">
        <button
          type="button"
          title="Monter"
          onClick={() => onMove(index, -1)}
          disabled={index === 0}
        >
          <ArrowUp size={13} />
        </button>
        <button
          type="button"
          title="Descendre"
          onClick={() => onMove(index, 1)}
          disabled={index === total - 1}
        >
          <ArrowDown size={13} />
        </button>
      </div>
      <input
        value={item.label}
        onChange={(e) => onUpdate(item.clientId, { label: e.target.value })}
        placeholder="Libellé"
        style={{ width: 150 }}
      />
      <input
        value={item.url}
        onChange={(e) => onUpdate(item.clientId, { url: e.target.value })}
        placeholder="/chemin ou https://…"
        style={{ flex: 1, minWidth: 160 }}
      />
      <button
        type="button"
        className="admin-btn"
        title={item.isEnabled ? "Visible" : "Masqué"}
        onClick={() => onUpdate(item.clientId, { isEnabled: !item.isEnabled })}
      >
        {item.isEnabled ? <Eye size={13} /> : <EyeOff size={13} />}
      </button>
      <button
        type="button"
        className={`admin-btn ${item.opensNewTab ? "admin-btn--primary" : ""}`}
        title="Ouvrir dans un nouvel onglet"
        onClick={() => onUpdate(item.clientId, { opensNewTab: !item.opensNewTab })}
      >
        <ExternalLink size={13} />
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
  );
}

// Copy icon kept for future drag & drop enhancement.
void Copy;
