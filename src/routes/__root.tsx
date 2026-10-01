import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import type { ReactNode } from "react";

import appCss from "../styles.css?url";
import logoImg from "../assets/logo-u2i-removebg-preview.png";
import { Navbar } from "../components/layout/Navbar";
import { Footer } from "../components/layout/Footer";
import { I18nProvider, useI18n } from "@/lib/i18n";
import { LocalizedLink } from "@/lib/i18n/LocalizedLink";

function NotFoundComponent() {
  const { t } = useI18n();
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">{t("common.notFound")}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{t("common.notFoundBody")}</p>
        <div className="mt-6">
          <LocalizedLink
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            {t("common.backHome")}
          </LocalizedLink>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  const { t, link } = useI18n();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          {t("common.errorTitle")}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">{t("common.errorBody")}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            {t("common.retry")}
          </button>
          <a
            href={link("/")}
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            {t("common.backHome")}
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "U2I Process — Tuyauterie Inox & Soudure Orbitale" },
      {
        name: "description",
        content:
          "Univers Inox Industriel (U2I) — chaudronnerie, tuyauterie process et soudure orbitale pour les secteurs pharmaceutique, agroalimentaire, chimique et cosmétique.",
      },
      { name: "author", content: "U2I Process" },
      { property: "og:title", content: "U2I Process — Tuyauterie Inox & Soudure Orbitale" },
      {
        property: "og:description",
        content:
          "Spécialiste tunisien de la tuyauterie inox process et de la soudure orbitale, partenaire officiel AXXAIR depuis 2015.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: logoImg, type: "image/png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Oswald:wght@500;600;700&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  // The shell is a single static file shared by every route, so the server
  // cannot know which language it is rendering. Default to French (the source
  // language) and correct it before the body paints, so an English page is
  // never announced as French by a screen reader or parsed as French by a
  // crawler. Kept inline and tiny so it runs synchronously in <head>.
  return (
    <html lang="fr">
      <head>
        <HeadContent />
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{if(/^\\/en(\\/|$)/.test(location.pathname)){document.documentElement.lang='en'}}catch(e){}",
          }}
        />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <I18nProvider>
        <div className="w-full max-w-full overflow-x-hidden flex flex-col min-h-screen">
          <Navbar />
          {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
          <div className="grow w-full max-w-full overflow-x-hidden">
            <Outlet />
          </div>
          <Footer />
        </div>
      </I18nProvider>
    </QueryClientProvider>
  );
}
