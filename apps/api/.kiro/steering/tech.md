# Technology Stack

## Framework & Runtime

- **NestJS**: Progressive Node.js framework with TypeScript
- **Node.js**: >=24.4.1 (specified in engines)
- **TypeScript**: ES2023 target with strict configuration

## Database & ODM

- **MongoDB**: Primary database with Mongoose ODM
- **Mongoose**: Schema-based solution for MongoDB modeling
- **MongoDB Memory Server**: In-memory database for testing

## Authentication & Security

- **Passport**: Authentication middleware with JWT and Google OAuth strategies
- **bcryptjs**: Password hashing
- **jsonwebtoken**: JWT token management
- **speakeasy**: TOTP 2FA implementation
- **express-rate-limit**: Rate limiting middleware

## AI Integration

- **Google AI (Genkit)**: AI flows for data extraction and analysis
- **Zod**: Schema validation for AI inputs/outputs

## Package Management

- **pnpm**: >=10.14.0 (preferred package manager)

## Development Tools

- **ESLint**: Code linting with TypeScript support
- **Prettier**: Code formatting with import sorting
- **Jest**: Testing framework with coverage support
- **Supertest**: HTTP assertion testing

## Common Commands

```bash
# Development
pnpm install          # Install dependencies
pnpm run start:dev    # Start in watch mode
pnpm run start:debug  # Start with debugging

# Building & Production
pnpm run build        # Build the application
pnpm run start:prod   # Run production build

# Testing
pnpm run test         # Run unit tests
pnpm run test:watch   # Run tests in watch mode
pnpm run test:e2e     # Run end-to-end tests
pnpm run test:cov     # Run tests with coverage

# Code Quality
pnpm run lint         # Lint and fix code
pnpm run format       # Format code with Prettier
```

## Environment Configuration

- Uses `.env` files for configuration
- MongoDB connection via `MONGO_DB_CONNECTION`
- Optional `MONGO_DB_NAME` override
- Google OAuth via `GOOGLE_CLIENT_ID`
- SMTP configuration for email services
