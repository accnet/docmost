# Auth And Workspace Model

## User Types

The fork currently models three user origins:

- `bootstrap`
  - the first system bootstrap user
- `register`
  - a normal registered user who receives a dedicated workspace
- `invite`
  - a member invited into an existing owner's workspace

## Super User

`Super User` is the first bootstrap user.

Capabilities:

- has a dedicated workspace like a normal registered user
- has a default space in that workspace
- can create additional spaces
- can access system user management

Limits:

- system user management is for registered/bootstrap users
- invited members are not managed from that system screen

## Registered User

A registered user:

- gets a dedicated workspace
- becomes `OWNER` of that workspace
- gets a default space
- can create more spaces
- has data isolated by workspace

## Invited Member

An invited member:

- belongs to an existing workspace
- does not get a new workspace
- is managed inside workspace member management
- does not appear in system user management

## Auth Flows

Current key flows:

- `/auth/setup`
  - bootstrap the first `Super User`
- `/auth/register`
  - create a registered owner with a dedicated workspace
- `/auth/login`
  - self-host login now resolves by user instead of assuming one shared workspace
- invite accept/info routes
  - resolve workspace from invitation context

## Redirect Behavior

The client now uses `setup-status` to avoid setup/login redirect loops:

- if setup is incomplete:
  - `/login` and `/signup` redirect to `/setup/register`
- if setup is complete:
  - `/setup/register` redirects to `/login`
