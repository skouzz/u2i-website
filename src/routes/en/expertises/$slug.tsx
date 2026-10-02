import { createFileRoute } from "@tanstack/react-router";

import { detailFor } from "@/features/site/resolve";

export const Route = createFileRoute("/en/expertises/$slug")({
  component: detailFor("/expertises"),
});
