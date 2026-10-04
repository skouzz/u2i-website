import { createFileRoute, redirect } from "@tanstack/react-router";

/** English mirror of the /secteurs → /industries redirect. */
export const Route = createFileRoute("/en/secteurs")({
  beforeLoad: () => {
    throw redirect({ to: "/en/industries" });
  },
});
