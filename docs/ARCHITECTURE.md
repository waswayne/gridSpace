# GridSpace Backend Architecture

This backend follows a layered architecture that enforces SOLID and DRY principles to keep the codebase modular, maintainable, and scalable.

```
src/
├── app.js                  # Express application bootstrap
├── index.js                # Server entry point
├── config/                 # Application and environment configuration
│   └── env.js
├── controllers/            # HTTP controllers orchestrating requests
├── services/               # Domain logic isolated from transport concerns
├── routes/                 # Route definitions mapping to controllers
├── middlewares/            # Cross-cutting concerns (logging, errors, validation)
├── repositories/           # Data access abstractions for persistence (Mongo ready)
├── models/                 # Mongoose schemas and models
├── validations/            # Joi schemas for request validation
└── utils/                  # Shared helpers (errors, response formatting)
```

## Design Principles

- **Single Responsibility (S)**: Each layer tackles a specific concern: HTTP orchestration in controllers, domain rules in services, and persistence inside repositories.
- **Open/Closed (O)**: Components expose contracts (services, repositories) that can be extended without modifying callers.
- **Liskov Substitution (L)**: Interfaces between layers (e.g., services depending on repositories) allow swapping implementations without breaking behavior.
- **Interface Segregation (I)**: Services expose cohesive methods tailored to their consumers, avoiding bulky God interfaces.
- **Dependency Inversion (D)**: High-level modules (controllers) depend on abstractions (service classes), not concretions, enabling easy substitution.

## Request Lifecycle

1. **Route** selects the relevant controller for the incoming path and method.
2. **Validation middleware** ensures request payloads conform to schema contracts before hitting business logic.
3. **Controller** invokes application services while handling transport-specific mapping (req/res).
4. **Service** contains business logic and delegates data access to repositories.
5. **Repository** abstracts persistence. Methods are stubbed, ready for a MongoDB-backed implementation.
6. **Response helpers** standardize success/error structures, while global middlewares manage logging, metrics, and errors.

## Cross-Cutting Concerns

- **Configuration**: Environment variables validated on startup and exposed via typed accessors.
- **Logging**: `winston` handles structured logs; `morgan` forwards HTTP access logs.
- **Error Handling**: Centralized middleware transforms domain errors into HTTP responses.
- **Security**: `helmet`, `cors`, `express-rate-limit`, and `compression` protect and optimize the API.
- **Validation**: `Joi` schemas enforced through dedicated middleware ensure consistent contracts.
- **Database**: `mongoose` connection lifecycle managed via `config/db.js`, enabling easy integration of MongoDB models.

This structure scales by adding modules within `controllers/`, `services/`, `routes/`, and `repositories/` without cross-cutting side-effects.
