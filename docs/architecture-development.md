# Architecture & Development

## Software Architecture

MMM-Fuel-NSW follows a layered architecture pattern designed for maintainability and testability. The codebase is structured as a MagicMirror² module with separate backend (Node.js) and frontend (browser) components.

### Backend Architecture (`src/backend/`)

The backend follows a **Repository Pattern** with clear separation of concerns:

```
src/backend/
├── Backend.ts              # Main backend entry point
├── BackendTypes.ts         # Backend-specific TypeScript interfaces
├── Service/
│   ├── BackendService.ts   # Business logic and orchestration
│   └── Repository/
│       ├── BackendRepository.ts    # Main data access layer
│       ├── Connector/
│       │   └── FuelApiConnector.ts # External API communication
│       ├── Mapper/
│       │   ├── BackendMapper.ts    # Data transformation logic
│       │   └── Util/               # Mapper utility functions
│       │       ├── AddressUtils.ts # Address normalization
│       │       ├── LocationUtils.ts # Location processing
│       │       ├── BrandUtils.ts   # Brand logo handling
│       │       └── TimeUtils.ts    # Time calculations
│       └── Util/
│           └── BoundingBoxUtils.ts # Geographic calculations
└── Service/Util/
    └── ConfigValidationUtils.ts    # Configuration validation
```

#### Key Architectural Patterns

- **Layered Architecture**: Data flows through defined layers (Service → Repository → Connector/Mapper)
- **Dependency Injection**: Services receive dependencies via constructor injection
- **Single Responsibility**: Each class has one clear purpose
- **Tree Structure**: Information flows through layers; adjacent files cannot import each other directly
- **Pure Functions**: Utility functions are stateless and testable

#### Data Flow

1. **BackendService** receives requests and orchestrates operations
2. **BackendRepository** handles data retrieval and filtering
3. **FuelApiConnector** communicates with external NSW Fuel Check API
4. **BackendMapper** transforms raw API data into domain objects
5. **Utility classes** provide pure functions for data processing

### Frontend Architecture (`src/frontend/`)

```
src/frontend/
├── Frontend.ts         # MagicMirror module lifecycle
└── FrontendService.ts  # Display logic and DOM manipulation
```

The frontend is responsible for:

- Managing the MagicMirror module lifecycle (init, update, suspend)
- Rendering data using Nunjucks templates
- Handling user configuration and styling

### Templates (`templates/`)

Nunjucks templates define the HTML structure:

- `MMM-Fuel-NSW.njk`: Main template
- `ListDisplay.njk`: Detailed list format
- `StaticDisplay.njk`: Compact table format

### Build Process

TypeScript source files in `src/` are compiled to JavaScript files in the root:

- `src/backend/Backend.ts` → `node_helper.js`
- `src/frontend/Frontend.ts` → `MMM-Fuel-NSW.js`

### Testing Strategy

Comprehensive test coverage with Jest:

- **Unit Tests**: Individual functions and classes
- **Integration Tests**: Component interactions
- **E2E Tests**: Full API integration

Test files mirror source structure with `.test.ts` extensions.

### Key Design Decisions

- **No Cross-Imports Between Utils**: Utility functions cannot import other utilities to maintain tree structure
- **Synchronous Mapping**: Data transformation is synchronous for performance
- **External API Isolation**: All external calls go through dedicated connector classes
- **Configuration-Driven**: All behavior controlled by user configuration
- **Type Safety**: Full TypeScript coverage for reliability

## Development Workflow

### Prerequisites

- Node.js (v14+)
- MagicMirror² development environment
- Git

### Local Development Setup

1. **Clone and Install**

   ```bash
   git clone https://github.com/bughaver/MMM-Fuel-NSW.git
   cd MMM-Fuel-NSW
   npm install
   ```

2. **Development Build**

   ```bash
   npm run dev:watch  # Auto-rebuild on changes
   ```

3. **Testing**
   ```bash
   npm test           # Run all tests
   npm run lint       # Check code style
   ```

### Code Organization Principles

#### File Naming

- PascalCase for classes (`BackendService.ts`)
- camelCase for instances (`backendService`)
- kebab-case for files (`fuel-api-connector.ts`)

#### Import Order

1. External dependencies
2. Internal modules (absolute paths)
3. Relative imports (sibling files)
4. Type imports

#### Error Handling

- Use specific error types
- Log errors with context
- Fail fast for configuration errors
- Graceful degradation for runtime errors

### Contributing Guidelines

#### Code Style

- ESLint configuration enforced
- Prettier for consistent formatting
- TypeScript strict mode enabled

#### Testing Requirements

- Unit tests for all utilities
- Integration tests for services
- E2E tests for critical paths
- 100% code coverage

#### Commit Messages

Follow conventional commits:

```
feat: add new fuel type filtering
fix: resolve location parsing bug
docs: update installation guide
```

#### Pull Request Process

1. Create feature branch from `main`
2. Write tests for new functionality
3. Ensure all tests pass
4. Update documentation if needed
5. Submit PR with description

### API Integration

#### NSW Fuel Check API

- RESTful API for fuel price data
- Requires no authentication
- Rate limiting: respect reasonable intervals
- Data format: JSON responses

#### Error Scenarios

- Network timeouts
- Invalid responses
- API changes
- Geographic boundary issues

### Performance Considerations

#### Frontend

- Efficient DOM updates
- Minimal re-renders
- Optimized template rendering
- Resource loading strategies

#### Backend

- Synchronous data processing
- Efficient filtering algorithms
- Memory-conscious data structures
- Fast TypeScript compilation

### Deployment

#### Production Build

```bash
npm run build  # Creates optimized JS files
```

#### MagicMirror Integration

- Module files copied to `modules/` directory
- Configuration added to `config.js`
- Hot-reload supported during development

### Monitoring & Debugging

#### Logging

- Structured logging with context
- Different log levels (debug, info, warn, error)
- MagicMirror log integration

#### Debugging

- Source maps for development
- Browser dev tools for frontend
- Node.js debugging for backend
- Test-driven development approach

### Future Enhancements

#### Potential Features

- Multiple fuel type comparison
- Price history tracking
- Route-based station finding
- Favorite stations
- Price alerts

#### Technical Improvements

- Caching layer
- Background sync
- Progressive Web App features
- Advanced filtering options
