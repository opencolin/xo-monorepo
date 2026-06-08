# packages/

Shared TypeScript packages used across the web apps in [`apps/`](../apps).

| Package | Path | What it provides |
|---|---|---|
| `@xo/types` | [`packages/types`](types) | Shared platform types — agent runtimes, `xo-org` modes, message addressing, app lifecycle. Consumed by `apps/xo-org` via `@/lib/xo-types`. |
| `@xo/tsconfig` | [`packages/tsconfig`](tsconfig) | Shared base `tsconfig` (`base.json`) that other packages extend. |

## Add another shared package

1. Create `packages/<name>/package.json` with `"name": "@xo/<name>"`.
2. Reference it from an app as `"@xo/<name>": "workspace:*"`.
3. `pnpm install` — the workspace glob (`packages/*`) picks it up automatically.

`@xo/types` is published as raw TypeScript (its `exports` point at `src/index.ts`)
and consumed as **type-only** imports, so no build step or `transpilePackages`
entry is required. If you add runtime code to a shared package, either ship a
build step or add the package to the consuming app's `next.config` `transpilePackages`.
