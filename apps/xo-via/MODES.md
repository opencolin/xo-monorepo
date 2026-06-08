# Modes, a one-pager

Curated subsets of apps + dock layouts that the home screen presents
based on where the user is in their journey. Today there are two:

| Mode | Audience | First-load? |
|---|---|---|
| `default` | Onboarded / returning users. Full app suite (all 13 apps). | Yes |
| `landing` | First-time marketing visitor. Smaller subset (6 apps). | Opt-in |

Mode is orthogonal to lock, current route, and gestures. The shell
components stay the same; only what they render changes.

Full design: `MODES_PLAN.md`. Source of truth for behavior: the
files below.

---

## File map

```
lib/xo-mode.ts             defineMode() factory + validation
lib/xo-mode-registry.ts    register / unregister / list / subscribe
data/modes.ts              registers built-ins, exports DEFAULT_MODE_ID
data/modes/landing.ts      landing mode definition
data/modes/default.ts      default mode definition

context/ModeContext.tsx        ModeProvider, useMode(), persistence
components/ModeSettingsGroup.tsx     Settings: radio list of modes
components/ModeBanner.tsx            Slim pill banner (non-default only)
components/ModeMismatchBanner.tsx    In-app banner when app missing from mode
components/gestures/ControlCenterPanel.tsx   Mode segmented control
```

---

## Add a new mode

Two steps for a built-in. Adding `setup` mode as the worked example.

### 1. Create `data/modes/setup.ts`

```ts
import { defineMode } from "@/lib/xo-mode"

export const setup = defineMode({
  id: "setup",
  label: "Setup",
  description: "Guided onboarding flow.",
  precedence: 5,
  appPaths: [
    "/",
    "/coworker",
    "/ask",
    "/settings",
    "/signup-external",
  ],
  dockPaths: [
    "/coworker",
    "/ask",
    "/settings",
    "/signup-external",
  ],
})
```

`defineMode()` validates at module-init time: dock paths must be a
subset of appPaths, max 4 dock pins, label + id required. Throws
loud if any of that is wrong.

### 2. Register it in `data/modes.ts`

```ts
import { setup } from "./modes/setup"

modeRegistry.register(setup)
```

Done. Settings + Control Center pick it up automatically (both
render from the live registry via `useSyncExternalStore`).

### Or: register at runtime

For plugins, feature flags, or A/B tests, register from any
client module without editing core:

```ts
import { modeRegistry } from "@/data/modes"
import { defineMode } from "@/lib/xo-mode"

modeRegistry.register(defineMode({
  id: "demo-2026",
  label: "Demo (Q1 2026)",
  appPaths: ["/", "/coworker", "/demo"],
  dockPaths: ["/coworker", "/demo"],
}))
```

The provider re-renders, the new mode appears in the switcher.

---

## Edit apps for a given mode

Open `data/modes/<id>.ts` and change `appPaths` / `dockPaths`. The
HomeScreen grid, Dock, and Spotlight all re-read.

```ts
// Make Docs visible in landing mode:
appPaths: [
  "/",
  "/coworker",
  "/swarm",
  "/pricing",
  "/ask",
  "/demo",
  "/docs",            // ← new
  "/settings",
  "/signup-external",
],
```

```ts
// Swap the dock: Coworker, Swarm, Docs, signup:
dockPaths: [
  "/coworker",
  "/swarm",
  "/docs",            // ← was /pricing
  "/signup-external",
],
```

Rules enforced by `defineMode()`:

- **Max 4 dock pins.** Throws at import if exceeded.
- **Dock paths must be in appPaths.** Throws if you put a path in
  `dockPaths` without also listing it in `appPaths`.
- **Path must match a real route.** No build-time check, but
  unregistered paths render nothing.

The home tile (`/`) is conventionally always in `appPaths` (so the
home gesture target exists) but never in `dockPaths` (the home
indicator is the home target, not a tile).

`/signup-external` is conventionally always in every mode's
dock per `MODES_PLAN.md` §13.

---

## App-side opt-out

For an app that should never appear in some modes regardless of
mode config (e.g. an admin-only app that should never leak into
`landing`):

```ts
// app/admin/app.ts
export const xoApp = defineXOApp({
  path: "/admin",
  label: "Admin",
  glyph: "A",
  tile: "bg-zinc-700 text-white",
  kind: "native",
  availableIn: ["default"],         // ← only here
})
```

If a mode's `appPaths` includes `/admin` but the mode's id is not
in `availableIn`, the app is filtered out of the grid + Spotlight.
Both checks (mode-side `appPaths`, app-side `availableIn`) must
agree before the app shows up.

Use sparingly: most apps should rely on mode-side inclusion. App
opt-out exists so an app can be defensive without trusting
third-party mode definitions.

`requiredRoles?: string[]` is a sibling field for future RBAC.
Parsed today, ignored by the runtime (no role evaluator yet).

---

## Switch modes at runtime

Four ways, in increasing discoverability:

1. **Settings → Mode**: scroll to the Mode group, tap a radio row.
2. **Control Center**: swipe down from the top-right corner of the
   device frame. The Mode segmented control is the first section.
3. **URL override**: `?mode=<id>` works in every environment. No
   gating. Sharable links into landing for demos:
   `https://phone.xo.builders/?mode=landing`
4. **The lime banner**: when the user is in any non-default mode,
   a small lime pill appears below the status bar on home. Tap to
   bounce back to default.

Programmatic switch from any client component:

```tsx
const { setMode } = useMode()
setMode("landing")                  // animated 600ms crossfade
setMode("landing", { instant: true })  // no animation
```

---

## Working today

- Two modes registered (`default`, `landing`)
- Default mode is `default` on first load (full app suite visible)
- Dynamic registry: register/unregister at runtime, React re-renders
- HomeScreen grid + Dock + Spotlight all filter by current mode
- Crossfade transition (~600 ms); reduced-motion falls back to
  ~120 ms opacity fade
- `localStorage.xo-mode-v1` persistence (versioned, schema v2)
- Cross-tab sync via `storage` event
- URL override `?mode=<id>` in every environment
- Settings Mode group (radio switcher + Reset)
- Control Center Mode segmented control (top of the panel)
- Non-default mode pill banner on home (tap to exit)
- Mode-hidden app banner in `XOAppShell` (tap to switch to the
  right mode)
- App-side `availableIn` opt-out (parsed + enforced)
- RBAC `requiredRoles` field stubs on `ModeBase` + `XOAppBase`
  (parsed, ignored at runtime)

---

## Not yet (planned)

| Feature | Plan ref |
|---|---|
| `setup` mode + onboarding flow | `MODES_PLAN.md` Phase 5 |
| Per-mode theming (wallpaper, status bar tint, Dynamic Island) | `MODES_PLAN.md` Phase 6 |
| RBAC enforcement (`requiredRoles` actually hides modes / apps) | `MODES_PLAN.md` Phase 7 |
| Forward vs sideways transition distinction (character beat) | `MODES_PLAN.md` §8.2 |
| Choreographed wallpaper + tint crossfade phases | Depends on per-mode theming |
| Mid-gesture cancellation when mode changes mid-drag | `MODES_PLAN.md` §8.6 |

---

## Common tasks

| I want to... | Do this |
|---|---|
| Add a new mode | Create `data/modes/<id>.ts` with `defineMode()` + register in `data/modes.ts` |
| Add an app to an existing mode | Add the path to that mode's `appPaths` (and optionally `dockPaths`) |
| Remove an app from a mode | Remove the path from that mode's `appPaths` |
| Reorder the dock for a mode | Reorder `dockPaths` (left-to-right is render order) |
| Hide an admin app from landing | Set `availableIn: ["default"]` on the app's `app.ts` |
| Change which mode is the first-load default | Change `DEFAULT_MODE_ID` in `data/modes.ts` |
| Test a mode without persisting it | Append `?mode=<id>` to any URL |
| Reset stuck mode state | Settings → Mode → "Reset mode state" |
| Switch modes from code | `const { setMode } = useMode(); setMode("landing")` |
| Read the current mode in a component | `const { currentMode, mode, modeApps } = useMode()` |
