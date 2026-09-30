import { useCallback, useEffect, useState } from "react";
import { Eye, EyeOff, Pencil, Plus, Save, Trash2 } from "lucide-react";

import { adminApi, type AdminArticlePayload, type CmsArticle } from "@/lib/cms";
import type { AdminCtx } from "../types";
import { MediaPicker } from "../components/media-picker";

export function ArticlesSection({ ctx }: { ctx: AdminCtx }) {
  const [articles, setArticles] = useState<CmsArticle[]>([]);
  const [editing, setEditing] = useState<CmsArticle | null>(null);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    adminApi
      .articles(ctx.csrf)
      .then((res) => setArticles(res.items))
      .catch((err) => setError(err instanceof Error ? err.message : "Erreur de chargement."));
  }, [ctx.csrf]);

  useEffect(load, [load]);

  const togglePublish = async (article: CmsArticle) => {
    try {
      await adminApi.publishArticle(ctx.csrf, article.id, !article.isPublished);
      ctx.notify(article.isPublished ? "Article dépublié." : "Article publié ! Visible sur /actualites.");
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur.");
    }
  };

  const handleDelete = async (article: CmsArticle) => {
    if (!window.confirm(`Supprimer l'article « ${article.title} » ?`)) return;
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
        <h2>{articles.length} article(s)</h2>
        <button className="admin-btn admin-btn--primary" onClick={() => setCreating(true)}>
          <Plus size={14} /> Nouvel article
        </button>
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
          {articles.length === 0 ? (
            <p className="admin-hint">
              Aucun article. Cliquez « Nouvel article », écrivez le titre et le
              texte, choisissez une image de couverture, puis Publier — il
              apparaît sur la page Actualités.
            </p>
          ) : null}
          {articles.map((article) => (
            <div key={article.id} className="admin-row">
              <span className="admin-row__title">{article.title}</span>
              <span className="admin-row__meta">/actualites/{article.slug}</span>
              <span className="admin-row__spacer" />
              <button
                className={`admin-btn ${article.isPublished ? "" : "admin-btn--primary"}`}
                onClick={() => togglePublish(article)}
                title={article.isPublished ? "Dépublier" : "Publier"}
              >
                {article.isPublished ? <Eye size={13} /> : <EyeOff size={13} />}
                {article.isPublished ? "Publié" : "Brouillon"}
              </button>
              <a className="admin-btn" href={`/actualites/${article.slug}`} target="_blank" rel="noreferrer">
                Voir
              </a>
              <button className="admin-btn" onClick={() => setEditing(article)} title="Modifier">
                <Pencil size={13} />
              </button>
              <button className="admin-btn admin-btn--danger" onClick={() => handleDelete(article)} title="Supprimer">
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      )}
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
  const [isPublished, setIsPublished] = useState(Boolean(article?.isPublished));
  const [pickerOpen, setPickerOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      isPublished,
    };

    try {
      if (article === null) {
        await adminApi.createArticle(ctx.csrf, payload);
        ctx.notify(isPublished ? "Article créé et publié !" : "Article créé (brouillon).");
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
            <input value={coverImageUrl} onChange={(e) => setCoverImageUrl(e.target.value)} placeholder="/api/uploads/…" />
            <button type="button" className="admin-btn" onClick={() => setPickerOpen(true)}>
              Choisir…
            </button>
          </div>
        </label>
        <label className="admin-form__check">
          <input type="checkbox" checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} />
          Publier immédiatement
        </label>
      </div>

      <label>
        Résumé (affiché dans la liste)
        <textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)} rows={3} />
      </label>

      <label>
        Contenu de l'article (HTML simple autorisé : &lt;p&gt;, &lt;h2&gt;, &lt;h3&gt;, &lt;img&gt;, &lt;strong&gt;, &lt;em&gt;, &lt;a&gt;, &lt;blockquote&gt;, &lt;ul&gt;/&lt;li&gt;)
        <textarea
          className="admin-form__body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="<p>Premier paragraphe…</p>"
        />
      </label>
      <p className="admin-hint">
        Astuce : collez l'URL d'une image de la médiathèque (ex. /api/uploads/abc123.jpg) dans une balise &lt;img&gt;.
      </p>

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
        title="Image de couverture"
        onSelect={setCoverImageUrl}
        onClose={() => setPickerOpen(false)}
      />
    </form>
  );
}
