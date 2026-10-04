import { createFileRoute } from "@tanstack/react-router";

import { ContactPage } from "@/features/contact/page";

export const Route = createFileRoute("/en/contact")({ component: ContactPage });
