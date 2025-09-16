import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import Providers from '../providers';

interface RootSearch {
  lng?: string
  resetSuccess?: string
  token?: string
  tab?: string
}

export const Route = createRootRoute({
  validateSearch: (search): RootSearch => ({
    lng: search.lng as string,
    resetSuccess: search.resetSuccess as string,
    token: search.token as string,
    tab: search.tab as string,
  }),
  component: () => (
    <Providers>
      <Outlet />
      <TanStackRouterDevtools />
    </Providers>
  ),
});
