# GeoChess

## Directory Structure

Key paths are below:

- `apps/web/` - Vue application for web client
  - `src/components/` - Components; the directory are separated based on layouts and pages, except for `shared/` directory
    - `shared/` - Components used across pages and layouts
  - `src/composables/` - Shared reactive logic and server state management with TanStack Query
  - `src/locales` - Translations; the structure of the entries mirrors `apps/web/src/` (e.g. `components/shared/LanguageSelector/`)
  - `src/pages/` - Page components
  - `src/services/` - Auto-generated API client from OpenAPI Generator
  - `src/stories/` - Stories for Storybook; the subdirectory structure mirrors `apps/web/src/` (e.g. `stories/components/shared/`, `stories/pages/`)
  - `src/tests/unit/` - Unit tests; the subdirectory structure mirrors `apps/web/src/` (e.g. `unit/components/`, `unit/composables/`, `unit/pages/`)
- `server/` - Backend (AWS Lambda + SST)
  - `db/` - Migration files
  - `openapi/` - OpenAPI spec
  - `src/` - Anything which should be included in the build artifact
    - `api/` - Handler; the subdirectory structure mirrors the endpoint structure (e.g. `api/v1/health/`)
    - `core/` - Shared infrastructure and cross-cutting concerns, such as logging, authentication, configuration and utilities
    - `data/` - Static application data bundled with Lambda
    - `features/` - Feature-oriented business modules, such as repositories, services, models and domain logic
    - `jobs/` - Scheduled functions

## Coding Guidelines

### General

#### Simplicity
- Do not introduce new abstraction layers, helper functions, wrapper composables, factories, adapters, or indirection unless at least one of these is true:
  - the same logic is already used in 2 or more concrete call sites
  - the abstraction removes real duplciation that already exists
  - the abstraction is required by a framework, library, or testability constraint
- Do not add speculative branches for future use cases that are not currently required
- Do not create optional code paths for scenarios that are not exerised by the current product requirements
- Avoid 'helper-first' design. Always start from the most direct implementation, then extract only after duplication or repeated branching is visible in the codebase

### Frontend

- Always create files for unit tests and stories when creating a new component
- Always write one story per meaningful branch
- Always write unit tests with a focus on branch coverage. Make sure to test rendered structure, emitted events, state branches and composed component branches
- Do not add test cases for something which doesn't introduce branching or conditional behavior
- Do not manually modify files under `apps/web/src/services/`
- Always create a composable to manage server state, instead of using `fetch`. If it doesn't have to manage the state of the API response, the file name should be `use{api-name}Api.ts` (e.g. `useHealthApi.ts`). If it manages the state of API responses, the file name should be `use{api-name}Query.ts` (e.g. `useUserQuery.ts`)
- Always use the `@` alias instead of relative paths for imports within `apps/web/src/`
- Always use `@lucide/vue` for icons
- Always update entries in locale files for all supported languages accordingly as we add, update or remove any user-facing text in `apps/web/src/`
- Always make Vue props required whenever possible, and avoid defining default values unless they are truly needed
- Always run `pnpm lint`, `pnpm format:check`, `pnpm test:browser` and `pnpm exec vue-tsc --noEmit` and make sure to resolve all errors before finishing work

### Backend

- Always keep API handlers, OpenAPI spec, and SST infrastructure definitions in sync
- Always create a new migration file when modifying the database schema. Name migration files as `{currentDate}_{title}.sql`. Every migration file must contain both `-- migrate:up` and `-- migrate:down` sections.
- Always run `pnpm generate:api` at `apps/web/` after updating API endpoint and OpenAPI spec inside `server/openapi/`
- Always run `uv run ruff check .` and `uv run pytest` and make sure to resolve all errors before finishing work

## Development Commands

### Frontend

Execute commands below at `apps/web/`:

- `pnpm lint` - Run linter
- `pnpm lint:fix` - Automatically fix lint issues
- `pnpm format` - Automatically fix format issues
- `pnpm format:check` - Check format issues
- `pnpm test:browser` - Run unit test with browser mode
- `pnpm exec vue-tsc --noEmit` - Run type check
- `pnpm generate:api` - Generate API client with OpenAPI Generator

### Backend

Execute commands below at `server/`:

- `uv run ruff check .` - Run linter
- `uv run ruff check . --fix` - Automatically fix lint issues
- `uv run pytest` - Run unit test
- `pnpm db:migrate` - Apply pending migration
- `pnpm db:new <migration_name>` - Create a new migration
- `pnpm db:rollback` - Rollback the latest migration
- `pnpm db:status` - Check migration status
