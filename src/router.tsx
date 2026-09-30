import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import { RouteLoadingBar } from "./components/loading";

export const getRouter = () => {
  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    // Red U2I progress strip while a navigation takes longer than ~200ms.
    defaultPendingMs: 200,
    defaultPendingComponent: RouteLoadingBar,
  });

  return router;
};
