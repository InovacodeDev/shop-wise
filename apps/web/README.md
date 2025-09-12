# Shop Wise Web

A modern React application built with TypeScript, Vite, and TanStack Router for managing shopping lists and purchases with family collaboration features.

## Features

- 🛒 **Shopping List Management**: Create and manage shopping lists
- 👨‍👩‍👧‍👦 **Family Collaboration**: Share lists and purchases with family members
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile devices
- 🌍 **Internationalization**: Multi-language support with Lingui
- 🎨 **Modern UI**: Built with Tailwind CSS and Radix UI components
- 🔒 **Authentication**: Secure user authentication and authorization
- 📊 **Analytics**: Purchase insights and spending analysis

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Routing**: TanStack Router
- **Styling**: Tailwind CSS, Radix UI
- **Forms**: React Hook Form, Zod validation
- **Internationalization**: Lingui
- **State Management**: React Query, Context API
- **Build Tool**: Vite
- **Package Manager**: pnpm
- **Testing**: Vitest, Testing Library

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: Version >=24.4.1
- **pnpm**: Version >=10.14.0
- **Git**: Latest version

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/InovacodeDev/shop-wise-web.git
cd shop-wise-web
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Environment Setup

Create a `.env` file in the root directory with the following variables:

```env
# API Configuration
VITE_API_URL=http://localhost:9001/api

# Authentication
VITE_PERSIST_TOKENS=true

# Other environment variables as needed
```

### 4. Development Server

Start the development server:

```bash
pnpm run dev
```

The application will be available at `http://localhost:5173`

### 5. Build for Production

```bash
pnpm run build
```

The built files will be in the `dist/` directory.

## Available Scripts

- `pnpm run dev` - Start development server
- `pnpm run dev:no-strict` - Start development server without strict mode
- `pnpm run build` - Build for production
- `pnpm run typecheck` - Run TypeScript type checking
- `pnpm run test` - Run tests with Vitest
- `pnpm run extract` - Extract messages for internationalization
- `pnpm run compile` - Compile internationalization messages

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── auth/           # Authentication components
│   ├── dashboard/      # Dashboard widgets
│   ├── family/         # Family management components
│   ├── layout/         # Layout components (header, sidebar, etc.)
│   ├── list/           # Shopping list components
│   ├── scan/           # Receipt scanning components
│   ├── settings/       # Settings and preferences
│   └── ui/             # Base UI components (buttons, forms, etc.)
├── hooks/              # Custom React hooks
├── lib/                # Utility libraries and configurations
├── locales/            # Internationalization files
├── providers/          # React context providers
├── routes/             # Application routes and pages
├── services/           # API services and external integrations
├── styles/             # Global styles and CSS
└── types/              # TypeScript type definitions
```

## Development Guidelines

### Code Quality

- **TypeScript**: Strict type checking is enabled
- **Formatting**: Code is formatted with Prettier
- **Testing**: Write tests for new features

### Internationalization

The app supports multiple languages using Lingui:

1. Add new messages using the `t` function from `@lingui/react/macro`
2. Extract messages: `pnpm run extract`
3. Compile messages: `pnpm run compile`

### Component Patterns

- Use functional components with hooks
- Follow the established UI component patterns
- Use TypeScript for all components
- Implement proper error boundaries

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Make your changes and ensure tests pass
4. Commit your changes: `git commit -m 'Add some feature'`
5. Push to the branch: `git push origin feature/your-feature-name`
6. Open a pull request

## CI/CD

This project uses GitHub Actions for continuous integration:

- **CI Pipeline**: Runs on every PR and push to main
    - Security audit
    - Code formatting check
    - TypeScript type checking
    - Unit tests
    - Application build

- **Build Verification**: Runs on pushes to main
    - Full CI pipeline
    - Build artifacts generation

### Branch Protection

The `main` branch is protected and requires:

- All CI checks to pass
- Up-to-date branches before merging

## Deployment

The application can be deployed to any static hosting service:

1. Build the application: `pnpm run build`
2. Deploy the `dist/` directory to your hosting service
3. Configure environment variables on your hosting platform

## Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/InovacodeDev/shop-wise-web/issues) page
2. Create a new issue with detailed information
3. Contact the maintainers

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
