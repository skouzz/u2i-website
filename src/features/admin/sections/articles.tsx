import { useCallback, useEffect, useMemo, useState } from "react";
import { Copy, Eye, EyeOff, History, Pencil, Plus, Save, Trash2 } from "lucide-react";

import {
  adminApi,
  type AdminArticlePayload,
  type CmsArticle,
  type CmsCategory,
  type CmsSeo,
  type CmsStatus,
  type CmsTag,
} from "@/lib/cms";
import type { AdminCtx } from "../types";
import { MediaPicker } from "../components/media-picker";
import {
  RevisionsDialog,
  RichTextEditor,
  SeoFields,
  StatusFields,
} from "../components/editor-fields";

export function ArticlesSection({ ctx }: { ctx: AdminCtx }) {
  const [articles, setArticles] = useState<CmsArticle[]>([]);
  const [editing, setEditing] = useState<CmsArticle | null>(null);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | CmsStatus>("all");
  const [revisionsFor, setRevisionsFor] = useState<CmsArticle | null>(null);

  const load = useCallback(() => {
    adminApi
      .articles(ctx.csrf)
      .then((res) => setArticles(res.items))
      .catch((err) => setError(err instanceof Error ? err.message : "Erreur de chargement."));
  }, [ctx.csrf]);

  useEffect(load, [load]);

  const filtered = useMemo(() => {
    return articles.filter((article) => {
      if (
        search &&
        !`${article.title} ${article.slug}`.toLowerCase().includes(search.toLowerCase())
      ) {
        return false;
      }
      if (statusFilter !== "all" && (article.status ?? "draft") !== statusFilter) {
        return false;
      }
      return true;
    });
  }, [articles, search, statusFilter]);

  const togglePublish = async (article: CmsArticle) => {
    try {
      await adminApi.publishArticle(ctx.csrf, article.id, !article.isPublished);
      ctx.notify(
        article.isPublished ? "Article dépublié." : "Article publié ! Visible sur /actualites.",
      );
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur.");
    }
  };

  const duplicate = async (article: CmsArticle) => {
    try {
      await adminApi.duplicateArticle(ctx.csrf, article.id);
      ctx.notify("Article dupliqué en brouillon.");
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur.");
    }
  };

  const handleDelete = async (article: CmsArticle) => {
    if (
      !window.confirm(
        `Supprimer l'article « ${article.title} » ? Une sauvegarde est créée automatiquement.`,
      )
    )
      return;
    try {
      await adminApi.deleteArticle(ctx.csrf, article.id);
      ctx.notify("Article supprimé.");
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de suppression.");
    }
  };

  return (
    <div className="admin-section">
      <div className="admin-section__head">
        <h2>{filtered.length} article(s)</h2>
        <div className="admin-toolbar">
          <input
            className="admin-search"
            placeholder="Rechercher…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
          >
            <option value="all">Tous les statuts</option>
            <option value="draft">Brouillons</option>
            <option value="pending">En relecture</option>
            <option value="scheduled">Programmés</option>
            <option value="published">Publiés</option>
            <option value="archived">Archivés</option>
          </select>
          <button className="admin-btn admin-btn--primary" onClick={() => setCreating(true)}>
            <Plus size={14} /> Nouvel article
          </button>
        </div>
      </div>

      {error ? <p className="admin-alert admin-alert--error">{error}</p> : null}

      {creating || editing ? (
        <ArticleForm
          ctx={ctx}
          article={editing}
          onDone={() => {
            setCreating(false);
            setEditing(null);
            load();
          }}
          onCancel={() => {
            setCreating(false);
            setEditing(null);
          }}
        />
      ) : (
        <div className="admin-list">
          {filtered.length === 0 ? (
            <p className="admin-hint">
              Aucun article. Cliquez « Nouvel article », écrivez le titre et le texte, choisissez
              une image de couverture, puis définissez le statut.
            </p>
          ) : null}
          {filtered.map((article) => (
            <div key={article.id} className="admin-row">
              <span className="admin-row__title">{article.title}</span>
              <span className="admin-row__meta">/actualites/{article.slug}</span>
              <span className={`admin-badge admin-badge--${article.status ?? "draft"}`}>
                {article.status === "published"
                  ? "Publié"
                  : article.status === "scheduled"
                    ? "Programmé"
                    : article.status === "pending"
                      ? "Relecture"
                      : article.status === "archived"
                        ? "Archivé"
                        : "Brouillon"}
              </span>
              <span className="admin-row__spacer" />
              <button
                className={`admin-btn ${article.isPublished ? "" : "admin-btn--primary"}`}
                onClick={() => togglePublish(article)}
                title={article.isPublished ? "Dépublier" : "Publier"}
              >
                {article.isPublished ? <Eye size={13} /> : <EyeOff size={13} />}
                {article.isPublished ? "Publié" : "Brouillon"}
              </button>
              <a
                className="admin-btn"
                href={`/actualites/${article.slug}`}
                target="_blank"
                rel="noreferrer"
              >
                Voir
              </a>
              <button className="admin-btn" onClick={() => setEditing(article)} title="Modifier">
                <Pencil size={13} />
              </button>
              <button className="admin-btn" onClick={() => duplicate(article)} title="Dupliquer">
                <Copy size={13} />
              </button>
              <button
                className="admin-btn"
                onClick={() => setRevisionsFor(article)}
                title="Historique"
              >
                <History size={13} />
              </button>
              <button
                className="admin-btn admin-btn--danger"
                onClick={() => handleDelete(article)}
                title="Supprimer"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      )}

      {revisionsFor ? (
        <RevisionsDialog
          csrf={ctx.csrf}
          entityType="article"
          entityId={revisionsFor.id}
          onClose={() => setRevisionsFor(null)}
          onRestored={load}
        />
      ) : null}
    </div>
  );
}

function ArticleForm({
  ctx,
  article,
  onDone,
  onCancel,
}: {
  ctx: AdminCtx;
  article: CmsArticle | null;
  onDone: () => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(article?.title ?? "");
  const [slug, setSlug] = useState(article?.slug ?? "");
  const [excerpt, setExcerpt] = useState(article?.excerpt ?? "");
  const [body, setBody] = useState(article?.body ?? "");
  const [coverImageUrl, setCoverImageUrl] = useState(article?.coverImageUrl ?? "");
  const [author, setAuthor] = useState(article?.author ?? "");
  const [categoryId, setCategoryId] = useState(String(article?.categoryId ?? ""));
  const [tagIds, setTagIds] = useState<number[]>(article?.tagIds ?? []);
  const [status, setStatus] = useState<CmsStatus>(article?.status ?? "draft");
  const [scheduledAt, setScheduledAt] = useState((article?.scheduledAt ?? "").slice(0, 16));
  const [seo, setSeo] = useState<CmsSeo>(article?.seo ?? {});
  const [categories, setCategories] = useState<CmsCategory[]>([]);
  const [tags, setTags] = useState<CmsTag[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(article !== null);

  useEffect(() => {
    adminApi
      .categories(ctx.csrf)
      .then((res) => setCategories(res.items))
      .catch(() => undefined);
    adminApi
      .tags(ctx.csrf)
      .then((res) => setTags(res.items))
      .catch(() => undefined);
  }, [ctx.csrf]);

  useEffect(() => {
    if (article === null || loaded) return;
    setLoaded(true);
    adminApi
      .article(ctx.csrf, article.id)
      .then((res) => {
        const a = res.article;
        setSlug(a.slug);
        setExcerpt(a.excerpt ?? "");
        setBody(a.body ?? "");
        setCoverImageUrl(a.coverImageUrl ?? "");
        setAuthor(a.author ?? "");
        setCategoryId(String(a.categoryId ?? ""));
        setTagIds(a.tagIds ?? []);
        setStatus((a.status as CmsStatus) ?? "draft");
        setScheduledAt((a.scheduledAt ?? "").slice(0, 16));
        setSeo(a.seo ?? {});
      })
      .catch(() => undefined);
  }, [article, loaded, ctx.csrf]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(null);

    const payload: AdminArticlePayload = {
      title,
      slug: slug || undefined,
      excerpt,
      body,
      coverImageUrl,
      author,
      categoryId: categoryId ? Number(categoryId) : null,
      tagIds,
      status,
      scheduledAt: status === "scheduled" ? scheduledAt : undefined,
      seo,
    };

    try {
      if (article === null) {
        await adminApi.createArticle(ctx.csrf, payload);
        ctx.notify(status === "published" ? "Article créé et publié !" : "Article créé.");
      } else {
        await adminApi.updateArticle(ctx.csrf, article.id, payload);
        ctx.notify("Article enregistré.");
      }
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur d'enregistrement.");
    } finally {
      setBusy(false);
    }
  };

  const toggleTag = (tagId: number) => {
    setTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId],
    );
  };

  return (
    <form className="admin-form" onSubmit={submit}>
      <div className="admin-form__row">
        <label>
          Titre *
          <input value={title} onChange={(e) => setTitle(e.target.value)} required />
        </label>
        <label>
          Adresse (slug)
          <input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="auto" />
        </label>
        <label>
          Auteur
          <input value={author} onChange={(e) => setAuthor(e.target.value)} />
        </label>
      </div>

      <div className="admin-form__row">
        <label>
          Image de couverture
          <div className="admin-form__inline">
            <input
              value={coverImageUrl}
              onChange={(e) => setCoverImageUrl(e.target.value)}
              placeholder="/api/uploads/…"
            />
            <button type="button" className="admin-btn" onClick={() => setPickerOpen(true)}>
              Choisir…
            </button>
          </div>
        </label>
      </div>

      <div className="admin-form__row">
        <label>
          Catégorie
          <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            <option value="">— Aucune —</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </label>
        <div className="admin-form__field">
          <span className="admin-form__label">Tags</span>
          <div className="admin-chips">
            {tags.length === 0 ? (
              <span className="admin-hint">Aucun tag — créez-en dans la section Tags.</span>
            ) : (
              tags.map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  className={`admin-chip ${tagIds.includes(tag.id) ? "admin-chip--active" : ""}`}
                  onClick={() => toggleTag(tag.id)}
                >
                  {tag.name}
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      <StatusFields
        status={status}
        scheduledAt={scheduledAt}
        onChange={(patch) => {
          if (patch.status !== undefined) setStatus(patch.status);
          if (patch.scheduledAt !== undefined) setScheduledAt(patch.scheduledAt);
        }}
      />

      <label>
        Résumé (affiché dans la liste)
        <textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)} rows={3} />
      </label>

      <div className="admin-form__field">
        <span className="admin-form__label">Contenu de l'article</span>
        <RichTextEditor value={body} onChange={setBody} onPickImage={() => setPickerOpen(true)} />
        <span className="admin-hint">
          Utilisez 🖼 pour insérer une image de la médiathèque directement dans le texte.
        </span>
      </div>

      <SeoFields seo={seo} onChange={setSeo} />

      {error ? <p className="admin-alert admin-alert--error">{error}</p> : null}

      <div style={{ display: "flex", gap: 10 }}>
        <button type="submit" className="admin-btn admin-btn--primary" disabled={busy}>
          <Save size={14} /> {busy ? "Enregistrement…" : "Enregistrer"}
        </button>
        <button type="button" className="admin-btn" onClick={onCancel}>
          Annuler
        </button>
      </div>

      <MediaPicker
        csrf={ctx.csrf}
        open={pickerOpen}
        title="Choisir une image"
        onSelect={(url) => {
          // Insert at the end of the body via the editor; also usable for the cover.
          setCoverImageUrl((current) => current || url);
          setBody((current) => `${current}<p><img src="${url}" alt="" loading="lazy" /></p>`);
        }}
        onClose={() => setPickerOpen(false)}
      />
    </form>
  );
}
