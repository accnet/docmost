# Architecture

## Frontend

The frontend lives in `apps/client` and uses:

- React
- React Router
- Mantine
- TanStack Query
- Jotai

The client is bundled by Vite and served by the backend/static module in production.

## Backend

The backend lives in `apps/server` and uses:

- NestJS
- Kysely
- PostgreSQL
- Redis
- Fastify

Main areas:

- `core/auth`
  - login, register, setup, password flows
- `core/workspace`
  - workspace management and invitations
- `core/user`
  - current user and system user management
- `common/middlewares`
  - hostname and workspace resolution
- `database/repos`
  - repository layer over the DB

## Workspace Resolution

The project no longer relies only on the first workspace for authenticated traffic.

Current direction:

- public bootstrap/register routes can operate before a user session exists
- authenticated routes resolve workspace from the authenticated user
- invite-related public routes resolve workspace from invitation data

## Deployment Shape

Production-like local runtime uses:

- `nginx` in front
- `app` for API and frontend
- `collab` for collaboration
- `db` and `redis` as internal services

Default local Docker URL:

- `http://localhost:8090`
