import { createFileRoute } from "@tanstack/react-router";

import { detailFor } from "@/features/site/resolve";

export const Route = createFileRoute("/u2i/$slug")({ component: detailFor("/u2i") });
