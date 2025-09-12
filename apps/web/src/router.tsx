import { createRouter as createTanStackRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export function createRouter() {
    const router = createTanStackRouter({
        routeTree,
        scrollRestoration: true,
        defaultPreload: 'intent',
        defaultPreloadStaleTime: 0,
    });

    return router;
}
