# Project Structure & Organization

## Root Directory

- **Configuration Files**: Package management (`package.json`, `pnpm-lock.yaml`), build tools (`vite.config.mts`, `tsconfig.json`), styling (`tailwind.config.ts`)
- **Documentation**: `README.md` and `docs/` folder for project documentation
- **Entry Point**: `index.html` serves as the main HTML template

## Source Code Structure (`src/`)

```
src/
├── components/          # Reusable UI components
│   ├── auth/           # Authentication-related components
│   ├── dashboard/      # Dashboard and insights components
│   ├── family/         # Family management components
│   ├── layout/         # Layout and navigation components
│   ├── list/           # Shopping list components
│   ├── scan/           # Receipt scanning components
│   ├── settings/       # Settings and preferences components
│   └── ui/             # shadcn/ui base components
├── hooks/              # Custom React hooks
├── lib/                # Utility functions and shared logic
├── locales/            # Internationalization files (en/pt)
├── providers/          # React context providers
├── routes/             # TanStack Router route definitions
├── services/           # API services and external integrations
├── styles/             # Global CSS and styling
├── types/              # TypeScript type definitions
├── main.tsx            # Application entry point
└── router.tsx          # Router configuration
```

## Component Organization

- **Feature-based**: Components grouped by application feature (auth, dashboard, family, etc.)
- **UI Components**: Base components from shadcn/ui in `components/ui/`
- **Shared Components**: Common components like icons in `components/`

## File Naming Conventions

- **Components**: kebab-case with `.tsx` extension (e.g., `login-form.tsx`)
- **Hooks**: Prefixed with `use-` (e.g., `use-auth.tsx`)
- **Services**: Suffixed with `-service` (e.g., `analytics-service.ts`)
- **Types**: Descriptive names in kebab-case (e.g., `ai-flows.ts`)

## Import Aliases

- `@/components` → `src/components`
- `@/lib` → `src/lib`
- `@/hooks` → `src/hooks`
- `@/` → `src/` (general alias)

## Code Style Guidelines

- **Prettier Configuration**: 4-space tabs, single quotes, 120 character line width
- **Import Order**: Third-party modules, then internal modules with automatic sorting
- **TypeScript**: Strict mode enabled with path mapping
- **Component Structure**: Functional components with TypeScript interfaces

## Testing Structure

- **Unit Tests**: Co-located with source files using `.spec.tsx` extension
- **E2E Tests**: Separate `test/e2e/` directory
- **Test Framework**: Vitest with Testing Library for component testing

## Asset Organization

- **Public Assets**: Static files in `public/` directory
- **Fonts**: Managed through npm packages (@fontsource)
- **Icons**: FontAwesome and Lucide icon libraries