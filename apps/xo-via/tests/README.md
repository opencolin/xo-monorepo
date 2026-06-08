# tests/

Test suite for xo-phone-os, organized to match the phases in
`TESTING_PLAN.md`.

## Layout

```
tests/
├── setup.ts          Global jest-dom matchers; loaded by vitest.config.ts
├── unit/             Pure logic + context unit tests (Phases 1-2)
│   ├── lib/          Tests for lib/ functions
│   └── context/      Tests for context/ providers (Phase 2)
├── components/       React Testing Library component tests (Phase 3)
├── integration/      Cross-system flows with real providers (Phase 4)
├── api/              Route handler tests (Phase 5)
└── e2e/              Playwright end-to-end (Phase 6, separate runner)
```

## Commands

| Command | What it does |
|---|---|
| `pnpm test` | Run every Vitest suite once (unit + components + integration + api) |
| `pnpm test:watch` | Re-run on file change |
| `pnpm test:ui` | Vitest browser UI for picking + debugging tests |
| `pnpm test:coverage` | Coverage report (V8). HTML output in `coverage/index.html` |

E2E runs separately via Playwright (added in Phase 6). It is
intentionally excluded from `pnpm test` because it needs a running
dev server and is slower.

## Conventions

- One test file per source module. `lib/xo-roles.ts` →
  `tests/unit/lib/xo-roles.test.ts`.
- Describe blocks group by function or behavior, not by file.
- Prefer Testing Library queries by role/label (doubles as
  accessibility check) over `getByTestId`.
- Mock `useReducedMotion: true` in `tests/setup.ts` once Phase 3
  starts so animations resolve instantly.
- Live SDK calls (Claude Agent SDK) live in `*.live.test.ts` files
  and only run when `LIVE=1` is set.

## Coverage targets (per TESTING_PLAN.md §14)

| Layer | Target |
|---|---|
| `lib/` pure logic | 100% |
| `context/` providers | 90% |
| `components/` | 70% |
| `app/api/` routes | 100% |
| Total project | 75% by end of Phase 4 |

## Current state

- Phase 0 (this file + the first hasAnyRole test) shipped
- Phases 1-8 outlined in `TESTING_PLAN.md`; pick the next phase up
  when you're ready

Run `pnpm test` to verify the scaffold works.
