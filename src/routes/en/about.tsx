import { createFileRoute } from "@tanstack/react-router";

import { AboutPage } from "@/features/about/page";

export const Route = createFileRoute("/en/about")({ component: AboutPage });
