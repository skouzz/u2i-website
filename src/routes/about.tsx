import { createFileRoute, redirect } from "@tanstack/react-router";

/**
 * /about → /u2i/a-propos.
 *
 * "Qui sommes-nous" is now the first child of the U2I section rather than a
 * standalone page. Redirecting preserves the old URL instead of 404-ing it.
 */
export const Route = createFileRoute("/about")({
  beforeLoad: () => {
    throw redirect({ to: "/u2i/$slug", params: { slug: "a-propos" } });
  },
});
