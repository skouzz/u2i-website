export type SectionKey =
  | "home"
  | "pages"
  | "articles"
  | "categories"
  | "tags"
  | "media"
  | "menus"
  | "homepage"
  | "references"
  | "header"
  | "footer"
  | "settings"
  | "seo"
  | "users"
  | "activity"
  | "messages"
  | "account";

export interface AdminCtx {
  csrf: string;
  notify: (message: string) => void;
  username: string;
}
