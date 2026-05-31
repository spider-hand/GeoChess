# Server

## Setup

### Prerequisites

- [Node.js](https://nodejs.org)
- [pnpm](https://pnpm.io/installation)
- [Python 3.14](https://www.python.org/downloads/)
- [uv](https://docs.astral.sh/uv/getting-started/installation/)
- [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-prereqs.html#getting-started-prereqs-iam)

This doc assumes that you already configured IAM Identity Center authentication. Please follow [this instructions](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-sso.html).

Verify available profiles:

```sh
cat ~/.aws/config
```

Expected output:
```sh
[profile my-profile] 
sso_session = my-sso 
sso_account_id = 123456789012 
sso_role_name = AdministratorAccess
region = ap-northeast-1
```

Login using AWS SSO:

```sh
aws sso login --profile <your-profile>
```

Set the profile for the current shell:

```sh
export AWS_PROFILE=<your-profile>
```

Verify authentication:

```sh
aws sts get-caller-identit
```

Expected output:

```sh
{
  "Account": "...",
  "Arn": "...",
  "UserId": "..."
}
```

Install dependencies:

```sh
uv sync
```

```sh
pnpm install
```

Start development environment:

```sh
pnpm dev
```

Run unit tests:

```sh
uv run pytest
```

Run Linter:

```sh
uv run ruff check .
```

```sh
uv run ruff check . --fix
```
