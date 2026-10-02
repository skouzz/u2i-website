import { useRouter } from "@tanstack/react-router";
import type { AnchorHTMLAttributes, MouseEvent, ReactNode } from "react";

import { useI18n } from "./index";

type Props = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  /** Locale-agnostic internal path, e.g. "/about" or "/actualites/my-post". */
  to: string;
  children: ReactNode;
};

/**
 * Internal link that keeps SPA navigation while honouring the active locale.
 *
 * TanStack's <Link> needs a statically typed `to`, but our destinations depend
 * on the runtime locale and on slugs that only exist once the CMS responds.
 * This renders a normal anchor and hands the click to the router, so navigation
 * stays client-side and middle-click / open-in-new-tab keep working.
 *
 * It accepts the full anchor prop set rather than a hand-picked list: callers
 * legitimately need `tabIndex`, `aria-expanded`, `onFocus` and friends (the
 * navbar's mega-menu uses all four), and a narrow allow-list would push them
 * back to raw `<a>` elements that forget the locale prefix.
 */
export function LocalizedLink({ to, children, onClick, ...rest }: Props) {
  const router = useRouter();
  const { link } = useI18n();
  const href = link(to);

  return (
    <a
      href={href}
      {...rest}
      onClick={(event: MouseEvent<HTMLAnchorElement>) => {
        // Run the caller's handler first, so it can stop propagation or prevent
        // the default before we decide whether to navigate.
        onClick?.(event);

        // Let the browser handle modified clicks (new tab/window).
        if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey) return;
        if (event.button !== 0) return;
        event.preventDefault();
        void router.navigate({ to: href });
      }}
    >
      {children}
    </a>
  );
}
