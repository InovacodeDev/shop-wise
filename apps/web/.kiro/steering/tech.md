# Technology Stack & Build System

## Core Technologies

- **Frontend Framework**: React 18 with TypeScript
  -- **Build Tool**: Vite 7.1.2 with development server on port 9000
- **Routing**: TanStack Router with file-based routing and auto code-splitting
- **State Management**: TanStack Query for server state, React hooks for local state
- **Styling**: Tailwind CSS with shadcn/ui components and CSS variables for theming
- **Internationalization**: Lingui for i18n support (English/Portuguese)
- **Package Manager**: pnpm (required version >=10.14.0)
- **Node Version**: >=24.4.1

## Key Libraries

- **UI Components**: Radix UI primitives with shadcn/ui
- **Forms**: React Hook Form with Zod validation
- **HTTP Client**: Axios with cookie jar support
- **Icons**: FontAwesome and Lucide icons
- **Charts**: Recharts for data visualization
- **Date Handling**: date-fns
- **PDF Processing**: pdf-lib for receipt processing

## Development Tools

- **Testing**: Vitest with Testing Library and jsdom
- **Type Checking**: TypeScript with strict mode
- **Code Formatting**: Prettier with custom import ordering
- **Linting**: ESLint (implied by project structure)

## Common Commands

```bash
# Development
pnpm dev              # Start development server
pnpm build            # Build for production
pnpm typecheck        # Run TypeScript type checking
pnpm test             # Run tests with Vitest

# Internationalization
pnpm extract          # Extract translatable strings
pnpm compile          # Compile translations to TypeScript

# Package Management
pnpm install          # Install dependencies
```

## Build Configuration

- **Vite Config**: Uses React plugin, TanStack Router plugin, and Lingui plugin
- **API Proxy**: Development server proxies `/api` requests to `localhost:9001`
- **Path Aliases**: `@/*` maps to `./src/*`
- **Auto-generated**: Router tree is auto-generated in `src/routeTree.gen.ts`
