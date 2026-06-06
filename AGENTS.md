# GeoChess

## Directory Structure

Key paths are below:

- `apps/web/` - Vue application for web client
  - `src/components/` - Components; the directory are separated based on layouts and pages, except for `shared/` directory
    - `shared/` - Components used across pages and layouts
  - `src/composables/` - Shared reactive logic and server state management with TanStack Query
  - `src/pages/` - Page components
  - `src/services/` - Auto-generated API client from OpenAPI Generator
  - `src/stories/` - Stories for Storybook; the subdirectory structure mirrors `apps/web/src/` (e.g. `stories/components/shared/`, `stories/pages/`)
  - `src/tests/unit/` - Unit tests; the subdirectory structure mirrors `apps/web/src/` (e.g. `unit/components/`, `unit/composables/`, `unit/pages/`)
- `server/` - Backend (AWS Lambda + SST)
  - `openapi/` - OpenAPI spec
  - `src/` - Anything which should be included in the build artifact
    - `api/` - Handler; the subdirectory structure mirrors the endpoint structure (e.g. `api/v1/health/`)
    - `core/` - Shared infrastructure and cross-cutting concerns, such as logging, authentication, configuration and utilities
    - `data/` - Static application data bundled with Lambda
    - `features/` - Feature-oriented business modules, such as repositories, services, models and domain logic

## Coding Guidelines

- Always check and resolve lint and format errors after modifying code
- Always run unit test and make sure to pass all test cases after modifying code
- Do not manually modify files under `apps/web/src/services/`
- Always keep API handlers, OpenAPI spec, and SST infrastructure definitions in sync
- Always regenerate API client with OpenAPI Generator after updating API endpoint and OpenAPI spec inside `server/openapi/`
- Always create a composable to manage server state, instead of using `fetch`. If it doesn't have to manage the state of the API response, the file name should be `use{api-name}Api.ts` (e.g. `useHealthApi.ts`). If it manages the state of API responses, the file name should be `use{api-name}Query.ts` (e.g. `useUserQuery.ts`)
- Always use the `@` alias instead of relative paths for imports within `apps/web/src/`

## Development Commands

### Frontend

Execute commands below at `apps/web/`:

- `pnpm lint` - Run linter
- `pnpm lint:fix` - Automatically fix lint issues
- `pnpm format` - Automatically fix format issues
- `pnpm format:check` - Check format issues
- `pnpm test:browser` - Run unit test with browser mode
- `pnpm generate:api` - Generate API client with OpenAPI Generator

### Backend

Execute commands below at `server/`:

- `uv run ruff check .` - Run linter
- `uv run ruff check . --fix` - Automatically fix lint issues
- `uv run pytest` - Run unit test

## Agent skills

### Issue tracker

Issues are tracked in GitHub Issues for this repository. See `docs/agents/issue-tracker.md`.

### Triage labels

Use the default GitHub label vocabulary for the five canonical triage states. See `docs/agents/triage-labels.md`.

### Domain docs

This repo uses a single-context domain-doc layout. See `docs/agents/domain.md`.
