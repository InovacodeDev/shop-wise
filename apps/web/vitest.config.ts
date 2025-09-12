import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig(({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  test: {
  environment: 'jsdom',
    globals: true,
  include: ['src/**/*.spec.ts', 'src/**/*.spec.tsx', 'test/**/*.spec.ts', 'test/**/*.spec.tsx'],
    deps: {
      // Inline TanStack router plugin and related packages to avoid Vite plugin transforms
      inline: ['@tanstack/router-plugin', '@tanstack/router', '@tanstack/react-router'],
    },
    // Resolve path alias used in the app ("@" -> src)
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
    // Increase timeout slightly for CI/slow machines
    testTimeout: 10000,
  },
} as any));
