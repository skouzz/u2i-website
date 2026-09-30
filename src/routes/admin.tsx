import { createFileRoute } from "@tanstack/react-router";

import { AdminDashboard } from "@/features/admin/app";

export const Route = createFileRoute("/admin")({ component: AdminDashboard });
