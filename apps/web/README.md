# Web Client

## Setup

### Prerequisites

- [Node.js](https://nodejs.org)
- [pnpm](https://pnpm.io/installation)

Install devendencies:

```sh
pnpm install
```

Run development server:

```sh
pnpm dev
```

## Generate API Client with [OpenAPI Generator](https://openapi-generator.tech/)

```sh
openapi-generator generate -i ../../server/openapi/openapi.yml -g typescript-fetch -o ./src/services/
```
