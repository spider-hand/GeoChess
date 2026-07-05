# GeoChess

A location-based multiplayer strategy game

## Setup

- [Web Client](./apps/web/README.md)
- [Server](./server/README.md)

If you want to start the development environment from the repository root:

```sh
export AWS_PROFILE=<your-profile>
```

Then

```sh
pnpm dev
```

This starts:
- Frontend development server
- SST local development environment

Refer to the server setup guide for AWS SSO authentication and profile configuration.

## Tech Stack

- Frontend: Vue
- Backend: AWS Lambda
- Authentication: Firebase Authentication
- DB: Firebase Realtime Database, PostgreSQL
- Message Queue: AWS SQS
- Hosting: Cloudflare
- Infrastructure: SST