export interface AdminCtx {
  csrf: string;
  notify: (message: string) => void;
}
