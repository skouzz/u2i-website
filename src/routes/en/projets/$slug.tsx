import { createFileRoute } from "@tanstack/react-router";

import { detailFor } from "@/features/site/resolve";

export const Route = createFileRoute("/en/projets/$slug")({ component: detailFor("/projets") });
