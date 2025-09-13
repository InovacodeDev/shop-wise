import { lingui } from '@lingui/vite-plugin';
// import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
    server: {
        port: 9090,
        proxy: {
            // Proxy API requests during development to backend to avoid CORS issues
            '/api': {
                target: 'http://localhost:3001',
                changeOrigin: true,
                secure: false,
                rewrite: (path) => path.replace(/^\/api/, ''),
            },
        },
    },
    plugins: [
        visualizer({ open: true, filename: 'bundle-analysis.html' }),
        // tailwindcss(),
        tsconfigPaths(),
        tanstackRouter({
            target: 'react',
            autoCodeSplitting: true,
        }),
        react({
            babel: {
                plugins: ['@lingui/babel-plugin-lingui-macro'],
            },
        }),
        lingui(),
    ],
    // Increase the chunk size warning limit from the default 500KB to 1000KB
    build: {
        chunkSizeWarningLimit: 1000,
        outDir: 'dist',
    },
});
