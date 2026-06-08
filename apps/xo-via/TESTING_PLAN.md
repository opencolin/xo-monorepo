# xo-phone-os testing plan

Phased rollout of automated tests, starting with the smallest, purest
units and building up to full end-to-end journeys. Designed to ship
useful coverage in the first half-day rather than after a multi-week
infrastructure project.

No tests exist in the repo today. This plan establishes the
foundation, then adds layers without disrupting development.

---

## 1. Why test now

The OS has grown beyond the point where manual smoke-testing is
sufficient. Five separate systems (Mode, Lock, Gesture, Role, Phone)
now compose, and each has explicit conflict matrices documented in
`SYSTEMS.md`. Without tests:

- Refactors silently break cross-system invariants
- Regressions land between releases because there is no safety net
- New contributors cannot verify their changes are safe
- The published plans (mode transitions, gesture arbitration, etc.)
  drift from reality

The fix is incremental: add tests one layer at a time, keeping each
phase shippable on its own. By Phase 1 you have unit tests catching
regressions in `lib/`; by Phase 4 you have integration tests
covering mode + lock + gesture together; by Phase 6 you have E2E
guarding the critical user journeys.

---

## 2. The testing pyramid for this codebase

```
                           ┌──────────────┐
                           │     E2E      │   ~6 tests, slow (sec),
                           │  Playwright  │   high confidence
                           └──────────────┘
                       ┌──────────────────────┐
                       │     Integration      │   ~20 tests, medium
                       │ Providers + Comp.    │   (100ms each)
                       └──────────────────────┘
                  ┌────────────────────────────────┐
                  │       Component tests          │   ~40 tests,
                  │     React Testing Library      │   ~30ms each
                  └────────────────────────────────┘
            ┌────────────────────────────────────────────┐
            │              Unit tests                    │   ~80 tests,
            │     Vitest, pure functions + contexts      │   <10ms each
            └────────────────────────────────────────────┘
```

Many small fast tests at the base, a handful of slow tests at the
top. Same proportion as the canonical pyramid.

---

## 3. Stack choice

| Tool | Why |
|---|---|
| **Vitest** | Native ESM + TypeScript, no Babel; ~10x faster than Jest on this codebase shape; plays well with Next 16 + React 19 + Tailwind 4 |
| **@testing-library/react** | Component testing standard; encourages queries by accessible role/label which doubles as a11y check |
| **@testing-library/user-event** | Realistic pointer + keyboard simulation, ahead of fireEvent for interaction tests |
| **happy-dom** (vs jsdom) | Faster DOM implementation; matches all RTL queries we need |
| **Playwright** | Cross-browser, fast, first-class for App Router; runs against `pnpm dev` or production build |
| **MSW** | Mock fetch/network in unit + integration tests; centralizes test fixtures |
| **vitest --coverage** + V8 provider | Native coverage, no Istanbul instrumentation overhead |

Deferred (consider later, not v1):

- Storybook + Chromatic for visual regression (useful but expensive setup; revisit after Phase 4)
- `axe-core` for a11y in jsdom tests (light add later)

---

## 4. Current state

```
   tests/                           does not exist
   vitest.config.ts                 does not exist
   playwright.config.ts             does not exist
   package.json scripts             no test, no test:watch, etc.
   .github/workflows                no CI integration

   What does exist:
   - lib/xo-roles.ts                pure, easy to unit test
   - lib/xo-mode.ts                 has validation logic
   - lib/xo-mode-registry.ts        has subscribe semantics
   - lib/xo-app.ts                  has defineXOApp factory
   - lib/gestures/zones.ts          pure zone hit-testing
   - lib/via.ts                     pure precedence ladder
   - lib/agent/*                    server-side agent logic (8 files)
   - context/*                      6 React providers
   - components/*                   ~30 components
   - app/api/*                      4 route handlers
```

Zero coverage today. Phase 0 fixes that with a single passing test.

---

## 5. Phase 0: scaffold + first test (~1 hour)

The smallest possible setup that runs ONE test and reports coverage.
Lets you measure progress phase-by-phase.

Deliverables:

- `pnpm add -D vitest @vitest/coverage-v8 @testing-library/react @testing-library/user-event @testing-library/jest-dom happy-dom`
- `vitest.config.ts` (happy-dom env, alias `@/*` to `./*`, React plugin, globals on, coverage v8)
- `tests/setup.ts` (extends jest-dom matchers)
- `package.json` scripts: `test`, `test:watch`, `test:ui`, `test:coverage`
- One real test: `tests/unit/lib/xo-roles.test.ts` covering all five
  cases of `hasAnyRole` (undefined, empty, single match, OR, no match)
- A `tests/README.md` explaining the directory layout

Outcome: `pnpm test` passes with 1 file, coverage reports 0.5%.
The bar exists; everything below adds height.

---

## 6. Phase 1: pure logic unit tests (~1 to 2 days)

Lowest-effort, highest-ROI tests. These functions have zero
external dependencies and are the most-imported code in the repo.

### Files + what to test

| File | Tests |
|---|---|
| `lib/xo-roles.ts` | `hasRole` true/false. `hasAnyRole` for `undefined`, `[]`, single match, OR-of-multiple, full miss. `missingRoles` returns empty when access granted, returns full required set when denied. `roleLabel` covers every Role. |
| `lib/xo-mode.ts` | `defineMode` returns spec when valid. Throws when `dockPaths.length > 4`. Throws when any `dockPaths` entry is not in `appPaths`. Throws when `id` missing. Throws when `label` missing. |
| `lib/xo-mode-registry.ts` | Registry starts empty. `register` adds, second `register` with same id replaces. `unregister` removes; no-op if missing. `list()` returns same reference until mutate (for `useSyncExternalStore`). `subscribe` fires on register + unregister. Sort order: precedence desc, then insertion order. |
| `lib/xo-app.ts` | `defineXOApp` returns spec + auto-generated `metadata.title` = `"<label>, XO"`. `metadata.description` present when description set, absent otherwise. |
| `lib/gestures/zones.ts` | `zoneFor` returns `top-left` when `y < EDGE_TOP_PX && x < width/2`. `top-right` when `y < EDGE_TOP_PX && x >= width/2`. `bottom` when `y >= height - EDGE_BOTTOM_PX`. `spotlight` when home + middle of content. `none` outside zones. `none` for spotlight when NOT on home route. `isVerticalDrag` covers axes. |
| `lib/gestures/constants.ts` | Snapshot tests: thresholds + spring values are stable. Trip wire if anyone tunes them inadvertently. |
| `lib/via.ts` | `viaStateFromAgent` precedence: error > streaming > busy > empty > idle. Each branch returns the correct expression + animation pair. |

### Coverage target

100% of statements in `lib/` (excluding `lib/agent/server.ts` and
`lib/agent/transport.ts` which involve the Claude SDK and belong in
integration tests).

### Effort

~1 to 2 days for ~50 tests. Each one is 5 to 15 lines.

---

## 7. Phase 2: context unit tests (~2 to 3 days)

Wrap each provider in a `renderHook` harness. Drive actions via
`act`. Assert state + side effects (localStorage writes, motion
value updates, callback invocations).

### Files + what to test

| Context | Tests |
|---|---|
| `context/RoleContext.tsx` | Boot with empty roles. `grant("signed-in")` adds. `revoke` removes. `setRoles` replaces. Persists to localStorage with version flag. Cross-tab `storage` event syncs. `devModeEnabled` true in test env (NODE_ENV=test treated as not-production), false when cookie absent in prod. `canAccess` + `missingFor` route through `lib/xo-roles.ts` correctly. |
| `context/ModeContext.tsx` | Boot with `DEFAULT_MODE_ID`. `setMode("landing")` sets current immediately. `transitioning` true for 600 ms then false. `instant: true` skips the timer. URL override on mount picks up `?mode=foo`. `storage` event syncs cross-tab without animation. `modeApps` derives from registry + active mode + `availableIn`. `modeDock` same. `resetModeState` wipes localStorage and returns to default. |
| `context/LockContext.tsx` | Boot locked when `/` and no localStorage. Boot unlocked when localStorage `unlocked && within 24h`. Deep-link path (`pathname !== "/"`) boots unlocked. `unlock()` flips state + sets `unlocking` for 900 ms + records `lastUnlockedAt`. `lock()` flips back, sets `unlocking: false`. Sticky toggle persists; off means every reload re-locks. Cross-tab sync. |
| `context/GestureContext.tsx` | `openPanel` starts null. `openNotifications()` sets to `"notifications"`. `closeAll()` returns to null. Motion values start at 0. `lockGestures(ms)` sets `gestureLocked: true` for the duration. `ptrStatus` lifecycle: idle → pulling → refreshing → idle. |
| `context/PhoneContext.tsx` | `current` starts `"/"`. `openApp("/coworker")` sets current, pushes to back stack only when previous was not `/`. `goHome()` clears back stack. `pop()` returns to previous or home. Effects respect `usePathname()` changes. |

### Coverage target

90% of statements in `context/`. The 10% gap is escape hatches like
`try/catch` around `localStorage` errors that are hard to simulate.

### Effort

~2 to 3 days for ~40 tests. Each is 15 to 30 lines, mostly setup of
the mock + a single action + assert.

---

## 8. Phase 3: component tests (~2 to 3 days)

Render each top-level component in isolation with mocked providers.
Assert visible output (via Testing Library queries), interactions
(via user-event), and that callbacks fire correctly.

### Components + what to test

| Component | Tests |
|---|---|
| `HomeScreen` | Renders one `<AppIcon>` per `modeApps` entry. Renders `<Dock>` with `modeDock`. Shows `<ModeBanner>` only when not default mode. Wallpaper colors derive from `mode.theme.accent` (snapshot). Reduced-motion fallback: no transition prop. |
| `AppIcon` | Click on internal app calls `openApp` + `router.push`. External app calls `window.open`. Prefetches the route on mount. `whileTap` scale applied. Aria-label set. |
| `Dock` | Renders first 4 apps from `apps` prop. Layout class applied. |
| `ModeBanner` | Renders nothing in default mode. Renders pill with mode label + accent color in other modes. Click calls `setMode(DEFAULT_MODE_ID)`. |
| `ModeSettingsGroup` | Lists every registered mode. Active mode marked aria-pressed. Click row calls `setMode(id)`. Reset button calls `resetModeState`. |
| `RoleSettingsGroup` | Renders nothing when `devModeEnabled` false. Renders toggles when true. Toggle click calls `grant`/`revoke`. |
| `SignInGate` | Renders with app's tile + label. Click "Sign in" calls `grant("signed-in")`. Renders dev-mode badge when `devModeEnabled`. |
| `RoleGate` | Renders children when `canAccess` true. Renders `<SignInGate>` when missing `signed-in`. |
| `ModeMismatchBanner` | Renders nothing when current mode includes the app. Renders banner when mismatched. Click calls `setMode` with a mode that DOES include the app. |
| `XOAppShell` | Renders header (label + description). Wraps children in `<RoleGate>`. Mounts `<ModeMismatchBanner>`. Conditional featured icon block. |
| `LockScreen` | Clock renders + ticks. Date renders. Swipe pill click calls `unlock`. Esc/Space/Enter key calls `unlock`. NightPup wallpaper SVG present. Reduced-motion fallback skips breathing animation. |
| `StatusBar` | Time renders from PhoneContext. Wifi icon when `status.wifi`. Battery width from `status.charge`. Background animates to `theme.statusBarTint`. |
| `NotificationPanel` / `ControlCenterPanel` / `SpotlightPanel` | Each: scrim has `pointer-events: none` when closed, `auto` when open. Click scrim calls `closeAll`. Mounted in DOM at all times (offscreen via translateY when closed). |
| `ControlCenterPanel` Mode segmented | Lists every registered mode. Active mode highlighted. Click calls `setMode(id)`. |
| `SpotlightPanel` | Search filters by label, case-insensitive. Click result calls `openApp` + closes panel. External apps open in new tab. |
| `PullToRefresh` | Drag past `PTR_COMMIT_PX` triggers intent. Spinner reveals proportional to pull. Snaps back on release before threshold. |
| `Dock`, `AppIcon`, `HomeIndicator` | Visual + interaction sanity. |

### What NOT to test at this layer

- `GestureSurface` (pointer arbitration is integration territory; testing it as a unit means heavy mock of `setPointerCapture` etc. Defer to Phase 4.)
- Animation timings beyond "the right prop is passed" (Framer Motion's job)
- SVG paths (visual regression covers these later)

### Coverage target

70% of `components/`. The 30% gap is animation glue + decorative
SVG that doesn't have meaningful behavior.

### Effort

~2 to 3 days for ~40 tests.

---

## 9. Phase 4: integration tests (~3 to 4 days)

Mount real providers together, exercise cross-system flows. These
are the tests that catch the conflict-matrix bugs documented in
`SYSTEMS.md` §15.

### Flows + what to test

| Flow | Tests |
|---|---|
| Mode change propagates to all surfaces | `setMode("landing")` triggers: HomeScreen icon set updates, Dock updates, Spotlight filter updates, Wallpaper crossfades. ModeBanner appears. |
| Lock cycle | Boot locked → swipe up → unlocked → home grid visible. Click side button (or `lock()`) → lockscreen slides in → all panels suppressed. |
| GestureSurface arbitration | Pointerdown in `top-left` zone → claims, opens notif panel. Pointerdown in same zone while panel open → routes to scrim. Pointerdown in `spotlight` zone, no movement → falls through to icon click. Pointerdown when `Lock.locked` → only bottom-edge zone responsive. |
| Setup flow end-to-end (without auth) | Landing → tap Get started → /setup-welcome → click Begin setup → mode = setup → /setup-profile → SignInGate visible → click Sign in (dev stub) → form visible → fill name → Continue → /setup-workspace → ... → Finish setup → mode = default + home. |
| Mode hidden app banner | In landing mode, navigate to `/handbook` → ModeMismatchBanner visible → click switch → mode = default → banner disappears. |
| Role gate flips on role change | In default mode, `/coworker` requires no role → renders. `/setup-profile` requires signed-in + role missing → SignInGate. Grant role → form appears. |
| Persistence | Set mode + role + lock state. Unmount provider tree. Remount. State restored from localStorage. |
| Cross-tab sync | Two provider trees in parallel. setMode in one → `storage` event fires → other tab follows within next render. |
| PTR triggers refresh | Mount `/docs` with PTR opt-in. Simulate pull. Verify intent fires (mock router.refresh). |
| Mode transition during gesture | Start panel drag → setMode fires (cross-tab) → drag cancels + panel snaps closed. |

### Coverage target

80% of cross-system code paths. The remaining 20% is rare edge
cases (third-party mode unregister while active, etc.) handled by
specific regression tests when bugs surface.

### Effort

~3 to 4 days. These tests are bigger (50 to 100 lines each) because
they exercise more setup and more assertions.

---

## 10. Phase 5: API route tests (~1 to 2 days)

Route handlers tested in isolation by importing the `GET`/`POST`
export and calling it directly with a constructed `Request`.

| Route | Tests |
|---|---|
| `/api/healthz` | GET returns 200 + `{"status": "ok"}`. Headers correct. `dynamic: "force-static"` (snapshot the metadata). |
| `/api/agent/turn` | Happy path: valid POST body → streamed response (mocked Claude SDK). Error path: invalid body → 400. Auth path: per `lib/agent/auth.ts` requirements. |
| `/api/agent/quip` | Quick-response endpoint. Mock the upstream, assert shape. |
| `/api/agent/ack` | Acknowledgement endpoint. Same pattern. |

Mock the Claude SDK at `@anthropic-ai/sdk` import level using
`vi.mock`. Real SDK calls live in dedicated `integration.live.test.ts`
files that run only when `LIVE=1` env var is set.

### Coverage target

100% of route handler statements, mock-driven for the hard parts.

### Effort

~1 to 2 days for ~10 tests.

---

## 11. Phase 6: E2E with Playwright (~2 to 3 days)

A small handful of slow tests that catch real-browser bugs the
jsdom layers miss (CSS layout, real pointer events, layoutId
animations completing, etc.).

| Journey | Test |
|---|---|
| First-time visitor | Open `/`. Lockscreen renders. Swipe up gesture. Home grid appears in default mode. Tap Coworker tile. AppView opens with layoutId morph. Tap back. Returns home. |
| Mode switch via Control Center | Open `/`. Swipe down from top-right. Control Center opens. Tap Landing pill. Panel closes. Home grid + dock updated. Mode banner visible. Click banner. Returns to default. |
| Setup flow with sign-in | Switch to setup mode via Control Center. Navigate through welcome → profile (sign-in gate appears) → tap "Sign in" → form visible → walk to integrations → tap Finish → returns home in default mode. |
| Lock cycle | Tap right-side button. Lockscreen slides down. Swipe up to unlock. Lockscreen slides up. State persists across reload (sticky window). |
| Spotlight + filter | On `/`, pull down from grid. Spotlight panel appears. Type "cow" → filter shows Coworker. Tap → Coworker opens. |
| PTR | Open `/docs`. Pull down from top of content. Spinner reveals. Release past threshold. Page refreshes. |

### Setup notes

- `playwright.config.ts` runs against `pnpm dev` on `:18002` (the project's pinned port)
- Use `webServer.command: "pnpm dev"` + `reuseExistingServer: !process.env.CI`
- Run in Chromium only for v1; add Firefox + WebKit later if time
- One test file per journey for clarity
- `tests/e2e/` directory; ignored by Vitest

### Coverage target

Not measured. The bar is "all six journeys pass on every PR."

### Effort

~2 to 3 days. Most of the time is in selectors + waiting for
animations to settle.

---

## 12. Phase 7: visual regression + a11y (~1 to 2 days, defer)

Skip in v1 unless visual drift is causing pain. The hooks:

- **Storybook + Chromatic** for visual diff of every panel/screen.
  Useful for design iteration but adds significant infra.
- **`axe-core`** integration in component tests: assert no a11y
  violations on rendered output. Cheap to add to RTL tests.
- **Lighthouse CI** for Performance + Accessibility scores on
  `/`, `/coworker`, `/setup-welcome`. Run on every PR.

Defer all three to a separate plan; the testing pyramid above is
the priority.

---

## 13. Phase 8: CI integration (~half day)

Final piece. GitHub Actions workflow:

```
   .github/workflows/test.yml
   ────────────────────────
   on: pull_request + push to main
   matrix: node 20, 22
   jobs:
     unit:        pnpm test --coverage   (Phases 1, 2, 3)
     integration: pnpm test:integration  (Phase 4)
     api:         pnpm test:api          (Phase 5)
     e2e:         pnpm test:e2e          (Phase 6)
     typecheck:   pnpm typecheck
     lint:        pnpm lint
     build:       pnpm build
   all jobs in parallel; fail PR if any fails
```

Cache pnpm install + the `.next` build cache to keep CI under
3 minutes.

Coverage thresholds: fail PR if total coverage drops more than 2%
from main.

---

## 14. Coverage targets

| Layer | Target | Owner of the gap |
|---|---|---|
| `lib/` pure logic | 100% | None |
| `context/` providers | 90% | localStorage error escape hatches |
| `components/` | 70% | Animation glue + decorative SVG |
| `app/api/` routes | 100% | None |
| Cross-system integration | 80% | Rare edge cases |
| E2E happy paths | 6/6 journeys | None |

Total project coverage target: **75% statements** by end of Phase 4.

---

## 15. What to skip

Not worth testing:

- Trivial getters/setters (none in this codebase)
- Inline marketing copy in stub pages (`/about`, `/changelog`, `/handbook`)
- Tailwind utility class strings (tested implicitly by rendering)
- Framer Motion internals (trust the library)
- The Claude SDK itself (mock it; trust their tests)
- `defineXOApp`'s pass-through fields (only the auto-generated bits
  need tests)
- The XO chevron SVG paths (visual, not behavioral)
- `gatsby-types.d.ts` style auto-generated files

---

## 16. Risks

| Risk | Likelihood | Mitigation |
|---|---|---|
| Tests slow CI to > 5 min and people start skipping | Medium | Cache aggressively; split into unit/integration/e2e jobs; run e2e only on main + release branches if needed |
| Flaky Framer Motion timing in tests | Medium | Mock `useReducedMotion: true` in test setup so animations are instant; assert state, not timing |
| Mocking Claude SDK drifts from reality | Medium | One `live.test.ts` file per route that hits the real SDK behind `LIVE=1` env var; run nightly |
| Component tests over-mock providers and don't catch real bugs | Medium | Phase 4 integration tests use real providers; balance unit + integration |
| Coverage chasing leads to brittle tests | Low | Target 75% not 100%; the last 25% is escape hatches |
| Playwright pointer simulation differs from real touch | Low | E2E catches obvious breaks; final verification stays manual on real iPhone |
| New apps shipped without tests | Low | Lint rule: every `app/<route>/page.tsx` must have a sibling test or be in an allowlist |

---

## 17. Decisions before Phase 0

1. **Vitest vs. Jest?** Default: **Vitest**. Faster, native ESM,
   no transformer config for TypeScript, modern. Jest works too but
   needs more setup with Next 16 + React 19.
2. **happy-dom vs. jsdom?** Default: **happy-dom**. ~3x faster on
   this size; switch to jsdom only if we hit a gap.
3. **MSW vs. inline fetch mocks?** Default: **MSW**. Centralizes
   handlers; reuse them across unit + integration + Playwright.
4. **Run e2e on every PR or just main?** Default: **every PR** with
   single-browser Chromium; expand to multi-browser on main only.
5. **Coverage threshold as a hard gate?** Default: **soft gate**
   (-2% from main fails); avoid heroic test churn during refactors.
6. **Test the stub apps (`/about`, `/changelog`, `/handbook`)?**
   Default: **no**, they are content stubs. The XOAppShell wrapper
   is tested in Phase 3; that's enough to know the page renders.

---

## 18. Effort summary

| Phase | Effort | What ships |
|---|---|---|
| 0 scaffold + 1 test | ~1 hour | Vitest + RTL + first test running |
| 1 pure logic units | ~1 to 2 days | ~50 unit tests on `lib/` |
| 2 context units | ~2 to 3 days | ~40 tests on `context/` |
| 3 component tests | ~2 to 3 days | ~40 tests on `components/` |
| 4 integration tests | ~3 to 4 days | ~20 cross-system tests |
| 5 API route tests | ~1 to 2 days | ~10 tests on `app/api/` |
| 6 E2E Playwright | ~2 to 3 days | 6 critical journeys |
| 8 CI integration | ~0.5 day | GitHub Actions workflow |
| **Total** | **~12 to 18 days** | **~165 tests, ~75% coverage** |

Phase 7 (visual / a11y) deferred. Start with Phase 0 today (~1
hour); the rest can be spread across normal feature work, with each
phase shippable on its own.

---

## 19. The single most useful thing to do first

If only one phase ships, do **Phase 1** (pure logic units on
`lib/`). It's the cheapest, catches the most bugs per test-LOC, and
unblocks every later phase (the contexts and components depend on
this layer being correct).

Estimated payback: ~1 day of work prevents ~3 to 5 production
regressions per quarter at the current shipping pace.
