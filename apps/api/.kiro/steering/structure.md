# Project Structure & Architecture

## Directory Organization

```
src/
├── ai/                    # AI integration (Google Genkit flows)
│   ├── dto/              # AI request/response DTOs
│   ├── flows/            # AI processing flows
│   └── genkit.ts         # AI configuration
├── auth/                 # Authentication & authorization
├── categories/           # Product categorization
├── families/             # Family/household management
├── models/               # TypeScript interfaces
├── mongo/                # MongoDB connection & utilities
├── pantry-items/         # Pantry inventory management
├── products/             # Product catalog
├── purchase-items/       # Individual purchase line items
├── purchases/            # Purchase/receipt records
├── shopping-lists/       # Collaborative shopping lists
├── stores/               # Store information
├── types/                # Custom type definitions
├── users/                # User management
└── utils/                # Shared utilities
```

## Module Architecture Patterns

### Standard NestJS Module Structure

Each feature module follows this pattern:

```
feature/
├── dto/                  # Data Transfer Objects
│   ├── create-*.dto.ts
│   └── update-*.dto.ts
├── schemas/              # Mongoose schemas
│   └── *.schema.ts
├── *.controller.ts       # REST endpoints
├── *.service.ts          # Business logic
└── *.module.ts           # Module definition
```

### Key Conventions

- **Controllers**: Handle HTTP requests, use guards for authentication
- **Services**: Contain business logic, inject dependencies
- **DTOs**: Use class-validator decorators for validation
- **Schemas**: Mongoose schemas with TypeScript interfaces
- **Models**: Pure TypeScript interfaces in `/models` directory

### Import Patterns

- Use `@/` alias for src imports (configured in tsconfig.json)
- Group imports: third-party → internal → relative
- Prettier automatically sorts imports

### Authentication Flow

- JWT-based authentication with refresh tokens
- `PassportJwtAuthGuard` for protected routes
- `AuthenticatedRequest` interface for typed request objects
- Rate limiting on auth endpoints

### Database Patterns

- Mongoose ODM with TypeScript schemas
- Document interfaces extend `Document<string>`
- Base models use `BaseModel<string>` interface
- Timestamps handled automatically via schema options

### AI Integration

- Separate flows in `/ai/flows` for different AI operations
- DTOs for structured AI inputs/outputs
- Service layer abstracts AI complexity from controllers
