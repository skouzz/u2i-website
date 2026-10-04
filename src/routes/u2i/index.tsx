import { createFileRoute } from "@tanstack/react-router";

import { hubFor } from "@/features/site/resolve";

export const Route = createFileRoute("/u2i/")({ component: hubFor("/u2i") });
