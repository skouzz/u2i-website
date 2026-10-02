import { createFileRoute, redirect } from "@tanstack/react-router";

/**
 * /secteurs → /industries.
 *
 * The section was renamed to "Industries" and its children rewritten. A 301
 * keeps the existing links, search-engine equity and bookmarks working instead
 * of leaving them on a 404.
 */
export const Route = createFileRoute("/secteurs")({
  beforeLoad: () => {
    throw redirect({ to: "/industries" });
  },
});
