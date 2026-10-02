import { createFileRoute } from "@tanstack/react-router";

import { hubFor } from "@/features/site/resolve";

export const Route = createFileRoute("/en/expertises/")({ component: hubFor("/expertises") });
