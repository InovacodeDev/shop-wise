import './styles/app.css';

import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import { SpeedInsights } from '@vercel/speed-insights/react';
import { createRouter } from "./router";
import Providers from "./providers";

const router = createRouter();

declare module "@tanstack/react-router" {
    interface Register {
        router: typeof router;
    }
}

const rootElement = document.getElementById("root")!;
if (!rootElement.innerHTML) {
    const root = ReactDOM.createRoot(rootElement);

    const App = (
        <Providers>
            <RouterProvider router={router} />
            <SpeedInsights />
        </Providers>
    );

    // Conditionally disable StrictMode for testing
    const useStrictMode = import.meta.env.VITE_DISABLE_STRICT_MODE !== 'true';

    root.render(
        useStrictMode ? <StrictMode>{App}</StrictMode> : App
    );
}
