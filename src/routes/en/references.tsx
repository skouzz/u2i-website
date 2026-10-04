import { createFileRoute } from "@tanstack/react-router";

import { ReferencesPage } from "@/features/references/page";

export const Route = createFileRoute("/en/references")({ component: ReferencesPage });
