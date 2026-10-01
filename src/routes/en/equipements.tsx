import { createFileRoute } from "@tanstack/react-router";

import { EquipmentsPage } from "@/features/equipment/page";

export const Route = createFileRoute("/en/equipements")({ component: EquipmentsPage });
