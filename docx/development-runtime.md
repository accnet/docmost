# Development And Runtime

## Local Docker Workflow

Start:

```bash
cp .env.docker.example .env.docker
docker compose --env-file .env.docker up --build -d
```

Default URL:

```bash
http://localhost:8090
```

Stop:

```bash
docker compose --env-file .env.docker down
```

Logs:

```bash
docker compose --env-file .env.docker logs -f nginx app collab
```

## Local Non-Docker Development

Use `.env.example` as the starting point for local development outside Docker.

Main commands:

```bash
corepack pnpm run client:dev
corepack pnpm run server:dev
```

## Useful Validation Commands

Client build:

```bash
corepack pnpm -C apps/client build
```

Server build:

```bash
corepack pnpm -C apps/server build
```

Auth regression e2e:

```bash
corepack pnpm run test:e2e:auth
```

## Testing Notes

Current automated coverage added in this fork includes:

- server auth/workspace middleware tests
- Playwright auth redirect regression tests

The Playwright wrapper script downloads a local `libasound` package when needed so the auth e2e can run on this machine without system-wide package changes.
