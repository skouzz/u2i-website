import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import { PageSkeleton } from "./components/PageSkeleton";

export const getRouter = () => {
  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    // Hold the current page briefly so a fast navigation never flashes a
    // placeholder; only genuinely slow routes fall through to the skeleton.
    defaultPendingMs: 120,
    defaultPendingMinMs: 350,
    // The skeleton fills the content area while the new route resolves, so the
    // footer can't jump up under the navbar mid-navigation.
    defaultPendingComponent: PageSkeleton,
  });

  return router;
};
