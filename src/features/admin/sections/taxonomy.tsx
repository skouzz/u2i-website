import { useCallback, useEffect, useState } from "react";
import { Pencil, Plus, Save, Trash2, X } from "lucide-react";

import { adminApi, type CmsCategory, type CmsTag } from "@/lib/cms";
import type { AdminCtx } from "../types";

type CategoryDraft = { id: number | null; name: string; slug: string; description: string };
type TagDraft = { id: number | null; name: string; slug: string };

export function CategoriesSection({ ctx }: { ctx: AdminCtx }) {
  const [items, setItems] = useState<CmsCategory[]>([]);
  const [draft, setDraft] = useState<CategoryDraft | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    adminApi
      .categories(ctx.csrf)
      .then((res) => setItems(res.items))
      .catch((err) => setError(err instanceof Error ? err.message : "Erreur de chargement."));
  }, [ctx.csrf]);

  useEffect(load, [load]);

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!draft) return;
    const payload = {
      name: draft.name,
      slug: draft.slug || undefined,
      description: draft.description,
    };
    try {
      if (draft.id === null) {
        await adminApi.createCategory(ctx.csrf, payload);
        ctx.notify("Catégorie créée.");
      } else {
        await adminApi.updateCategory(ctx.csrf, draft.id, payload);
        ctx.notify("Catégorie mise à jour.");
      }
      setDraft(null);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur d'enregistrement.");
    }
  };

  const remove = async (category: CmsCategory) => {
    if (
      !window.confirm(
        `Supprimer la catégorie « ${category.name} » ? Les articles associés seront sans catégorie.`,
      )
    )
      return;
    try {
      await adminApi.deleteCategory(ctx.csrf, category.id);
      ctx.notify("Catégorie supprimée.");
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur.");
    }
  };

  return (
    <div className="admin-section">
      <div className="admin-section__head">
        <h2>{items.length} catégorie(s)</h2>
        <button
          className="admin-btn admin-btn--primary"
          onClick={() => setDraft({ id: null, name: "", slug: "", description: "" })}
        >
          <Plus size={14} /> Nouvelle catégorie
        </button>
      </div>

      {error ? <p className="admin-alert admin-alert--error">{error}</p> : null}

      {draft ? (
        <form className="admin-form" onSubmit={save}>
          <div className="admin-form__row">
            <label>
              Nom *
              <input
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                required
              />
            </label>
            <label>
              Slug (auto si vide)
              <input
                value={draft.slug}
                onChange={(e) => setDraft({ ...draft, slug: e.target.value })}
                placeholder="auto"
              />
            </label>
          </div>
          <label>
            Description
            <textarea
              value={draft.description}
              onChange={(e) => setDraft({ ...draft, description: e.target.value })}
              rows={2}
            />
          </label>
          <div style={{ display: "flex", gap: 10 }}>
            <button type="submit" className="admin-btn admin-btn--primary">
              <Save size={14} /> Enregistrer
            </button>
            <button type="button" className="admin-btn" onClick={() => setDraft(null)}>
              <X size={14} /> Annuler
            </button>
          </div>
        </form>
      ) : null}

      <div className="admin-list">
        {items.length === 0 ? (
          <p className="admin-hint">
            Aucune catégorie. Elles servent à regrouper les articles sur le site.
          </p>
        ) : (
          items.map((category) => (
            <div key={category.id} className="admin-row">
              <span className="admin-row__title">{category.name}</span>
              <span className="admin-row__meta">/{category.slug}</span>
              <span className="admin-row__meta">{category.article_count ?? 0} article(s)</span>
              <span className="admin-row__spacer" />
              <button
                className="admin-btn"
                onClick={() =>
                  setDraft({
                    id: category.id,
                    name: category.name,
                    slug: category.slug,
                    description: category.description ?? "",
                  })
                }
                title="Modifier"
              >
                <Pencil size={13} />
              </button>
              <button
                className="admin-btn admin-btn--danger"
                onClick={() => remove(category)}
                title="Supprimer"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export function TagsSection({ ctx }: { ctx: AdminCtx }) {
  const [items, setItems] = useState<CmsTag[]>([]);
  const [draft, setDraft] = useState<TagDraft | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    adminApi
      .tags(ctx.csrf)
      .then((res) => setItems(res.items))
      .catch((err) => setError(err instanceof Error ? err.message : "Erreur de chargement."));
  }, [ctx.csrf]);

  useEffect(load, [load]);

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!draft) return;
    const payload = { name: draft.name, slug: draft.slug || undefined };
    try {
      if (draft.id === null) {
        await adminApi.createTag(ctx.csrf, payload);
        ctx.notify("Tag créé.");
      } else {
        await adminApi.updateTag(ctx.csrf, draft.id, payload);
        ctx.notify("Tag mis à jour.");
      }
      setDraft(null);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur d'enregistrement.");
    }
  };

  const remove = async (tag: CmsTag) => {
    if (!window.confirm(`Supprimer le tag « ${tag.name} » ?`)) return;
    try {
      await adminApi.deleteTag(ctx.csrf, tag.id);
      ctx.notify("Tag supprimé.");
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur.");
    }
  };

  return (
    <div className="admin-section">
      <div className="admin-section__head">
        <h2>{items.length} tag(s)</h2>
        <button
          className="admin-btn admin-btn--primary"
          onClick={() => setDraft({ id: null, name: "", slug: "" })}
        >
          <Plus size={14} /> Nouveau tag
        </button>
      </div>

      {error ? <p className="admin-alert admin-alert--error">{error}</p> : null}

      {draft ? (
        <form className="admin-form" onSubmit={save} style={{ maxWidth: 520 }}>
          <label>
            Nom *
            <input
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              required
            />
          </label>
          <label>
            Slug (auto si vide)
            <input
              value={draft.slug}
              onChange={(e) => setDraft({ ...draft, slug: e.target.value })}
              placeholder="auto"
            />
          </label>
          <div style={{ display: "flex", gap: 10 }}>
            <button type="submit" className="admin-btn admin-btn--primary">
              <Save size={14} /> Enregistrer
            </button>
            <button type="button" className="admin-btn" onClick={() => setDraft(null)}>
              <X size={14} /> Annuler
            </button>
          </div>
        </form>
      ) : null}

      <div className="admin-chips">
        {items.length === 0 ? (
          <p className="admin-hint">
            Aucun tag. Les tags s'attachent aux articles depuis l'éditeur d'article.
          </p>
        ) : (
          items.map((tag) => (
            <span
              key={tag.id}
              className="admin-chip"
              title={`${tag.article_count ?? 0} article(s)`}
            >
              {tag.name}
              <button
                type="button"
                onClick={() => setDraft({ id: tag.id, name: tag.name, slug: tag.slug })}
                title="Modifier"
              >
                <Pencil size={11} />
              </button>
              <button type="button" onClick={() => remove(tag)} title="Supprimer">
                <Trash2 size={11} />
              </button>
            </span>
          ))
        )}
      </div>
    </div>
  );
}
