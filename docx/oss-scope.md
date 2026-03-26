# OSS Scope

## Removed From Settings UI

The following OSS placeholder screens have been removed from the settings UI and routing because they were only showing `not available in this OSS build`:

- AI settings
- API keys
- API management
- Audit log
- Security & SSO
- License & Edition

## Why They Were Removed

The goal is to keep the OSS fork clean:

- no dead-end settings entries
- no placeholder-only routes in normal navigation
- fewer misleading admin options

## What Was Intentionally Kept

Some OSS-prefixed code still remains because it is actually used:

- AI search/editor components that are still wired into the product
- security-related types and sharing helpers still used by real features
- billing and cloud-only paths that are still conditionally routed

## Practical Rule

If a screen only existed to show a placeholder message in OSS and had no real local behavior, it should not appear in the settings UI.
