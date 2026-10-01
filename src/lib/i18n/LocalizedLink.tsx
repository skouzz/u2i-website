import { useRouter } from "@tanstack/react-router";
import type { ReactNode } from "react";

import { useI18n } from "./index";

type Props = {
  /** Locale-agnostic internal path, e.g. "/about" or "/actualites/my-post". */
  to: string;
  children: ReactNode;
  className?: string;
  /** Passed through to the underlying anchor. */
  [key: `data-${string}`]: unknown;
  "aria-label"?: string;
  title?: string;
};

/**
 * Internal link that keeps SPA navigation while honouring the active locale.
 *
 * TanStack's <Link> needs a statically typed `to`, but our destinations depend
 * on the runtime locale and on slugs that only exist once the CMS responds.
 * This renders a normal anchor and hands the click to the router, so navigation
 * stays client-side and middle-click / open-in-new-tab keep working.
 */
export function LocalizedLink({ to, children, ...rest }: Props) {
  const router = useRouter();
  const { link } = useI18n();
  const href = link(to);

  return (
    <a
      href={href}
      {...rest}
      onClick={(event) => {
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
