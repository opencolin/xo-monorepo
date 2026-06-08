# xo-phone-os modes plan

High-level architecture plan for letting the phone OS present
**different interfaces** for different points in the user journey, or
for different audiences. Each interface (we call them "modes") owns
its own app inventory, its own dock layout, and optionally its own
shell theming.

No implementation, no code samples. Diagrams, decisions, and
phasing only. Pairs with `ARCHITECTURE.md` (current shape),
`CHARACTER_PLAN.md` (the character drives transitions), and
`GESTURE_PLAN.md` (Spotlight must respect modes).

---

## 1. Why modes

Today the phone is one fixed configuration: 13 apps in a 4-column
grid, 4 dock pins, every visitor sees exactly the same surface. That
fails three audiences immediately:

1. **First-time visitor.** Does not need Settings, Handbook, or
   Changelog on day one. Needs Coworker, Swarm, Pricing, Ask. Maybe
   four icons total, large and obvious, plus the character.
2. **User mid-setup.** Wants only the apps for the current step
   (auth, profile, workspace, integrations). Everything else is noise.
3. **Returning power user.** Wants the whole suite, dock pinned to
   what they actually use, Settings front and centre.

A mode is the smallest change that lets us serve all three from the
same OS without forking the codebase. The shell is the same; the
manifest is different.

---

## 2. Modes for v1

Three canonical modes ship first. Future modes are a free extension.

| Mode      | Audience                              | When it activates                              |
|-----------|---------------------------------------|------------------------------------------------|
| `landing` | First-time anonymous visitor           | Default on fresh load, no prior signal         |
| `setup`   | User actively onboarding               | User taps "Get started" or starts a Coworker   |
| `default` | Onboarded / returning user             | After `setup` completes, or signed-in user     |

Later modes (later, not in v1):

- `trial` (limited apps + trial-status banner)
- `authenticated` (any signed-in state; could collapse into `default`)
- `demo` (preset workspace for sales / prospect demos)
- `admin` (operator / support surface)
- `paused` (subscription lapsed; only billing-relevant apps active)

---

## 3. Mode resolution

Order of precedence when picking which mode applies on a given load:

```
   request boots
        │
        ▼
   1. URL query ?mode=foo                 (works in every env; no
                                           dev cookie gating per §16
                                           decision 5)
        │ not present
        ▼
   2. localStorage flag (xo-mode-v1)      (set after explicit user
                                           action via Settings or
                                           Control Center)
        │ not present
        ▼
   3. Auth signal                         (later: signed-in implies
                                           at least `default`)
        │ none / anonymous
        ▼
   4. DEFAULT_MODE_ID → `default`         (v1 default; landing is
                                           opt-in, not first-load.
                                           Existing users keep their
                                           familiar full app suite.)
```

The first-load default in v1 is `default` (full app suite). Landing
is opt-in for marketing scenarios. This is a change from earlier
drafts: shipping `landing` as the first-load default surprised
existing users by hiding apps they were used to.

URL overrides matter for two reasons: (a) demoing a specific mode to
a prospect, (b) developers iterating on a mode without resetting
their browser state. No gating means anyone can craft a URL into
any mode; modes are visibility, not security (RBAC, when it ships,
handles security).

---

## 4. Architecture: where modes live in the tree

A new `ModeProvider` sits outside everything else, so the active
mode is observable to the character, the gesture layer, the OS
shell, and every app. Modes never need to mutate; they are read-only
to consumers other than the provider itself + Settings.

```
   <ModeProvider>             ◀── NEW outer context
     │  currentMode, modeApps, modeDock, setMode, modeTheme
     │
     └─ <CharacterProvider>   (planned, character plan)
         │
         └─ <PhoneProvider>
             │
             └─ <GestureProvider>
                 │
                 └─ <DeviceFrame>
                     │
                     ├─ <StatusBar>           reads modeTheme tint
                     ├─ <HomeScreen>          reads modeApps
                     │   └─ <Dock>            reads modeDock
                     ├─ <AppView>             unchanged
                     ├─ <SpotlightPanel>      reads modeApps
                     └─ ...
```

Why outside everything: modes are the broadest reframing in the
system. Putting `ModeProvider` outside `PhoneProvider` means
`current` (active route) is computed inside a known mode, and
mode-switch actions can re-render the whole shell at once.

Why read-only to most consumers: only Settings (and the
character-driven onboarding transitions) write the mode. Apps
themselves never know the mode they were rendered in; they render
identically regardless. The mode controls visibility, not behavior.

---

## 5. Data model

Two design constraints from the v1 decisions in §16 shape this section:

- **Modes are dynamic.** New modes can be registered at runtime, not
  only at build time. A future plugin / external bundle adding a
  custom mode should not require editing the OS core.
- **Modes will gain RBAC later.** The data model carries optional
  role fields today (ignored at runtime); the role evaluator is a
  v1.5+ concern.

### 5.1 The mode definition

```
   lib/xo-mode.ts          ← new, mirrors the lib/xo-app.ts pattern
   ────────────────────
     defineMode({
       id,                   "landing" | "default" | "setup" | ...
       label,                short title for Settings
       description?,         one-line user-facing description
       appPaths,             string[]: which apps appear in this mode
       dockPaths,            string[]: max 4, must subset appPaths
       requiredRoles?,       string[]: RBAC stub, ignored in v1
       precedence?,          number:  resolution tiebreaker (default 0)
     })
     → ResolvedMode
```

`requiredRoles` is a forward seam. A mode with
`requiredRoles: ["admin"]` is data-marked as admin-only. v1 ignores
the field; v1.5+ adds a role evaluator that hides the mode from
non-admin users at the Settings switcher + suppresses Auto-resolution
into that mode.

### 5.2 The mode registry

```
   lib/xo-mode-registry.ts ← new, the dynamic-registration surface
   ────────────────────────
     createRegistry()        returns a singleton registry instance
     registry.register(mode) adds or replaces a mode by id
     registry.unregister(id) removes a mode (used by tests / plugins)
     registry.list()         current modes, sorted by precedence
     registry.subscribe(fn)  React-friendly subscription; fires on
                              register / unregister so the provider
                              re-renders

   data/modes.ts           ← thin, only the built-in modes
   ────────────────────
     import { registry } from "@/lib/xo-mode-registry"
     import landing from "./modes/landing"
     import defaultMode from "./modes/default"

     registry.register(landing)
     registry.register(defaultMode)
     export { registry }

   data/modes/
     landing.ts            ← one file per mode
     default.ts
     (setup.ts comes later, registered the same way)
```

`data/modes/<id>.ts` exports a `ResolvedMode`. Adding a new built-in
mode is "create the file + add a single register line." A
third-party plugin or A/B test can call `registry.register()` from
its own bundle without touching core. No central modes array to
edit.

`ModeProvider` reads the registry via `useSyncExternalStore` so
React re-renders correctly when a mode is added or removed
mid-session (e.g. a feature flag deciding to surface a custom mode
after auth).

### 5.3 Two layers of opt-in

- **Mode-side**: each `data/modes/<id>.ts` declares which app paths
  it includes. The registry's `list()` is the source of truth.
- **App-side**: an app can opt out of certain modes by setting
  `availableIn: ModeId[]` in its `app/<route>/app.ts`. Useful for
  apps that genuinely belong to one mode only (an internal admin
  app should never appear in `landing`, even if a registered mode
  tries to include it).

Both layers must agree before an app shows up: the app's path must
be in the mode's `appPaths`, AND if the app has `availableIn`, the
mode's id must be in that list. Two layers matter because
third-party modes can register; apps stay defensive without trusting
external mode definitions.

### 5.4 XOAppBase additions (optional)

```
   lib/xo-app.ts (existing, extended)
   ────────────────────
     XOAppBase gains:
       availableIn?:    ModeId[]    app-side mode opt-out
       requiredRoles?:  string[]    RBAC stub, ignored in v1
```

Both fields are optional. Existing `app/<route>/app.ts` files do not
need to change. Apps that gain access restrictions later just add
`availableIn` and/or `requiredRoles` to their existing spec.

---

## 6. Per-mode dock

Each mode declares its own dock paths. The Dock component reads from
`modeDock` instead of the global `dockApps()`.

Example layouts:

```
   landing dock   ┌────┬────┬────┬────┐
                  │ Co │ Sw │ $  │ ?  │   Coworker, Swarm, Pricing, Ask
                  └────┴────┴────┴────┘

   setup   dock   ┌────┬────┬────┬────┐
                  │ ☑  │ 👤 │ 🔌 │ ⚙  │   Checklist, Profile, Integrations, Settings
                  └────┴────┴────┴────┘

   default dock   ┌────┬────┬────┬────┐
                  │ Co │ Sw │ ⚙  │ ?  │   Coworker, Swarm, Settings, Ask
                  └────┴────┴────┴────┘
```

Constraints (same as today):

- Max 4 dock pins per mode (visual constraint)
- Dock paths must also be present in the mode's `appPaths`
- The home tile ("XO") is *not* in the dock; it's the home indicator
  + home gesture

---

## 7. App filtering, by surface

| Surface       | How it picks apps                              |
|---------------|------------------------------------------------|
| HomeScreen grid | `modeApps.filter(a => !a.href)` (external tiles still excluded from grid as today) |
| Dock          | `modeDock` (mode-declared, max 4)              |
| Spotlight     | `modeApps` (mode-aware app search; v1 already filters out `kind: "external"`) |
| Character     | `modeApps` when surfacing "have you tried…" hints |
| AppView       | `findApp(path)` (unchanged: direct URL access works regardless of mode, see §10 for mode-hidden access policy) |

The OS shell components stay the same files; they just consume
different data depending on the mode.

---

## 8. Mode-change transitions

A mode change is the biggest reframing in the OS short of a route
load. The previous draft sketched the visuals; this section is the
mechanics. It covers the three transition kinds, who orchestrates
them, what happens to the foreground app, mid-gesture conflicts,
race conditions, and reduced-motion paths.

### 8.1 Three kinds of transition

| Kind | Triggered by | Animated? | Use case |
|---|---|---|---|
| **Forward (choreographed)** | User progressing the journey: "Get started" on landing, "Setup complete" in setup | Yes, the full ~900 ms sequence below | First time landing → setup, first time setup → default |
| **Sideways (choreographed)** | User explicit switch in Settings; never automatic | Yes, but shorter (~500 ms) and without the journey-emphasis cues (no character beat) | Going default → landing for a screenshot, demo mode toggling |
| **Instant** | Dev URL `?mode=`, hot-reload, cross-tab `storage` event re-sync | No, hard cut | Debugging, multi-tab coherence |

Distinguishing forward vs sideways matters because forward sells
progress; sideways must feel low-stakes so users don't think they
broke something.

### 8.2 The forward transition, timeline

The full choreography runs in five overlapping phases. Total
duration ~900 ms. Layered intentionally so the user feels motion
without each piece feeling sequential.

```
Time (ms):  0     100   200   300   400   500   600   700   800   900
            |     |     |     |     |     |     |     |     |     |
gesture     █████████████████████████████████████████████████████
lockout

old icons   ▼ scale 1.00 → 0.96, opacity 1 → 0
            ────────────────►
            (0 → 250)

old dock    ▼ slides down 8px, opacity 1 → 0
            ────────────────►
            (0 → 250)

wallpaper                ▼ crossfade old → new (300 ms ease-out)
                         ─────────────────────►
                         (150 → 450)

status bar                      ▼ tint shift (300 ms ease-in-out)
                                ─────────────────────►
                                (250 → 550)

new dock                                    ▼ slides up 8px, opacity 0 → 1
                                            ─────────────────────►
                                            (450 → 700)

new icons                                       ▼ scale 1.04 → 1.00, opacity 0 → 1
                                                ─────────────────────►
                                                (500 → 750)

character                                                 ▼ greet new mode
                                                          ─────────────────►
                                                          (700 → 900+)
```

Why this ordering:

- **Icons leave first.** The old grid going dark is the user's
  visual confirmation that the request landed.
- **Wallpaper crosses in the middle.** The mode's signature color
  appears while the icon area is empty, so the eye reads the new
  mood before processing new icons.
- **Status bar shifts last in the "system" pass.** Subtle cue that
  the OS, not just the home screen, has changed.
- **New icons arrive over the new wallpaper.** They feel placed
  into a fresh environment, not on top of the old one.
- **Character speaks AFTER the visual settles.** Voice on top of
  motion is too much; let the eyes finish, then ear.

### 8.3 The sideways transition, timeline

When the user toggles the mode radio in Settings, the change is
real but should not feel ceremonial. ~500 ms, fewer phases.

```
Time (ms):  0     100   200   300   400   500
            |     |     |     |     |     |
gesture     █████████████████████████████
lockout

home grid   ▼ crossfade old → new (400 ms, cross-dissolve)
            ──────────────────────►

status bar             ▼ tint shift (200 ms ease)
                       ──────────►

wallpaper                    ▼ crossfade (300 ms)
                             ───────────►

(no scale or slide motion; no character beat)
```

If the user is on the home screen during a sideways switch, only
icons + dock + wallpaper change. If they are inside an app, see
§8.5.

### 8.4 The instant transition

Hard cut. The provider updates `currentMode`, every consumer
re-renders with the new data on the next paint. No animation, no
gesture lockout (the change is operator-controlled, the user is not
mid-gesture).

Use cases:

- `?mode=setup` URL override on first load (dev / demo)
- `?mode=` change without reload (browser back / forward in dev)
- `storage` event sync (another tab changed the mode; this tab
  hard-cuts to match within the next render)
- Hot-reload during development

### 8.5 What happens to the foreground app

If the user is inside an app (`current !== "/"`) when a mode change
fires, three paths depending on whether the app survives the new
mode:

```
   current app's path in newMode.appPaths?
   ┌─────────────────────────────────────────┐
   │                                         │
   │  YES → app stays open                   │
   │        - mode transition runs in        │
   │          background (wallpaper, status  │
   │          bar tint update under AppView) │
   │        - user notices when they next    │
   │          go home                        │
   │                                         │
   │  NO  → app must close                   │
   │        Two policies:                    │
   │                                         │
   │        A. Forward transition: animate   │
   │           goHome FIRST (~300 ms), THEN  │
   │           run the mode transition. User │
   │           sees their app close, then    │
   │           the new mode unveils.         │
   │                                         │
   │        B. Sideways transition: keep     │
   │           the app open but render a     │
   │           banner: "Not available in     │
   │           {newMode}, tap to leave." A   │
   │           soft promo, never a forced    │
   │           redirect.                     │
   │                                         │
   └─────────────────────────────────────────┘
```

Forward = ceremonial = forced redirect home. Sideways = low-stakes
= soft banner. Matches §10's general policy for direct-URL access
to mode-hidden apps.

### 8.6 Mid-gesture mode changes

A mode change can fire while the user is mid-drag on a panel
gesture (cross-tab sync is the most likely trigger; user
deliberately mid-gesturing while their other tab toggles a mode).

Resolution, in order:

1. **Cancel the in-flight gesture.** The GestureSurface releases
   pointer capture and snaps the panel back to its closed state
   (animate to t=0).
2. **Close any settled-open panel.** If notif/control/spotlight
   was already open at t=1, animate it shut (same path as scrim
   tap).
3. **Wait one frame.** Gives the panel close a moment to register
   without overlapping with the mode crossfade.
4. **Run the mode transition** (forward or sideways).
5. **Release the gesture lockout** when the transition settles.

The character (when built) also retracts during the transition and
re-emerges after.

### 8.7 Race conditions and tiebreakers

| Race | Tiebreaker |
|---|---|
| Two tabs change mode simultaneously | Later `lastChangedAt` timestamp wins. The losing tab catches up on its next `storage` event. |
| User clicks Settings radio + URL override fires same tick | URL override is read at boot only; in-session, the latest `setMode` call wins. |
| Forward transition mid-flight + user opens an app | Drop the navigation; transitions are atomic. Show a tiny "transitioning…" hint near the dock (~200 ms) if the tap was just before the lockout engaged. |
| Mode changes while the lockscreen is shown | Mode change applies in the background. User sees the new mode only after unlock. Lockscreen never animates a mode transition; it is its own surface. |
| Auth signal arrives mid-session promoting `landing` → `default` | Treat as a forward transition with the full sequence. User sees their sign-in actually mean something. |

### 8.8 Where transition logic lives

```
   ModeProvider                  exposes setMode(id), currentMode
     │  keeps state pure: which mode is active.
     │  Does NOT orchestrate visuals.
     │
     ▼
   <ModeTransitionLayer/>        NEW component, mounted inside
     │  DeviceFrame above panels but below status bar.
     │  Subscribes to currentMode changes; runs the choreography.
     │  Writes to shared MotionValues that the wallpaper, icons,
     │  dock, and status bar all read from.
     │
     ▼
   shell consumers               read currentMode + the shared
     - HomeScreen (icons)        MotionValues. They render the
     - Dock                      "current mode" data, animated by
     - StatusBar                 the values the transition layer
     - Wallpaper                 wrote.
```

This split keeps two concerns separate:

- **Mode = data.** `ModeProvider` is the source of truth for which
  mode is active and which apps belong to it. It does not animate
  anything.
- **Transition = motion.** `ModeTransitionLayer` is the only
  component that knows about phases, timings, and ordering. If the
  choreography changes, only that file changes.

Most shell components do not need to know a transition is
happening; they read the active mode + the transition layer's
motion values, and the math handles itself.

### 8.9 Reduced-motion behavior

`prefers-reduced-motion: reduce` cuts the choreography aggressively:

| Phase | Normal | Reduced motion |
|---|---|---|
| Icon scale + slide | 250 ms spring | Skipped; opacity fade only, 120 ms |
| Wallpaper crossfade | 300 ms tween | 120 ms opacity fade |
| Status bar tint shift | 300 ms tween | Hard cut |
| Dock slide | 250 ms spring | Skipped; opacity fade only, 120 ms |
| Character beat | Plays after | Plays after (text only) |
| Total duration | ~900 ms | ~150 ms |

The transition becomes essentially a cross-dissolve. Mode change
still feels deliberate (because the wallpaper and icons change),
but motion sickness is avoided.

### 8.10 Animation primitives reused

Everything in the choreography is built from primitives already in
the codebase. No new animation library:

- **Springs**: same `PANEL_SPRING` (stiffness 280, damping 28) as
  the gestures + icon-to-app morph
- **MotionValues + useTransform**: same pattern as
  `components/gestures/glass.tsx` for opacity / scale interpolation
- **AnimatePresence**: same usage as the LockScreen's slide-up
- **`useReducedMotion`** hook from framer-motion: single source of
  truth for the reduced-motion fallback path

### 8.11 The lockscreen interaction

Mode change and lock are orthogonal but they intersect in one
scenario: cross-tab mode change while a user is on the lockscreen.

Behavior: the mode change applies silently in the background. The
lockscreen does not animate or react. When the user unlocks (via
the slow slide-up animation), the new mode is what they see.
There is no "mode transition + unlock simultaneously" choreography
in v1; one finishes before the other begins.

### 8.12 Persistence timing

Mode changes are optimistic UI. The sequence:

1. User clicks Settings radio → `setMode(newId)` called
2. ModeProvider updates `currentMode` state immediately
3. ModeTransitionLayer kicks off the choreography
4. In parallel: localStorage write fires
5. If localStorage write fails (private mode, quota), the UI still
   works for the session; a console warning is logged; reload
   reverts to whatever was last persisted

Never block the transition on persistence. The visual is the
contract; storage is best-effort.

### 8.13 The gesture lockout window

`GestureProvider.lockGestures(ms)` already exists; the transition
layer calls it at the start of every choreographed transition:

- Forward: lockout = 900 ms (matches full timeline)
- Sideways: lockout = 500 ms
- Instant: no lockout

During lockout, panel gestures (notif, control, Spotlight) are
suppressed. Bottom-edge home gesture is also suppressed during
forward transitions so the user cannot navigate during the
ceremony. PTR (in-app) is unaffected; it does not interact with
the OS-level transition.

---

## 9. Persistence

localStorage key: `xo-mode-v1`

Shape (versioned so a future schema bump can migrate cleanly):

```
   {
     "v": 1,
     "currentMode": "default",
     "completedModes": ["landing", "setup"],
     "lastChangedAt": "<ISO timestamp>"
   }
```

`completedModes` matters for the character: once `setup` is in the
completed list, the character stops nudging the user toward setup
and starts surfacing power-user hints instead.

Storage is a cache, not the source of truth. Auth state always
wins. A signed-in user with `currentMode = "landing"` in localStorage
gets upgraded to at least `default` on next boot.

---

## 10. Direct URL to a mode-hidden app

A user in `landing` mode visits `/handbook` (which is `default`-only):
two options.

| Option | Behavior | Default |
|---|---|---|
| **A. Show it anyway** | Render the app, but show a small banner: "This is a `default`-mode app. Get the full XO experience." | Recommended: A |
| B. Redirect home | Navigate to `/`, optionally with a toast | Aggressive; breaks shared links |

Default A keeps links shareable and never breaks navigation. The
banner is a soft promo, not a wall.

---

## 11. Switching modes (four entry points)

v1 ships four ways to change mode, in increasing discoverability:

### Settings → Mode group

The canonical switcher. Radio list of every registered mode + a
"Reset mode state" button.

```
   ┌─ Mode ──────────────────────────────────┐
   │  ● Default                               │
   │  ○ Landing                               │
   │                                          │
   │  Reset mode state                ›       │
   └──────────────────────────────────────────┘
```

### Control Center → Mode segmented control

Swipe down from the top-right corner. Mode picker is the first
section, ahead of Real toggles + Decorative. One-tap switch from
any screen.

```
   ┌─ Mode ─────────────────────────┐
   │  ┌────────┬────────┐           │
   │  │ Default│Landing │           │
   │  └────────┴────────┘           │
   └────────────────────────────────┘
```

### URL override

`?mode=<id>` honored in **every environment** per §16 decision 5.
No dev cookie required. Modes never control access to sensitive
functionality; RBAC will, later.

### Non-default mode banner

When the user is in any mode other than `default`, a slim lime pill
appears below the status bar on the home screen:

```
   ●  Landing mode  ·  tap to exit
```

Tap the pill, return to `default`. Renders nothing in default mode
so the home screen stays clean.

Both the Settings list and the Control Center segmented control
are rendered from the live mode registry (§5.2), so any mode that
registers (built-in, plugin, A/B test) shows up automatically.
RBAC-gated modes will be hidden by the role evaluator (Phase 7).

---

## 12. Per-mode theming

**Out of scope for v1** per the §16 decision: single theme for all
modes. Every mode shares the current dark + XO-lime look. No
per-mode wallpaper, no per-mode status bar tint, no per-mode
Dynamic Island variations.

This means the §8.2 forward transition diagram has two phases that
become no-ops in v1: the **wallpaper crossfade** and the
**status bar tint shift**. The remaining phases (icon scale-out,
new icon scale-in, dock slide, character beat) still run. Total
transition duration shrinks from ~900 ms to ~600 ms because the
wallpaper / tint passes are skipped.

When per-mode theming is added in v1.5+, the seam is
`ModeDef.theme?: ModeThemeSpec` (mirroring the `shell` field on
`XOAppBase` proposed in `LIFECYCLE.md` §4). The ModeTransitionLayer
already orchestrates the choreography; turning on theming is adding
the missing tween targets. No core refactor required.

---

## 13. Cross-mode invariants

Some apps appear in every mode. Some appear in no mode but are
reachable as external links.

| App / surface | Mode behavior |
|---|---|
| **Settings** | Available in every mode. Listed in every mode's `appPaths`. Mode switcher lives here. |
| **Ask XO** (character chat) | Available in every mode. The character is mode-aware. |
| **signup-external** | Always in every mode's dock (external tile, opens new tab). |
| **Home (`/`)** | Not really an app; the home tile is the home screen itself. Same in every mode. |
| Onboarding-only apps (`setup-welcome`, etc.) | Only in `setup` mode. `availableIn: ["setup"]`. |
| Power-user apps (Handbook, Changelog, internal docs) | Only in `default`. |
| Landing-only apps (a marketing video player, a pricing comparator) | Only in `landing`. |

Convention: list universal apps explicitly in every mode's
`appPaths`, rather than building an "always-visible" exception. The
data is slightly more verbose but the resolution rule stays simple.

---

## 14. Phased build

Each phase keeps the OS working. v1 scope is Phases 1 to 4. `setup`
and per-mode theming are explicit follow-ons.

```
   v1 phases
   ─────────

   Phase 1 → registry + ModeProvider scaffold
           - lib/xo-mode.ts (defineMode)
           - lib/xo-mode-registry.ts (createRegistry, register,
             list, subscribe)
           - data/modes.ts registers the built-ins
           - data/modes/landing.ts + data/modes/default.ts
           - ModeProvider reads registry via useSyncExternalStore
           - currentMode resolves but no UI yet

   Phase 2 → ModeTransitionLayer + mode-aware surfaces
           - new <ModeTransitionLayer/> orchestrates choreography
           - HomeScreen reads modeApps via provider
           - Dock reads modeDock via provider
           - SpotlightPanel filters by modeApps
           - both modes ship with their distinct dock layouts
           - choreographed transition runs (~600 ms; no wallpaper
             / tint phases because §12 is out of scope)

   Phase 3 → persistence + Settings switch + URL override
           - localStorage `xo-mode-v1`
           - new "Mode" group in Settings with the radio switcher
           - ?mode=foo URL override active in all environments
             (no dev cookie gating per §16 decision 5)
           - "Reset mode state" button

   Phase 4 → app-side opt-out + RBAC field stubs + ModeTransitionLayer
             polish
           - XOAppBase.availableIn / requiredRoles fields wired
             through (parsed, currently ignored by the role
             evaluator)
           - sideways transition timing locked in (§8.3)
           - mid-gesture + cross-tab race handling (§8.6, §8.7)
           - reduced-motion fallback paths (§8.9)

   v1 total: ~5 to 7 days. Smaller than the previous estimate
   because per-mode theming (Phase 5) is now out of scope.

   ─────────
   v1.5 phases (shipped together)
   ─────────

   Phase 5 → `setup` mode                                    DONE
           - data/modes/setup.ts + four setup-only apps
             (setup-welcome / -profile / -workspace /
             -integrations)
           - "Get started" tile on landing dock and a Begin
             setup button on /setup-welcome both transition
             landing → setup
           - SetupContinueLink steps through profile →
             workspace → integrations
           - FinishSetupButton on /setup-integrations
             transitions setup → default and goes home
           - all three core modes registered

   Phase 6 → per-mode theming                                DONE
           - ModeBase gains theme?: ModeTheme with accent,
             wallpaperBase, statusBarTint fields
           - HomeScreen Wallpaper reads accent + wallpaperBase
             and crossfades via AnimatePresence keyed by mode
           - ModeBanner pill uses theme.accent (was hardcoded
             lime)
           - StatusBar wraps in motion.div animating its
             backgroundColor to theme.statusBarTint
           - Setup mode ships a warm amber theme distinct from
             the XO lime default

   ─────────
   Later: Phase 7 (open questions to resolve first)
   ─────────

   Phase 7 → RBAC
           - role evaluator + auth integration
           - Settings hides modes the current user cannot access
           - URL override into a role-gated mode redirects to the
             user's highest-permission mode
```

Estimate (single engineer):

| Phase | Status | Effort |
|---|---|---|
| 1 registry + provider scaffold | DONE | ~1 day |
| 2 ModeTransitionLayer + mode-aware surfaces | DONE | ~2 days |
| 3 persistence + Settings + URL | DONE | ~1 day |
| 4 app-side opt-out + transition polish | DONE | ~1 to 2 days |
| 5 setup mode | DONE | ~2 to 3 days |
| 6 per-mode theming | DONE | ~1 to 2 days |
| 7 RBAC | open questions | ~2 to 3 days (depends on auth integration) |

---

## 15. Risks

| Risk | Likelihood | Mitigation |
|---|---|---|
| User in `landing` mode shares `/handbook` link; recipient hits a hidden app | High | §10 policy A: show the app with a soft banner, never block |
| Mode changes feel jarring between visits ("why are my icons different?") | Medium | Persist mode in localStorage; only change on explicit user action |
| Multi-tab divergence (user has landing in one tab, default in another) | Medium | Listen to `storage` event; sync mode across tabs on change |
| Spotlight surfaces mode-hidden apps if filtering is missed | Medium | One source of truth (`modeApps`); audit every surface that lists apps |
| `setup` mode designed around a flow that changes after launch | Medium | Make the setup flow itself data-driven (a list of setup steps in `data/setup.ts`), not a hardcoded route sequence |
| Per-mode wallpaper crossfade causes hydration mismatch | Low | Mode is read on the client only; server always renders the `landing` wallpaper, client swaps after mount |
| Settings switch lets users accidentally enter unsupported modes | Low | Settings only exposes "user-facing" modes; admin / debug modes are URL-only |
| Apps designed for one mode break visually in another | Low | Apps render identically regardless of mode (modes control visibility, not behavior); regression caught by smoke test |

---

## 16. Decisions (resolved)

| # | Decision | Resolution | Implication |
|---|---|---|---|
| 1 | Mode count for v1 | **2 modes** (`landing` + `default`). `setup` deferred. | Phase 4 of the build (§14) becomes optional / later. Architecture must support adding `setup` later without refactor (see new constraint below). |
| 1b | Dynamic mode registration | **Required.** Architecture must let new modes be registered at runtime, not only at build time. | Drives §5.2: the mode registry pattern. Adding `setup` later is "create `data/modes/setup.ts` + one `registry.register()` call." Third-party plugins / A/B tests can register modes from their own bundles. |
| 2 | Naming | **Mode** | Terminology locked. Code uses `ModeId`, `ResolvedMode`, `ModeProvider`, `data/modes/`. |
| 3 | Mode-hidden app access | **Option A** (show app with soft banner) | §10 already documents this. Deep links and direct URLs never fail; banner promotes the right mode. |
| 4 | Per-mode theming | **Not in v1.** Single theme across all modes. | §12 rewritten as out-of-scope. The §8.2 transition skips the wallpaper-crossfade and status-bar-tint phases; total transition shrinks ~900 ms → ~600 ms. Seam (`ModeDef.theme?`) preserved for v1.5+. |
| 5 | URL override gating | **None.** `?mode=foo` works in any environment without a dev cookie. | Settings stays the canonical switcher; URL is a convenience for demos and bookmarks. Trade-off accepted: a random visitor can land in a non-default mode by URL; not a security boundary, just visibility. |
| 6 | Settings per-mode | **Universal** in v1. RBAC arrives later. | All users see the same Settings options today. When RBAC ships (v1.5+), the role evaluator hides mode entries the current user cannot access; Settings shape itself stays universal. |

### Knock-on changes baked in elsewhere

- §5 Data model rewritten around the dynamic registry pattern.
- §12 Per-mode theming marked out of scope; transition timeline
  noted as shortened to ~600 ms.
- §14 Phasing still lists Phase 4 (`setup` mode) but it is now a
  later phase rather than mandatory v1.
- §16 (this section) is no longer "decisions before Phase 1"; it is
  the resolution record. Any new decision lands here.

---

## 17. Plugs into existing plans

- **Character plan.** The character is mode-aware. In `landing` it
  greets and pitches; in `setup` it walks through the steps as the
  guide; in `default` it surfaces tips. The mode transitions
  (`landing → setup → default`) are the character's main journey.
  When character ships, `CharacterContext` reads `currentMode` from
  `ModeContext` to pick its script and tone.
- **Gesture plan.** Spotlight already filters by `apps.filter(a =>
  a.kind !== "external")`; that becomes `modeApps.filter(...)`. No
  other gesture cares about mode (panels are universal).
- **Lifecycle / animation.** Mode-level shell theming reuses the
  `shell` field convention proposed in `LIFECYCLE.md` §4 (status bar
  tint, bezel class, Dynamic Island kind). Same seam, broader scope.
- **App architecture.** App opt-out via `availableIn` is the same
  declarative-on-app.ts pattern that `gesture.pullToRefresh` uses.
  Apps stay self-describing.
- **`ADDING_APPS.md`** (existing doc on adding more app kinds): when
  a new app is added, the author also picks which mode(s) include
  it. The next iteration of that doc should mention modes
  explicitly.

---

## 18. Out of scope for v1

- Custom user-created modes ("save my current dock as a new mode")
- Per-account modes (different users see different curated apps)
- Server-side mode resolution that affects SSR (Phase 1 is fully
  client-side, all routes still SSR the same HTML and the client
  filters after hydrate)
- Time-of-day / context-aware modes (like iOS Focus filters)
- Multi-mode composition ("default + admin" union)
- Mode-aware route gating (a hidden app responds 404 in landing
  mode; we always 200 and let the client decide visibility)

---

## 19. What you actually feel as a user

Three quick walkthroughs to make the abstract concrete.

**First visit (anonymous, no localStorage):**

```
   Browser loads /
   ModeProvider resolves → landing
   HomeScreen renders 4 to 6 large marketing apps
     [Coworker]  [Swarm]  [Pricing]  [Ask]
     [Demo]      [Get started ▶]
   Dock: Co, Sw, $, ?
   Status bar: subtle lime tint
   Character (when built) greets: "hi, i'm xo. tap any app."
```

**Tap "Get started":**

```
   Crossfade (~600 ms):
     wallpaper deepens
     icons fade out
     status bar tint shifts to setup-blue
     new icons fade in:
       [Welcome]  [Profile]  [Workspace]  [Integrations]
       [Skip setup]                       [Settings]
     Dock: ☑, 👤, 🔌, ⚙
   ModeProvider → setup, localStorage updated
   Character: "let's get you set up. start with Welcome."
```

**Setup completes → returning visit:**

```
   ModeProvider resolves → default (from localStorage)
   HomeScreen renders the full app suite (current 13 apps)
   Dock: Co, Sw, ⚙, ?
   Status bar: ink default
   Character: ambient mode, only chimes in on first-visit-of-app
```

Each visit feels coherent within its mode; transitions feel
deliberate, not jittery.
