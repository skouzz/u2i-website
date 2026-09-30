import { useCallback, useEffect, useState } from "react";
import { ArrowDown, ArrowUp, Eye, EyeOff, Pencil, Plus, Save, Trash2 } from "lucide-react";

import { adminApi, type AdminPagePayload, type CmsPage } from "@/lib/cms";
import type { AdminCtx } from "../types";
import { BlockFields } from "../components/block-fields";
import { MediaPicker } from "../components/media-picker";

export function PagesSection({ ctx }: { ctx: AdminCtx }) {
  const [pages, setPages] = useState<CmsPage[]>([]);
  const [editing, setEditing] = useState<CmsPage | null>(null);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    adminApi
      .pages(ctx.csrf)
      .then((res) => setPages(res.items))
      .catch((err) => setError(err instanceof Error ? err.message : "Erreur de chargement."));
  }, [ctx.csrf]);

  useEffect(load, [load]);

  const togglePublish = async (page: CmsPage) => {
    try {
      await adminApi.publishPage(ctx.csrf, page.id, !page.isPublished);
      ctx.notify(page.isPublished ? "Page dépubliée." : "Page publiée ! Elle est visible sur le site.");
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur.");
    }
  };

  const move = async (index: number, delta: number) => {
    const target = index + delta;
    if (target < 0 || target >= pages.length) return;
    const next = [...pages];
    [next[index], next[target]] = [next[target], next[index]];
    setPages(next);
    try {
      await adminApi.reorderPages(ctx.csrf, next.map((p) => p.id));
      ctx.notify("Ordre du menu mis à jour.");
    } catch {
      load();
    }
  };

  const handleDelete = async (page: CmsPage) => {
    if (!window.confirm(`Supprimer la page « ${page.title} » ?`)) return;
    try {
      await adminApi.deletePage(ctx.csrf, page.id);
      ctx.notify("Page supprimée.");
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de suppression.");
    }
  };

  return (
    <div className="admin-section">
      <div className="admin-section__head">
        <h2>{pages.length} page(s)</h2>
        <button className="admin-btn admin-btn--primary" onClick={() => setCreating(true)}>
          <Plus size={14} /> Nouvelle page
        </button>
      </div>

      {error ? <p className="admin-alert admin-alert--error">{error}</p> : null}

      {creating || editing ? (
        <PageForm
          ctx={ctx}
          page={editing}
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
          {pages.length === 0 ? (
            <p className="admin-hint">
              Aucune page. Cliquez « Nouvelle page », remplissez le titre, ajoutez
              des sections, puis cliquez Publier — elle apparaît aussitôt dans le
              menu du site.
            </p>
          ) : null}
          {pages.map((page, index) => (
            <div key={page.id} className="admin-row">
              <div className="admin-row__order">
                <button type="button" title="Monter" onClick={() => move(index, -1)} disabled={index === 0}>
                  <ArrowUp size={13} />
                </button>
                <button
                  type="button"
                  title="Descendre"
                  onClick={() => move(index, 1)}
                  disabled={index === pages.length - 1}
                >
                  <ArrowDown size={13} />
                </button>
              </div>
              <span className="admin-row__title">{page.title}</span>
              <span className="admin-row__meta">/p/{page.slug}</span>
              {page.navLabel ? (
                <span className="admin-row__meta">· menu : {page.navLabel}</span>
              ) : null}
              <span className="admin-row__spacer" />
              <button
                className={`admin-btn ${page.isPublished ? "" : "admin-btn--primary"}`}
                onClick={() => togglePublish(page)}
                title={page.isPublished ? "Dépublier" : "Publier"}
              >
                {page.isPublished ? <Eye size={13} /> : <EyeOff size={13} />}
                {page.isPublished ? "Publiée" : "Brouillon"}
              </button>
              <a className="admin-btn" href={`/p/${page.slug}`} target="_blank" rel="noreferrer">
                Voir
              </a>
              <button className="admin-btn" onClick={() => setEditing(page)} title="Modifier">
                <Pencil size={13} />
              </button>
              <button className="admin-btn admin-btn--danger" onClick={() => handleDelete(page)} title="Supprimer">
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PageForm({
  ctx,
  page,
  onDone,
  onCancel,
}: {
  ctx: AdminCtx;
  page: CmsPage | null;
  onDone: () => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(page?.title ?? "");
  const [slug, setSlug] = useState(page?.slug ?? "");
  const [eyebrow, setEyebrow] = useState(page?.eyebrow ?? "");
  const [heroTitle, setHeroTitle] = useState(page?.heroTitle ?? "");
  const [heroText, setHeroText] = useState(page?.heroText ?? "");
  const [heroImageUrl, setHeroImageUrl] = useState(page?.heroImageUrl ?? "");
  const [navLabel, setNavLabel] = useState(page?.navLabel ?? "");
  const [navOrder, setNavOrder] = useState(String(page?.navOrder ?? 0));
  const [isPublished, setIsPublished] = useState(Boolean(page?.isPublished));
  const [blocks, setBlocks] = useState<NonNullable<AdminPagePayload["blocks"]>>([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(page !== null);

  useEffect(() => {
    if (page === null || loaded) return;
    setLoaded(true);
    adminApi
      .page(ctx.csrf, page.id)
      .then((res) => {
        setBlocks(
          res.blocks.map((b) => ({
            type: b.type,
            title: b.title ?? "",
            body: b.body ?? "",
            imageUrl: b.imageUrl ?? "",
            images: b.images_json ? (JSON.parse(b.images_json) as string[]) : [],
          })),
        );
        setSlug(res.page.slug);
        setEyebrow(res.page.eyebrow ?? "");
        setHeroTitle(res.page.heroTitle ?? "");
        setHeroText(res.page.heroText ?? "");
        setHeroImageUrl(res.page.heroImageUrl ?? "");
        setNavLabel(res.page.navLabel ?? "");
        setNavOrder(String(res.page.navOrder ?? 0));
        setIsPublished(Boolean(res.page.isPublished));
      })
      .catch(() => undefined);
  }, [page, loaded, ctx.csrf]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(null);

    const payload: AdminPagePayload = {
      title,
      slug: slug || undefined,
      eyebrow,
      heroTitle,
      heroText,
      heroImageUrl,
      navLabel,
      navOrder: Number(navOrder) || 0,
      isPublished,
      blocks: blocks ?? [],
    };

    try {
      if (page === null) {
        await adminApi.createPage(ctx.csrf, payload);
        ctx.notify(isPublished ? "Page créée et publiée !" : "Page créée (brouillon).");
      } else {
        await adminApi.updatePage(ctx.csrf, page.id, payload);
        ctx.notify("Page enregistrée.");
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
          Adresse (slug) — /p/…
          <input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="auto" />
        </label>
        <label>
          Surtitre
          <input value={eyebrow} onChange={(e) => setEyebrow(e.target.value)} />
        </label>
      </div>

      <div className="admin-form__row">
        <label>
          Titre du bandeau
          <input value={heroTitle} onChange={(e) => setHeroTitle(e.target.value)} />
        </label>
        <label>
          Image du bandeau
          <div className="admin-form__inline">
            <input value={heroImageUrl} onChange={(e) => setHeroImageUrl(e.target.value)} placeholder="/api/uploads/…" />
            <button type="button" className="admin-btn" onClick={() => setPickerOpen(true)}>
              Choisir…
            </button>
          </div>
        </label>
      </div>

      <label>
        Texte du bandeau
        <textarea value={heroText} onChange={(e) => setHeroText(e.target.value)} rows={2} />
      </label>

      <div className="admin-form__row">
        <label>
          Libellé dans le menu (vide = pas de lien)
          <input value={navLabel} onChange={(e) => setNavLabel(e.target.value)} />
        </label>
        <label className="admin-form__check">
          <input type="checkbox" checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} />
          Publier immédiatement
        </label>
      </div>

      <BlockFields blocks={blocks} onChange={setBlocks} csrf={ctx.csrf} />

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
        title="Image du bandeau"
        onSelect={setHeroImageUrl}
        onClose={() => setPickerOpen(false)}
      />
    </form>
  );
}
