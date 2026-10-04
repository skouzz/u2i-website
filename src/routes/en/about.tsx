import { createFileRoute, redirect } from "@tanstack/react-router";

/** English mirror of the /about → /u2i/a-propos redirect. */
export const Route = createFileRoute("/en/about")({
  beforeLoad: () => {
    throw redirect({ to: "/en/u2i/$slug", params: { slug: "a-propos" } });
  },
});
