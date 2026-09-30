import { createFileRoute } from "@tanstack/react-router";

import { NewsListPage } from "@/features/news/list";

export const Route = createFileRoute("/actualites/")({ component: NewsListPage });
