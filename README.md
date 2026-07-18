# GeoChess

A a fast-paced geography strategy game where you claim neighboring countries and outsmart your opponents

**[geochess.org](https://geochess.org/)**

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

## Credits

Country data is provided by [REST Countries](https://restcountries.com/).

## Contribution

- Bug fix PRs are always appreciated.
- UI changes or new features should not be submitted without prior discussion. Please open an issue first to propose and discuss them.

Thanks for your understanding and contributions.

## License

[MIT](./LICENSE)

Copyright (c) 2026-present, Akinori Hoshina
