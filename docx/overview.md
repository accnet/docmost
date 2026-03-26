# Overview

## What This Repository Is

This repository is a self-hosted fork of `docmost` that has been reshaped around:

- Docker-first local deployment with `nginx`, `app`, `collab`, `db`, and `redis`
- a dedicated multi-workspace user model
- a bootstrap `Super User`
- OSS-only settings UI with enterprise placeholder screens removed

## Monorepo Layout

- `apps/client`
  - React frontend
- `apps/server`
  - NestJS backend, auth, workspace, user, API, and collaboration support
- `packages/editor-ext`
  - shared editor extensions used by the client
- `docker`
  - nginx config and container support files
- `tests/e2e`
  - Playwright regression tests added for auth redirect flow

## Main Runtime Services

- `nginx`
  - frontend entrypoint and reverse proxy
- `app`
  - NestJS API and static frontend serving
- `collab`
  - collaboration server
- `db`
  - PostgreSQL
- `redis`
  - queues, cache, and collaboration support

## Current Direction

The fork is moving toward:

- one dedicated workspace per registered user
- `Super User` as the bootstrap system admin
- invited members staying inside an owner's workspace
- system-level user management for registered users only
