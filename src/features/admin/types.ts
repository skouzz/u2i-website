export type SectionKey =
  | "home"
  | "pages"
  | "articles"
  | "media"
  | "messages"
  | "settings"
  | "account";

export interface AdminCtx {
  csrf: string;
  notify: (message: string) => void;
}
