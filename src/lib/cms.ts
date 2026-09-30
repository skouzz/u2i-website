/**
 * Typed fetch helpers for the OVH PHP/MySQL CMS backend.
 * All endpoints live under /api (see public/api/*.php).
 */

export type CmsBlockType = "heading" | "text" | "image" | "gallery" | "contact_info";

export type CmsStatus = "draft" | "pending" | "scheduled" | "published" | "archived";

export interface CmsSeo {
  seoTitle?: string;
  seoDescription?: string;
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  robots?: string;
}

export interface CmsBlock {
  type: CmsBlockType;
  title?: string | null;
  body?: string | null;
  imageUrl?: string | null;
  images?: string[] | null;
}

export interface CmsPage {
  id: number;
  slug: string;
  title: string;
  eyebrow?: string | null;
  heroTitle?: string | null;
  heroText?: string | null;
  heroImageUrl?: string | null;
  navLabel?: string | null;
  navOrder?: number;
  parentId?: number | null;
  status?: CmsStatus;
  isPublished?: boolean | number;
  publishedAt?: string | null;
  scheduledAt?: string | null;
  seo?: CmsSeo | null;
  updatedAt?: string | null;
}

export interface CmsArticle {
  id: number;
  slug: string;
  title: string;
  excerpt?: string | null;
  body?: string | null;
  coverImageUrl?: string | null;
  author?: string | null;
  categoryId?: number | null;
  status?: CmsStatus;
  isPublished?: boolean | number;
  publishedAt?: string | null;
  scheduledAt?: string | null;
  seo?: CmsSeo | null;
  updatedAt?: string | null;
  tagIds?: number[];
  tags?: { slug: string; name: string }[];
}

export interface CmsMedia {
  id: number;
  url: string;
  original_name?: string | null;
  width?: number | null;
  height?: number | null;
  title?: string | null;
  alt_text?: string | null;
  caption?: string | null;
  description?: string | null;
  created_at?: string;
}

export interface CmsMessage {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  company?: string | null;
  subject: string;
  message: string;
  is_read: number;
  created_at: string;
}

export interface CmsSettings {
  site_name?: string;
  contact_email?: string;
  contact_phone?: string;
  address?: string | null;
  footer_note?: string | null;
  header_json?: CmsHeaderConfig | null;
  footer_json?: CmsFooterConfig | null;
  seo_json?: CmsSiteSeo | null;
  social_json?: CmsSocialLinks | null;
  home_json?: Record<string, unknown> | null;
}

export interface CmsHeaderConfig {
  logoUrl?: string;
  announcement?: string;
  announcementEnabled?: boolean;
  phone?: string;
  email?: string;
  showSocial?: boolean;
}

export interface CmsFooterConfig {
  logoUrl?: string;
  description?: string;
  copyright?: string;
  note?: string;
  columns?: { heading: string; links: { label: string; url: string }[] }[];
  showNewsletter?: boolean;
  ctaLabel?: string;
  ctaUrl?: string;
}

export interface CmsSiteSeo {
  defaultTitle?: string;
  defaultDescription?: string;
  keywords?: string;
  robots?: string;
  ogImage?: string;
}

export interface CmsSocialLinks {
  facebook?: string;
  instagram?: string;
  linkedin?: string;
  youtube?: string;
  tiktok?: string;
  twitter?: string;
  whatsapp?: string;
}

export interface CmsMenuItem {
  id?: number;
  clientId?: string;
  parentId?: string | number | null;
  parent_id?: number | null;
  label: string;
  url: string;
  sort_order?: number;
  is_enabled?: number | boolean;
  isEnabled?: number | boolean;
  opens_new_tab?: number | boolean;
  opensNewTab?: boolean;
  /** Client-side normalized shape used by the Navbar. */
  children?: CmsMenuItem[];
}

export interface CmsNavItem {
  slug?: string;
  label: string;
  nav_order?: number;
  url?: string;
  opensNewTab?: boolean;
  children?: CmsNavItem[];
}

export interface CmsCategory {
  id: number;
  slug: string;
  name: string;
  description?: string | null;
  article_count?: number;
}

export interface CmsTag {
  id: number;
  slug: string;
  name: string;
  article_count?: number;
}

export type HomeBlockType =
  | "hero"
  | "about"
  | "services"
  | "stats"
  | "features"
  | "projects"
  | "testimonials"
  | "team"
  | "articles"
  | "gallery"
  | "cta"
  | "contact"
  | "faq"
  | "html";

export interface CmsHomeBlock {
  id?: number;
  type: HomeBlockType;
  title?: string | null;
  subtitle?: string | null;
  body?: string | null;
  imageUrl?: string | null;
  config?: Record<string, unknown> | null;
  sortOrder?: number;
  isVisible?: boolean;
}

export interface AdminStats {
  pages: number;
  pagesPublished: number;
  pagesDraft: number;
  pagesScheduled: number;
  articles: number;
  articlesPublished: number;
  articlesDraft: number;
  articlesScheduled: number;
  categories: number;
  tags: number;
  media: number;
  messages: number;
  messagesUnread: number;
}

export interface CmsRevisionMeta {
  id: number;
  author: string | null;
  created_at: string;
}

export interface CmsActivity {
  id: number;
  actor: string;
  action: string;
  entity_type?: string | null;
  entity_id?: number | null;
  detail?: string | null;
  created_at: string;
}

async function getJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  const payload = (await res.json().catch(() => null)) as
    (T & { ok?: boolean; message?: string }) | null;
  if (!res.ok || !payload) {
    throw new Error(payload?.message ?? `Request failed (${res.status})`);
  }
  return payload;
}

function withCsrf(init: RequestInit = {}, csrf?: string): RequestInit {
  const headers = new Headers(init.headers);
  headers.set("X-CSRF-Token", csrf ?? "");
  return { ...init, headers };
}

function jsonBody(body: unknown): RequestInit {
  return {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  };
}

// ── Public API ───────────────────────────────────────────────────────────────

export const cmsApi = {
  settings: () => getJson<{ ok: true; settings: CmsSettings | null }>("/api/cms.php?r=settings"),

  nav: () => getJson<{ ok: true; items: CmsNavItem[]; source?: string }>("/api/cms.php?r=nav"),

  footerMenu: () => getJson<{ ok: true; items: CmsNavItem[] }>("/api/cms.php?r=footer_menu"),

  page: (slug: string) =>
    getJson<{ ok: true; page: CmsPage; blocks: CmsBlock[] }>(
      `/api/cms.php?r=page&p=${encodeURIComponent(slug)}`,
    ),

  articles: () => getJson<{ ok: true; items: CmsArticle[] }>("/api/cms.php?r=articles"),

  article: (slug: string) =>
    getJson<{ ok: true; article: CmsArticle }>(
      `/api/cms.php?r=article&p=${encodeURIComponent(slug)}`,
    ),

  home: () => getJson<{ ok: true; items: CmsHomeBlock[] }>("/api/cms.php?r=home"),

  categories: () => getJson<{ ok: true; items: CmsCategory[] }>("/api/cms.php?r=categories"),
};

// ── Admin API ────────────────────────────────────────────────────────────────

export interface AdminPagePayload {
  title: string;
  slug?: string;
  eyebrow?: string;
  heroTitle?: string;
  heroText?: string;
  heroImageUrl?: string;
  navLabel?: string;
  navOrder?: number;
  parentId?: number | null;
  status?: CmsStatus;
  isPublished?: boolean;
  publishedAt?: string;
  scheduledAt?: string;
  seo?: CmsSeo;
  blocks?: (CmsBlock & { images?: string[] })[];
}

export interface AdminArticlePayload {
  title: string;
  slug?: string;
  excerpt?: string;
  body?: string;
  coverImageUrl?: string;
  author?: string;
  categoryId?: number | null;
  status?: CmsStatus;
  isPublished?: boolean;
  publishedAt?: string;
  scheduledAt?: string;
  seo?: CmsSeo;
  tagIds?: number[];
}

export const adminApi = {
  setupStatus: () => getJson<{ ok: true; setup: boolean }>("/api/admin.php?a=setup_status"),

  me: () => getJson<{ ok: true; csrf: string; username?: string }>("/api/admin.php?a=me"),

  stats: (csrf: string) =>
    getJson<{ ok: true; stats: AdminStats }>("/api/admin.php?a=stats", withCsrf({}, csrf)),

  recent: (csrf: string) =>
    getJson<{ ok: true; pages: CmsPage[]; articles: CmsArticle[]; media: CmsMedia[] }>(
      "/api/admin.php?a=recent",
      withCsrf({}, csrf),
    ),

  activity: (csrf: string) =>
    getJson<{ ok: true; items: CmsActivity[] }>("/api/admin.php?a=activity", withCsrf({}, csrf)),

  // ── Auth ──
  setup: (username: string, password: string) =>
    getJson<{ ok: true; csrf: string }>("/api/admin.php?a=setup", jsonBody({ username, password })),

  login: (username: string, password: string) =>
    getJson<{ ok: true; csrf: string }>("/api/admin.php?a=login", jsonBody({ username, password })),

  logout: (csrf: string) =>
    getJson<{ ok: true }>("/api/admin.php?a=logout", { method: "POST", ...withCsrf({}, csrf) }),

  changePassword: (csrf: string, currentPassword: string, newPassword: string) =>
    getJson<{ ok: true }>(
      "/api/admin.php?a=change_password",
      withCsrf(jsonBody({ currentPassword, newPassword }), csrf),
    ),

  // ── Settings ──
  settings: (csrf: string) =>
    getJson<{ ok: true; settings: CmsSettings | null }>(
      "/api/admin.php?a=settings",
      withCsrf({}, csrf),
    ),

  saveSettings: (csrf: string, payload: Record<string, unknown>) =>
    getJson<{ ok: true }>("/api/admin.php?a=settings", withCsrf(jsonBody(payload), csrf)),

  // ── Pages ──
  pages: (csrf: string) =>
    getJson<{ ok: true; items: CmsPage[] }>("/api/admin.php?a=pages", withCsrf({}, csrf)),

  page: (csrf: string, id: number) =>
    getJson<{ ok: true; page: CmsPage; blocks: CmsBlock[] }>(
      `/api/admin.php?a=page&p=${id}`,
      withCsrf({}, csrf),
    ),

  createPage: (csrf: string, payload: AdminPagePayload) =>
    getJson<{ ok: true; page: CmsPage }>(
      "/api/admin.php?a=pages",
      withCsrf(jsonBody(payload), csrf),
    ),

  updatePage: (csrf: string, id: number, payload: AdminPagePayload) =>
    getJson<{ ok: true; page: CmsPage }>(
      `/api/admin.php?a=page&p=${id}`,
      withCsrf(jsonBody(payload), csrf),
    ),

  deletePage: (csrf: string, id: number) =>
    getJson<{ ok: true }>(`/api/admin.php?a=page&p=${id}`, withCsrf({ method: "DELETE" }, csrf)),

  duplicatePage: (csrf: string, id: number) =>
    getJson<{ ok: true; page: CmsPage }>(
      `/api/admin.php?a=page_duplicate&p=${id}`,
      withCsrf({ method: "POST" }, csrf),
    ),

  publishPage: (csrf: string, id: number, published: boolean) =>
    getJson<{ ok: true }>("/api/admin.php?a=page_publish", withCsrf(jsonBody({ published }), csrf)),

  reorderPages: (csrf: string, ids: number[]) =>
    getJson<{ ok: true }>("/api/admin.php?a=page_reorder", withCsrf(jsonBody({ ids }), csrf)),

  // ── Articles ──
  articles: (csrf: string) =>
    getJson<{ ok: true; items: CmsArticle[] }>("/api/admin.php?a=articles", withCsrf({}, csrf)),

  article: (csrf: string, id: number) =>
    getJson<{ ok: true; article: CmsArticle }>(
      `/api/admin.php?a=article&p=${id}`,
      withCsrf({}, csrf),
    ),

  createArticle: (csrf: string, payload: AdminArticlePayload) =>
    getJson<{ ok: true; article: CmsArticle }>(
      "/api/admin.php?a=articles",
      withCsrf(jsonBody(payload), csrf),
    ),

  updateArticle: (csrf: string, id: number, payload: AdminArticlePayload) =>
    getJson<{ ok: true; article: CmsArticle }>(
      `/api/admin.php?a=article&p=${id}`,
      withCsrf(jsonBody(payload), csrf),
    ),

  deleteArticle: (csrf: string, id: number) =>
    getJson<{ ok: true }>(`/api/admin.php?a=article&p=${id}`, withCsrf({ method: "DELETE" }, csrf)),

  duplicateArticle: (csrf: string, id: number) =>
    getJson<{ ok: true; article: CmsArticle }>(
      `/api/admin.php?a=article_duplicate&p=${id}`,
      withCsrf({ method: "POST" }, csrf),
    ),

  publishArticle: (csrf: string, id: number, published: boolean) =>
    getJson<{ ok: true }>(
      "/api/admin.php?a=article_publish",
      withCsrf(jsonBody({ published }), csrf),
    ),

  // ── Media ──
  media: (csrf: string) =>
    getJson<{ ok: true; items: CmsMedia[] }>("/api/admin.php?a=media", withCsrf({}, csrf)),

  uploadMedia: async (csrf: string, file: File): Promise<CmsMedia> => {
    const body = new FormData();
    body.append("file", file);
    const res = await fetch("/api/admin.php?a=media", withCsrf({ method: "POST", body }, csrf));
    const payload = (await res.json().catch(() => null)) as {
      ok?: boolean;
      media?: CmsMedia;
      message?: string;
    } | null;
    if (!res.ok || !payload?.ok || !payload.media) {
      throw new Error(payload?.message ?? "Échec de l'upload.");
    }
    return payload.media;
  },

  updateMedia: (
    csrf: string,
    id: number,
    payload: { title?: string; altText?: string; caption?: string; description?: string },
  ) =>
    getJson<{ ok: true }>(`/api/admin.php?a=media_meta&p=${id}`, withCsrf(jsonBody(payload), csrf)),

  deleteMedia: (csrf: string, id: number) =>
    getJson<{ ok: true }>(
      `/api/admin.php?a=media_delete&p=${id}`,
      withCsrf({ method: "DELETE" }, csrf),
    ),

  // ── Menus ──
  menus: (csrf: string) =>
    getJson<{
      ok: true;
      items: { id: number; location: string; label: string; items: CmsMenuItem[] }[];
    }>("/api/admin.php?a=menus", withCsrf({}, csrf)),

  createMenu: (csrf: string, label: string, location?: string) =>
    getJson<{ ok: true; id: number }>(
      "/api/admin.php?a=menus",
      withCsrf(jsonBody({ label, location }), csrf),
    ),

  deleteMenu: (csrf: string, id: number) =>
    getJson<{ ok: true }>(`/api/admin.php?a=menu&p=${id}`, withCsrf({ method: "DELETE" }, csrf)),

  saveMenu: (csrf: string, id: number, items: CmsMenuItem[]) =>
    getJson<{ ok: true }>(`/api/admin.php?a=menu&p=${id}`, withCsrf(jsonBody({ items }), csrf)),

  // ── Categories ──
  categories: (csrf: string) =>
    getJson<{ ok: true; items: CmsCategory[] }>("/api/admin.php?a=categories", withCsrf({}, csrf)),

  createCategory: (csrf: string, payload: { name: string; slug?: string; description?: string }) =>
    getJson<{ ok: true; id: number }>(
      "/api/admin.php?a=categories",
      withCsrf(jsonBody(payload), csrf),
    ),

  updateCategory: (
    csrf: string,
    id: number,
    payload: { name: string; slug?: string; description?: string },
  ) =>
    getJson<{ ok: true }>(`/api/admin.php?a=category&p=${id}`, withCsrf(jsonBody(payload), csrf)),

  deleteCategory: (csrf: string, id: number) =>
    getJson<{ ok: true }>(
      `/api/admin.php?a=category&p=${id}`,
      withCsrf({ method: "DELETE" }, csrf),
    ),

  // ── Tags ──
  tags: (csrf: string) =>
    getJson<{ ok: true; items: CmsTag[] }>("/api/admin.php?a=tags", withCsrf({}, csrf)),

  createTag: (csrf: string, payload: { name: string; slug?: string }) =>
    getJson<{ ok: true; id: number }>("/api/admin.php?a=tags", withCsrf(jsonBody(payload), csrf)),

  updateTag: (csrf: string, id: number, payload: { name: string; slug?: string }) =>
    getJson<{ ok: true }>(`/api/admin.php?a=tag&p=${id}`, withCsrf(jsonBody(payload), csrf)),

  deleteTag: (csrf: string, id: number) =>
    getJson<{ ok: true }>(`/api/admin.php?a=tag&p=${id}`, withCsrf({ method: "DELETE" }, csrf)),

  // ── Homepage builder ──
  homeBlocks: (csrf: string) =>
    getJson<{ ok: true; items: CmsHomeBlock[] }>(
      "/api/admin.php?a=home_blocks",
      withCsrf({}, csrf),
    ),

  saveHomeBlocks: (csrf: string, blocks: CmsHomeBlock[]) =>
    getJson<{ ok: true }>("/api/admin.php?a=home_blocks", withCsrf(jsonBody({ blocks }), csrf)),

  // ── Revisions ──
  revisions: (csrf: string, type: "page" | "article", id: number) =>
    getJson<{ ok: true; items: CmsRevisionMeta[] }>(
      `/api/admin.php?a=revisions&type=${type}&p=${id}`,
      withCsrf({}, csrf),
    ),

  revision: (csrf: string, revisionId: number) =>
    getJson<{
      ok: true;
      revision: {
        id: number;
        snapshot: Record<string, unknown> | null;
        createdAt: string;
        author: string | null;
      };
    }>(`/api/admin.php?a=revision&p=${revisionId}`, withCsrf({}, csrf)),

  restoreRevision: (csrf: string, revisionId: number) =>
    getJson<{ ok: true }>(
      `/api/admin.php?a=revision&p=${revisionId}`,
      withCsrf({ method: "POST" }, csrf),
    ),

  // ── Messages ──
  messages: (csrf: string) =>
    getJson<{ ok: true; items: CmsMessage[] }>("/api/admin.php?a=messages", withCsrf({}, csrf)),

  markMessageRead: (csrf: string, id: number) =>
    getJson<{ ok: true }>(`/api/admin.php?a=message&p=${id}`, withCsrf({ method: "POST" }, csrf)),

  deleteMessage: (csrf: string, id: number) =>
    getJson<{ ok: true }>(`/api/admin.php?a=message&p=${id}`, withCsrf({ method: "DELETE" }, csrf)),
};
