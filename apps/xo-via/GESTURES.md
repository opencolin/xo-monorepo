# Gestures, a one-pager

iPhone-style swipe + drag interactions inside the phone screen.
Five v1 gestures, one state machine, one pointer coordinator
(`GestureSurface`). Everything routes through there.

Full design: `GESTURE_PLAN.md`. This page is the cheat sheet.

---

## The five v1 gestures

| Gesture | Where it starts | What it does |
|---|---|---|
| Swipe up | bottom 30 px | Goes home; unlocks if the device is locked |
| Swipe down | top 24 px, left half | Opens Notification panel |
| Swipe down | top 24 px, right half | Opens Control Center |
| Pull down on home | top half of icon grid (only on `/`) | Opens Spotlight |
| Pull-to-refresh | scrollTop = 0 in an app body | Re-runs the app's refresh intent |

---

## Zones, visually

```
   ┌──────────────────────────────────────────┐
   │ ↓ notif zone        ↓ control zone       │ top 24 px
   ├──────────────────────────────────────────┤
   │                                          │
   │  home grid (top half):                   │
   │     Spotlight pull-down                  │ conditional
   │                                          │ (only on home)
   │  in an app:                              │
   │     PTR if app opted in                  │ per-app opt-in
   │                                          │
   ├──────────────────────────────────────────┤
   │       ↑ home / unlock zone               │ bottom 30 px
   └──────────────────────────────────────────┘
```

Zones are invisible. Touches starting outside a zone fall through
to the app content as normal.

---

## The state machine

Each gesture moves through five phases. Multi-touch ignored in v1.

```
   IDLE
     │ pointerdown lands in a reserved zone
     ▼
   RECOGNIZING
     │ user moves > 8 px in axis (and not > 12 px off-axis)
     ▼
   TRACKING
     │ panel motion-value follows the finger 1:1
     │ pointerup
     ▼
   COMMITTING
     │ distance > 30% of travel OR velocity > threshold?
     │   yes → animate to OPEN / closed / home / unlocked
     │   no  → spring back to closed
     ▼
   SETTLED
     │ state recorded in context
     ▼
   IDLE
```

Off-axis cancel during RECOGNIZING is what lets normal scrolls
keep working. A drag that starts in the bottom zone but moves
sideways releases the pointer back to the page.

---

## Arbitration: who owns a pointer?

```
   pointerdown
     │
     ├─ A panel already open? ─────► route touch to the panel
     │                               (scrim closes it, drag closes it)
     │
     ├─ Device is locked? ──────────► only the bottom zone is active;
     │                               everything else released
     │
     ├─ Inside an edge zone? ──────► claim, preventDefault, track
     │
     ├─ In Spotlight zone (on home)? ─► claim AFTER 8 px of movement
     │                                (so plain taps still open icons)
     │
     ├─ In-content at scrollTop=0 and PTR opted in? ─► track PTR
     │
     └─ Else ─────────────────────► release to page; ignore
```

Three rules to internalize:

1. **Open panels win.** Every touch goes to the open panel until it
   closes.
2. **Edge corners are exclusive.** The bottom + two top corners
   belong to the gesture coordinator. They always preventDefault.
3. **Content-area gestures are conditional.** Spotlight needs the
   home route; PTR needs scrollTop = 0 and an app opt-in.

---

## How each gesture changes other components

### Bottom-edge swipe up

| Reads | Writes |
|---|---|
| `LockContext.locked` | When locked: `LockContext.unlock()` (lockscreen slides up over ~850 ms) |
| `PhoneContext.current` | When unlocked: `PhoneContext.goHome()` + `router.push("/")` |
| | `GestureContext.lockGestures(280)` so a stacked gesture cannot fight the layoutId morph |

### Top-left swipe down (Notifications)

| Reads | Writes |
|---|---|
| Nothing external | `GestureContext.openPanel = "notifications"` |
| | `notifT` motion value (0 closed, 1 open) drives `NotificationPanel` |
| | Scrim activates `pointer-events: auto` |
| | Other gestures suppressed by the "open panel wins" rule until close |

### Top-right swipe down (Control Center)

| Reads | Writes |
|---|---|
| `ModeContext.currentMode`, `ModeContext.modes` (for the Mode segmented control inside the panel) | `GestureContext.openPanel = "control"` |
| | `controlT` motion value drives the panel |
| | Mode segmented control inside the panel can call `ModeContext.setMode(id)` which **does not animate while panel is open** (the home crossfade happens behind the scrim) |

### Pull down on home (Spotlight)

| Reads | Writes |
|---|---|
| `PhoneContext.current` (must be `/`) | `GestureContext.openPanel = "spotlight"` |
| `ModeContext.modeApps` (the search results are filtered) | `spotlightT` motion value drives the panel |
| | Tapping a result: `closeAll()` + `PhoneContext.openApp(path)` + `router.push(path)` |

### Pull-to-refresh in an app

Lives **outside** `GestureSurface`. `PullToRefresh` is its own
pointer listener attached to the scroll container inside
`AppView`.

| Reads | Writes |
|---|---|
| `app.gesture.pullToRefresh` (opt-in + intent) | While pulling: scroll container translates Y, spinner reveals |
| Scroll container's `scrollTop` | On commit: runs the configured intent (router.refresh / iframe reload / api refetch / custom) |
| | Snaps back to 0 once the intent resolves |

---

## How the lockscreen changes gestures

When `LockContext.locked === true`:

- Top-left + top-right + Spotlight zones short-circuit at
  `pointerdown`. They never become claimed.
- Bottom-edge zone is still active, but its commit calls
  `LockContext.unlock()` instead of `goHome()`.
- PTR is unreachable because the user cannot reach an app
  body while locked.

When the lockscreen slides up (unlock), `lockGestures(280)`
fires so no stacked gesture fires mid-animation.

---

## How modes change gestures

Mode doesn't change *what* gestures fire. Mode changes *what
they reveal*:

| Surface | Mode dependency |
|---|---|
| Spotlight search results | Filtered by `modeApps`; landing has 6 results, default has 13 |
| Control Center → Mode picker | Renders one pill per registered mode (registry-driven) |
| Notifications | No mode dependency (v1: empty state for all modes) |
| Home + Unlock | No mode dependency |
| PTR | No mode dependency (per-app spec) |

---

## Working today

- All five v1 gestures wired through `GestureSurface`
- Glass-morphism panels (Notifications, Control Center, Spotlight)
- Spotlight respects mode + search filters by label
- Control Center exposes Mode segmented control, three real
  toggles (reduced motion, theme placeholder, XO visibility),
  four decorative tiles
- PTR with default intents for `native`, `mdx`, `iframe`, `api`
  app kinds; one opt-in example wired (Docs)
- Pointer-capture during TRACKING; off-axis cancel; gesture
  lockout window
- Suppressed when locked (only bottom-edge active)
- Spotlight has a back button + scrim tap to close

---

## Not yet (planned)

| Feature | Plan ref |
|---|---|
| App switcher (swipe-up-and-hold) | `GESTURE_PLAN.md` v2 |
| Back gesture (left-edge swipe right) | v2 |
| Long-press app icons (context menu) | v2 |
| Haptics (Vibration API) | v2 |
| Notification real content | Separate feature |
| Spotlight real search content | Separate feature |

---

## File map

```
lib/gestures/constants.ts          thresholds, spring config
lib/gestures/zones.ts              zone hit-testing helper
context/GestureContext.tsx         provider, motion values, openPanel
components/gestures/GestureSurface.tsx     the pointer orchestrator
components/gestures/NotificationPanel.tsx
components/gestures/ControlCenterPanel.tsx (includes Mode picker)
components/gestures/SpotlightPanel.tsx     (mode-filtered)
components/gestures/PullToRefresh.tsx      (used by AppView)
components/gestures/glass.tsx              shared glass styles
components/HomeIndicator.tsx       visual stub; logic lives in GestureSurface
```

---

## Common tasks

| I want to... | Do this |
|---|---|
| Add a new edge gesture | Extend `zones.ts` with a new zone, extend `GestureSurface` arbitration + tracking branch |
| Add a toggle to Control Center | Add a new `<Toggle/>` row inside the panel's "Real toggles" or "Decorative" section |
| Make an app PTR-enabled | Set `gesture: { pullToRefresh: { enabled: true } }` in the app's `app.ts` |
| Add a new panel | New panel component + new motion value in `GestureContext` + new arbitration branch + new zone |
| Change the panel spring | Edit `PANEL_SPRING` in `lib/gestures/constants.ts` (also affects mode crossfade and lockscreen unlock) |
| Tune the recognition threshold | `RECOGNITION_PX`, `OFF_AXIS_CANCEL_PX`, `COMMIT_DISTANCE_RATIO` in the same file |
