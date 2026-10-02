import { createFileRoute } from "@tanstack/react-router";

import { hubFor } from "@/features/site/resolve";

export const Route = createFileRoute("/expertises/")({ component: hubFor("/expertises") });
