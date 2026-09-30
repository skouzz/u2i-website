/**
 * Tiny fetch helpers for the OVH PHP/MySQL CMS backend.
 * All endpoints live under /api (see public/api/*.php).
 */

export type CmsBlockType = "heading" | "text" | "image" | "gallery" | "contact_info";

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
  isPublished?: boolean | number;
}

export interface CmsArticle {
  id: number;
  slug: string;
  title: string;
  excerpt?: string | null;
  body?: string | null;
  coverImageUrl?: string | null;
  author?: string | null;
  isPublished?: boolean | number;
  publishedAt?: string | null;
}

export interface CmsMedia {
  id: number;
  url: string;
  original_name?: string | null;
  width?: number | null;
  height?: number | null;
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
}

async function getJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  const payload = (await res.json().catch(() => null)) as (T & { ok?: boolean; message?: string }) | null;
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

// ── Public API ───────────────────────────────────────────────────────────────

export const cmsApi = {
  settings: () =>
    getJson<{ ok: true; settings: CmsSettings | null }>("/api/cms.php?r=settings"),

  nav: () => getJson<{ ok: true; items: { slug: string; label: string; nav_order: number }[] }>("/api/cms.php?r=nav"),

  page: (slug: string) =>
    getJson<{ ok: true; page: CmsPage; blocks: CmsBlock[] }>(`/api/cms.php?r=page&p=${encodeURIComponent(slug)}`),

  articles: () => getJson<{ ok: true; items: CmsArticle[] }>("/api/cms.php?r=articles"),

  article: (slug: string) =>
    getJson<{ ok: true; article: CmsArticle }>(`/api/cms.php?r=article&p=${encodeURIComponent(slug)}`),
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
  isPublished?: boolean;
  blocks?: (CmsBlock & { images?: string[] })[];
}

export interface AdminArticlePayload {
  title: string;
  slug?: string;
  excerpt?: string;
  body?: string;
  coverImageUrl?: string;
  author?: string;
  isPublished?: boolean;
  publishedAt?: string;
}

export interface AdminStats {
  pages: number;
  pagesPublished: number;
  articles: number;
  articlesPublished: number;
  media: number;
  messages: number;
  messagesUnread: number;
}

export const adminApi = {
  setupStatus: () => getJson<{ ok: true; setup: boolean }>("/api/admin.php?a=setup_status"),

  stats: (csrf: string) =>
    getJson<{ ok: true; stats: AdminStats }>("/api/admin.php?a=stats", withCsrf({}, csrf)),

  publishPage: (csrf: string, id: number, published: boolean) =>
    getJson<{ ok: true }>(
      "/api/admin.php?a=page_publish",
      withCsrf({ method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ published }) }, csrf),
    ),

  publishArticle: (csrf: string, id: number, published: boolean) =>
    getJson<{ ok: true }>(
      "/api/admin.php?a=article_publish",
      withCsrf({ method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ published }) }, csrf),
    ),

  reorderPages: (csrf: string, ids: number[]) =>
    getJson<{ ok: true }>(
      "/api/admin.php?a=page_reorder",
      withCsrf({ method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ids }) }, csrf),
    ),

  setup: (username: string, password: string) =>
    getJson<{ ok: true; csrf: string }>("/api/admin.php?a=setup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    }),

  login: (username: string, password: string) =>
    getJson<{ ok: true; csrf: string }>("/api/admin.php?a=login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    }),

  me: () => getJson<{ ok: true; csrf: string }>("/api/admin.php?a=me"),

  logout: (csrf: string) =>
    getJson<{ ok: true }>("/api/admin.php?a=logout", { method: "POST", ...withCsrf({}, csrf) }),

  settings: (csrf: string) =>
    getJson<{ ok: true; settings: Record<string, string | null> }>("/api/admin.php?a=settings", withCsrf({}, csrf)),

  saveSettings: (csrf: string, payload: Record<string, string>) =>
    getJson<{ ok: true }>(
      "/api/admin.php?a=settings",
      withCsrf({ method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }, csrf),
    ),

  pages: (csrf: string) =>
    getJson<{ ok: true; items: CmsPage[] }>("/api/admin.php?a=pages", withCsrf({}, csrf)),

  page: (csrf: string, id: number) =>
    getJson<{ ok: true; page: CmsPage; blocks: (CmsBlock & { images_json?: string | null })[] }>(
      `/api/admin.php?a=page&p=${id}`,
      withCsrf({}, csrf),
    ),

  createPage: (csrf: string, payload: AdminPagePayload) =>
    getJson<{ ok: true; page: CmsPage }>(
      "/api/admin.php?a=pages",
      withCsrf({ method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }, csrf),
    ),

  updatePage: (csrf: string, id: number, payload: AdminPagePayload) =>
    getJson<{ ok: true; page: CmsPage }>(
      `/api/admin.php?a=page&p=${id}`,
      withCsrf({ method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }, csrf),
    ),

  deletePage: (csrf: string, id: number) =>
    getJson<{ ok: true }>(`/api/admin.php?a=page&p=${id}`, withCsrf({ method: "DELETE" }, csrf)),

  articles: (csrf: string) =>
    getJson<{ ok: true; items: CmsArticle[] }>("/api/admin.php?a=articles", withCsrf({}, csrf)),

  createArticle: (csrf: string, payload: AdminArticlePayload) =>
    getJson<{ ok: true; article: CmsArticle }>(
      "/api/admin.php?a=articles",
      withCsrf({ method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }, csrf),
    ),

  updateArticle: (csrf: string, id: number, payload: AdminArticlePayload) =>
    getJson<{ ok: true; article: CmsArticle }>(
      `/api/admin.php?a=article&p=${id}`,
      withCsrf({ method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }, csrf),
    ),

  deleteArticle: (csrf: string, id: number) =>
    getJson<{ ok: true }>(`/api/admin.php?a=article&p=${id}`, withCsrf({ method: "DELETE" }, csrf)),

  media: (csrf: string) => getJson<{ ok: true; items: CmsMedia[] }>("/api/admin.php?a=media", withCsrf({}, csrf)),

  uploadMedia: async (csrf: string, file: File): Promise<CmsMedia> => {
    const body = new FormData();
    body.append("file", file);
    const res = await fetch("/api/admin.php?a=media", withCsrf({ method: "POST", body }, csrf));
    const payload = (await res.json().catch(() => null)) as { ok?: boolean; media?: CmsMedia; message?: string } | null;
    if (!res.ok || !payload?.ok || !payload.media) {
      throw new Error(payload?.message ?? "Échec de l'upload.");
    }
    return payload.media;
  },

  deleteMedia: (csrf: string, id: number) =>
    getJson<{ ok: true }>(`/api/admin.php?a=media_delete&p=${id}`, withCsrf({ method: "DELETE" }, csrf)),

  messages: (csrf: string) =>
    getJson<{ ok: true; items: CmsMessage[] }>("/api/admin.php?a=messages", withCsrf({}, csrf)),

  changePassword: (csrf: string, currentPassword: string, newPassword: string) =>
    getJson<{ ok: true }>(
      "/api/admin.php?a=change_password",
      withCsrf(
        { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ currentPassword, newPassword }) },
        csrf,
      ),
    ),

  markMessageRead: (csrf: string, id: number) =>
    getJson<{ ok: true }>(`/api/admin.php?a=message&p=${id}`, withCsrf({ method: "POST" }, csrf)),

  deleteMessage: (csrf: string, id: number) =>
    getJson<{ ok: true }>(`/api/admin.php?a=message&p=${id}`, withCsrf({ method: "DELETE" }, csrf)),
};
