# Multi-Workspace User Model Plan

## Current State

### What the code already supports

- `users.workspaceId` already exists
- workspace creation already exists
- owner role assignment already exists
- invite-member flow already exists
- pages already belong to `workspaceId` and `spaceId`

### What the code does not support yet

- self-host request routing is still pinned to the first workspace
- self-host does not yet resolve workspace per registered user
- registered user onboarding is not yet a standard public register flow
- system-level `Super User` management does not exist
- system user management does not distinguish registered users from invited members

## Target Model

### Registered User

- each registered user has exactly one dedicated workspace
- each registered user is `OWNER` of that workspace
- each registered user has full workspace-level features in that workspace
- each registered user starts with their own default space inside that workspace
- each registered user can create additional spaces inside their workspace
- registered users are system-managed users

### Invited Member

- invited members belong to an existing owner's workspace
- invited members do not create their own workspace when accepting an invite
- invited members are managed inside the owner's workspace member area
- invited members do not appear in system-level `User Management`

### Super User

- the system has one bootstrap `Super User`
- `Super User` is a system-level role
- `Super User` has the same workspace-level model as a normal registered user
- `Super User` has a dedicated workspace
- `Super User` starts with a default space in that workspace
- `Super User` can create additional spaces in that workspace
- `Super User` has independent workspace data and functionality, just like any other registered user
- `Super User` manages registered users only
- `Super User` does not manage invited members from the system user screen

### Pages

- pages remain workspace-scoped, not user-scoped
- because each registered user owns a dedicated workspace, their pages become effectively personal by workspace isolation

## Core Gaps To Close

### Gap 1: Self-host workspace resolution

Current problem:

- `apps/server/src/common/middlewares/domain.middleware.ts` always binds self-host traffic to `findFirst()` workspace

Impact:

- self-host behaves like single-workspace mode
- multiple registered users with dedicated workspaces cannot work correctly

Required direction:

- stop resolving self-host requests to the first workspace globally
- resolve workspace based on authenticated user/session when appropriate
- keep public/bootstrap/register routes working before authentication

### Gap 2: Registered user vs invited member identity

Current problem:

- both registered users and invited members are just `users`
- there is no explicit source marker

Impact:

- impossible to build `User Management` that lists registered users only
- hard to enforce invite rules cleanly

Required direction:

- add a user origin marker
- recommended values:
  - `bootstrap`
  - `register`
  - `invite`

### Gap 3: Invite conflict with `1 registered user = 1 workspace`

Current problem:

- invite flow can create another user in a workspace
- there is no current rule preventing a globally registered user email from being invited elsewhere

Impact:

- model becomes inconsistent

Required direction:

- invite must be blocked if the email already belongs to a registered or bootstrap user
- invite may only create users with source `invite`

### Gap 4: Owner lifecycle

Current problem:

- no rule yet for what happens to a registered user's workspace if that registered user is deactivated or deleted by `Super User`

Impact:

- high risk of orphaned workspace state

Required direction:

- do not hard delete in the first implementation
- recommended first rule:
  - deactivate registered owner => suspend workspace
  - delete registered owner => soft delete user + archive or suspend workspace

## Schema Changes

### Goal

- add the minimum data model needed to support the target behavior cleanly

### Tasks

- [ ] Add schema support for user source classification
- [ ] Recommended field:
  - `registrationSource = bootstrap | register | invite`

- [ ] Add schema support for `Super User`
- [ ] Choose one:
  - `isSuperUser`
  - system role column

- [ ] Add or confirm workspace lifecycle fields needed for admin actions
- [ ] Reuse or extend workspace status model if possible

- [ ] Create database migrations for all new fields
- [ ] Regenerate database typings/codegen
- [ ] Update entity typings and repo assumptions
- [ ] Update repository query filters and select payloads to respect:
  - `registrationSource`
  - `isSuperUser` or system role
  - workspace lifecycle status

### Acceptance Criteria

- [ ] backend can distinguish bootstrap/register/invite users
- [ ] backend can identify `Super User`
- [ ] backend can persist workspace lifecycle state needed for suspension/archive

## Phase 0: Architecture Foundation

### Goal

- make the backend capable of resolving the correct workspace model before adding register flow

### Tasks

- [ ] Refactor `apps/server/src/common/middlewares/domain.middleware.ts`
- [ ] Remove self-host assumption that every request uses the first workspace
- [ ] Define routing rules for:
  - public bootstrap routes
  - public register routes
  - public login routes
  - authenticated routes

- [ ] Decide self-host workspace resolution strategy
- [ ] Recommended direction:
  - unauthenticated public routes may run without fixed workspace
  - authenticated routes resolve workspace from authenticated user
  - workspace-specific public routes resolve from explicit identifier when needed

- [ ] Add route-by-route impact review for workspace resolution
- [ ] Explicitly verify behavior for:
  - `/auth/login`
  - `/auth/register`
  - `/auth/setup` or bootstrap route
  - `/users/me`
  - `/workspace/public`
  - invite accept/info routes
  - Google OAuth entry/callback routes
  - space routes
  - page routes
  - comment routes
  - attachment routes
  - search routes

- [ ] Review `apps/server/src/common/guards/jwt-auth.guard.ts`
- [ ] Ensure JWT/session flow still works once self-host is no longer first-workspace-only

- [ ] Verify current `/users/me` and workspace loading flow still work after middleware changes

### Acceptance Criteria

- [ ] self-host is no longer globally pinned to the first workspace
- [ ] authenticated user requests resolve into the correct workspace
- [ ] public routes still work without breaking bootstrap/register/login

## Phase 1: Bootstrap Super User

### Goal

- create the first system-level admin entry point safely

### Tasks

- [ ] Define `Super User` storage model
- [ ] Choose one of:
  - `isSuperUser`
  - dedicated system role

- [ ] Add user source marker
- [ ] Recommended field:
  - `registrationSource = bootstrap | register | invite`

- [ ] Create bootstrap flow for initial `Super User`
- [ ] Choose one path:
  - one-time setup endpoint
  - bootstrap command
  - guarded setup UI

- [ ] Ensure bootstrap runs only if no `Super User` exists
- [ ] Bootstrap result:
  - create `Super User`
  - create dedicated workspace
  - create default space in that workspace
  - assign `OWNER` in that workspace
  - mark source as `bootstrap`

### Acceptance Criteria

- [ ] the system can create the first `Super User` exactly once
- [ ] `Super User` has its own workspace
- [ ] `Super User` has a default space in that workspace
- [ ] `Super User` can create additional spaces like any registered user
- [ ] repeated bootstrap attempts are blocked

## Phase 2: Registered User Signup

### Goal

- let normal users register and receive their own workspace automatically
- each registered user should start with a default space in that workspace
- each registered user should be able to create more spaces after signup

### Backend

- [ ] Create `apps/server/src/core/auth/dto/register-user.dto.ts`
- [ ] DTO fields:
  - `name`
  - `email`
  - `password`
  - `workspaceName`
  - `hostname?`

- [ ] Refactor `apps/server/src/core/auth/services/signup.service.ts`
- [ ] Separate flows clearly:
  - `bootstrapSuperUser(...)`
  - `registerOwnerWithWorkspace(...)`
  - `signupToWorkspace(...)` for invited members

- [ ] In `registerOwnerWithWorkspace(...)`:
  - create user
  - set role `OWNER`
  - set source `register`
  - create dedicated workspace
  - attach `workspaceId`
  - create default group
  - create default space for that registered user's workspace
  - add owner to default group
  - add owner to default space

- [ ] Add global email lookup in `apps/server/src/database/repos/user/user.repo.ts`
- [ ] Add method like `findByEmailGlobal(email)`
- [ ] Block registration if the email already belongs to:
  - `bootstrap` user
  - `register` user
- [ ] Decide and implement DB-level uniqueness strategy for registered/bootstrap emails
- [ ] Recommended direction:
  - prevent duplicate registered/bootstrap accounts at the database layer
  - keep invite-only users excluded from that uniqueness rule if the schema requires it

- [ ] Update `apps/server/src/core/auth/services/auth.service.ts`
- [ ] Add `registerOwner(...)`

- [ ] Update `apps/server/src/core/auth/auth.controller.ts`
- [ ] Add `POST /auth/register`
- [ ] Endpoint behavior:
  - public
  - sets auth cookie
  - returns workspace payload

### Frontend

- [ ] Add register types in `apps/client/src/features/auth/types/auth.types.ts`
- [ ] Add register API in `apps/client/src/features/auth/services/auth-service.ts`
- [ ] Add `signUp()` in `apps/client/src/features/auth/hooks/use-auth.ts`
- [ ] Create `apps/client/src/features/auth/components/sign-up-form.tsx`
- [ ] Create `apps/client/src/pages/auth/signup.tsx`
- [ ] Mount `/signup` in `apps/client/src/App.tsx`
- [ ] Add signup CTA in login form

### Google OAuth

- [ ] Support register/login by Google OAuth
- [ ] Add backend Google OAuth strategy and callback flow
- [ ] Add env support for:
  - `GOOGLE_CLIENT_ID`
  - `GOOGLE_CLIENT_SECRET`
  - `GOOGLE_CALLBACK_URL`
- [ ] Google flow rules:
  - if email belongs to an existing registered/bootstrap user => login existing account
  - if email does not exist => create registered user + dedicated workspace
  - if email belongs to invite-only user => must follow an explicit rule

- [ ] Chốt rule Google OAuth for invite-only users
- [ ] Choose one:
  - block Google OAuth for invite-only email
  - upgrade invite-only user into registered user
  - merge invite-only user into registered flow with a one-time migration

- [ ] Do not implement Google OAuth fully until the invite-only rule is chosen

### Acceptance Criteria

- [ ] registered user gets dedicated workspace
- [ ] registered user is `OWNER`
- [ ] registered user gets a default space in their workspace
- [ ] registered user can create additional spaces in that workspace
- [ ] registered user gets full workspace-level functionality
- [ ] login works after register
- [ ] Google OAuth follows the same workspace-per-user rule

## Phase 3: Invite Member Flow Hardening

### Goal

- keep invite flow, but make it consistent with the new registered-user model

### Tasks

- [ ] Update `apps/server/src/core/workspace/services/workspace-invitation.service.ts`
- [ ] Keep invited users as workspace members only
- [ ] Mark invited users with source `invite`

- [ ] Add invite eligibility rule:
  - block invite if email already belongs to `bootstrap` or `register` user

- [ ] Keep invited member behavior:
  - no dedicated workspace creation
  - role comes from invitation
  - default group membership still works
  - invitation groups still work

- [ ] Review workspace member UI and API to ensure owner can still:
  - invite
  - resend
  - revoke
  - deactivate
  - activate
  - change role

### Acceptance Criteria

- [ ] invited members still work
- [ ] invited members do not create workspaces
- [ ] registered users cannot be re-created as invited members in another workspace

## Phase 4: Super User Permissions

### Goal

- separate workspace owner powers from system-level user powers

### Tasks

- [ ] Review backend guards and permission checks
- [ ] Ensure owner cannot access system-only APIs
- [ ] Ensure `Super User` can access system-only APIs

- [ ] Expose `Super User` status in current-user payload where needed
- [ ] Allow frontend to conditionally render system-only menu items

### Acceptance Criteria

- [ ] owner has full workspace powers only
- [ ] `Super User` has system-level user management access
- [ ] owner cannot call system user management APIs

## Phase 5: System User Management

### Goal

- allow `Super User` to manage registered users only

### Backend

- [ ] Add system user management APIs
- [ ] Minimum actions:
  - list registered users
  - deactivate registered user
  - activate registered user
  - delete registered user

- [ ] Recommended endpoints:
  - `POST /system/users`
  - `POST /system/users/deactivate`
  - `POST /system/users/activate`
  - `POST /system/users/delete`

- [ ] List query must include only:
  - source `bootstrap`
  - source `register`
- [ ] List query must exclude:
  - source `invite`

- [ ] Include these fields:
  - user id
  - name
  - email
  - workspace id
  - workspace name
  - workspace role
  - `isSuperUser`
  - status
  - `createdAt`
  - `lastLoginAt`

- [ ] Add safety rules:
  - cannot deactivate last `Super User`
  - cannot delete last `Super User`
  - cannot hard delete in first release
  - deactivating registered owner suspends workspace
  - deleting registered owner soft deletes user and archives or suspends workspace

- [ ] Add explicit owner lifecycle implementation tasks
- [ ] When registered owner is deactivated:
  - update workspace status to suspended or equivalent
  - block normal access to that workspace
  - define behavior for invited members in that workspace
- [ ] Add backend enforcement so suspended workspaces are rejected consistently by guards, middleware, or service layer

- [ ] When registered owner is deleted:
  - soft delete user
  - archive or suspend workspace
  - keep audit trail
  - define behavior for invited members in that workspace

- [ ] Review login/session behavior for suspended workspace
- [ ] Decide frontend response for suspended workspace
- [ ] Decide whether invited members can still access suspended workspace

### Frontend

- [ ] Add `User Management` menu in settings
- [ ] Show only for `Super User`

- [ ] Add route and menu wiring tasks explicitly
- [ ] Define route path for `User Management`
- [ ] Update settings sidebar visibility rules
- [ ] Add frontend query/service layer for system user list and actions

- [ ] Create system user management page
- [ ] Features:
  - list registered users
  - search by name or email
  - deactivate
  - activate
  - delete

- [ ] Explicitly do not show invited members here
- [ ] Invited members remain managed in workspace member screens
- [ ] Keep existing workspace member screens as the only place where owners manage invited members

- [ ] Add suspended-workspace frontend handling if owner lifecycle policy requires it

### Acceptance Criteria

- [ ] `Super User` can manage registered users
- [ ] invited members do not appear in system user management
- [ ] owner cannot access this screen or API

## Phase 6: Cross-Cutting Cleanup

### Naming

- [ ] Rename misleading setup-oriented names
- [ ] Avoid using bootstrap DTO names for normal registration
- [ ] Keep flow names explicit:
  - bootstrap
  - register
  - invite

### Validation

- [ ] Normalize email lowercase everywhere
- [ ] block duplicate registered user emails globally
- [ ] block duplicate hostname
- [ ] validate reserved hostname
- [ ] rate-limit register flow

### Optional Later Work

- [ ] email verification
- [ ] spam protection
- [ ] captcha
- [ ] stronger workspace suspension policy

## Tests

### Phase 0

- [ ] self-host no longer binds every request to first workspace
- [ ] authenticated requests resolve correct workspace

### Phase 1

- [ ] bootstrap creates first `Super User`
- [ ] bootstrap cannot run twice

### Phase 2

- [ ] register creates user
- [ ] register creates dedicated workspace
- [ ] register assigns owner role
- [ ] register creates default group and space
- [ ] registered user can create additional spaces after signup
- [ ] register sets auth cookie
- [ ] duplicate registered email is blocked
- [ ] duplicate hostname is blocked
- [ ] Google OAuth register creates workspace correctly
- [ ] Google OAuth login reuses existing registered account correctly

### Phase 3

- [ ] invite creates workspace member only
- [ ] invite does not create workspace
- [ ] invite is blocked for email already used by registered/bootstrap user

### Phase 4

- [ ] owner cannot access system APIs
- [ ] `Super User` can access system APIs

### Phase 5

- [ ] user management list shows only bootstrap/register users
- [ ] invited members never appear there
- [ ] deactivate registered user works
- [ ] activate registered user works
- [ ] delete registered user works as soft delete
- [ ] deactivating owner changes workspace status correctly
- [ ] deleting owner changes workspace status correctly
- [ ] cannot deactivate last `Super User`
- [ ] cannot delete last `Super User`

## Recommended Execution Order

- [ ] Bước 1: Phase 0
- [ ] Bước 2: Phase 1
- [ ] Bước 3: Phase 2
- [ ] Bước 4: Phase 3
- [ ] Bước 5: Phase 4
- [ ] Bước 6: Phase 5
- [ ] Bước 7: Phase 6
