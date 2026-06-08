# packages/

Reserved for **shared TypeScript packages** used across the web apps in
[`apps/`](../apps) — design tokens, shared UI, types, config, etc.

It's empty today. To add one:

1. Create `packages/<name>/package.json` with `"name": "@xo/<name>"`.
2. Reference it from an app as `"@xo/<name>": "workspace:*"`.
3. `pnpm install` — the workspace globs (`packages/*`) pick it up automatically.
