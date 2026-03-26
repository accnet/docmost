# Roadmap

This file is the short-form version of `phase.md`.

## Phase 0

- remove self-host first-workspace assumptions
- make auth and invite flows resolve the correct workspace source

## Phase 1

- bootstrap `Super User`
- create exactly one initial system admin
- give that user a dedicated workspace and default space

## Phase 2

- add public register flow
- create one dedicated workspace per registered user
- assign owner role and default space automatically

## Phase 3

- keep invite-member flow
- mark invited users separately from registered users
- ensure invited members stay out of system user management

## Phase 4

- add system user management for `Super User`
- list registered/bootstrap users only
- support activate, deactivate, and delete rules safely

## Phase 5

- harden lifecycle rules
- define behavior when a registered owner is deactivated or removed
- protect the last `Super User`

## Phase 6

- extend auth with Google OAuth if required
- continue adding e2e coverage around auth and user management

## Source Of Truth

For implementation detail, decision notes, and acceptance criteria, read:

- `phase.md`
