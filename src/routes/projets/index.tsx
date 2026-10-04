import { createFileRoute } from "@tanstack/react-router";

import { hubFor } from "@/features/site/resolve";

export const Route = createFileRoute("/projets/")({ component: hubFor("/projets") });
