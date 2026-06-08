# xo-phone-os lockscreen plan

High-level architecture plan for an iPhone-style lockscreen that
gates entry to the OS. Boot → lockscreen with wallpaper + clock →
swipe up to unlock → home screen (in whatever mode is active).

No implementation, no code samples. Diagrams, decisions, phasing.

Pairs with `ARCHITECTURE.md` (current shape), `MODES_PLAN.md`
(unlocked into which mode), `CHARACTER_PLAN.md` (character greets
post-unlock), `GESTURE_PLAN.md` (the unlock gesture is the home
gesture, re-purposed when locked).

---

## 1. Why a lockscreen

Three jobs at once:

1. **First-impression real estate.** A landing page on a desktop is
   a hero section. On a phone OS, the lockscreen IS the hero. It is
   the largest piece of brand surface anyone sees, and it appears
   before anything else. Wallpaper + clock + a single gesture = a
   single, confident introduction.
2. **Theatre of the unlock.** Tapping a marketing site to "enter"
   feels weak. Swiping up to unlock a phone feels real. The gesture
   is small but it shifts the user from "I am browsing a website"
   to "I am holding a phone."
3. **Natural sequence boundary.** Today the OS dumps the visitor
   straight into the home grid. The lockscreen gives us a beat
   before the icons appear, where the wallpaper sets the mood, the
   clock proves the OS is real and live, and the character can
   greet the moment the screen unlocks.

A clean implementation also gives us the seam for future Live
Activities, lockscreen widgets, and (when auth lands) actual
session locking.

---

## 2. What the lockscreen shows (v1)

```
   ┌──────────────────────────────────────────────────────┐
   │   ●●                       9:41         ▌▌  ◢ ⚡    │  ← status bar (same)
   │   Dynamic Island           ┊┊                       │
   │                                                      │
   │                                                      │
   │                                                      │
   │                        9:41                          │  ← large clock
   │                                                      │     (live)
   │                Saturday · May 18                     │  ← date
   │                                                      │
   │                                                      │
   │                  ╲╲   ╲╲   ╲╲                        │  ← XO chevron
   │                   ╲╲   ╲╲   ╲╲                       │     wallpaper
   │                  ╱╱   ╱╱   ╱╱                        │     (animated)
   │                                                      │
   │                                                      │
   │                                                      │
   │                                                      │
   │                   ↑ swipe up to unlock               │  ← hint + indicator
   │                       ───────                        │     (replaces
   │                                                      │      home pill)
   └──────────────────────────────────────────────────────┘
```

Five elements only:

| Element | Behavior |
|---|---|
| Status bar | Same `<StatusBar/>` as the OS shell. Clock ticks. |
| Dynamic Island | Visible. Same cosmetic black pill as today. |
| Big clock | `HH:MM` (12h), live updates every minute, same source as status bar. |
| Date | Localized, full day name + month + day. |
| Wallpaper | XO chevron mark, scaled up, gentle ambient animation (slow opacity pulse or position drift). |
| Unlock hint | Pill at the bottom + tiny "swipe up to unlock" caption, fades in after ~1s. |

Not in v1: today widgets, notification list, camera / flashlight
quick actions, Face ID animation, music controls. All deferrable.

---

## 3. The boot sequence

Today every load goes straight to the OS shell. With a lockscreen,
there is a gate.

```
   page loads
       │
       ▼
   ┌───────────────────────────────────────────────────┐
   │ LockProvider resolves initial state               │
   │                                                   │
   │   1. URL path !== "/"            → unlocked       │
   │      (deep-linked into an app, don't show lock)   │
   │                                                   │
   │   2. localStorage xo-lock-v1.unlocked === true    │
   │      AND sticky setting on (default true)         │
   │      AND less than 24h since last unlock          │
   │                                  → unlocked       │
   │                                                   │
   │   3. Else                        → locked         │
   └───────────────────────────────────────────────────┘
       │
       ├─ locked   → render <LockScreen/>
       │             user swipes up
       │             → animate out, set unlocked = true,
       │               persist, render shell underneath
       │
       └─ unlocked → render shell immediately
                     (HomeScreen or AppView per current mode)
```

Direct-route access never sees the lock. Sharing
`https://phone.xo.builders/coworker` opens the Coworker app
directly, as today. The lockscreen is for the "/" entry path only.

---

## 4. Where the lockscreen lives in the React tree

Outermost layer inside `.phone-screen`. Status bar + Dynamic Island
stay visible (they are device chrome). Everything below the status
bar swaps between lockscreen and OS shell content.

```
   <ModeProvider>
     <LockProvider>          ◀── NEW outer state
       <CharacterProvider>
         <PhoneProvider>
           <GestureProvider>
             <DeviceFrame>
               ├ StatusBar          (always visible)
               ├ Dynamic Island     (always visible)
               │
               ├ if locked:
               │   <LockScreen/>    ◀── full bleed, behind status bar
               │
               │ else (unlocked):
               │   HomeScreen | AppView
               │
               ├ GestureSurface     (gesture set changes when locked)
               ├ HomeIndicator      (hidden when locked; replaced by
               │                     LockScreen's own hint pill)
               └ panels             (notif / control / spotlight all
                                     suppressed when locked in v1)
```

Why `LockProvider` outside `CharacterProvider`: the character is
greeted after unlock; while locked, no character. So the character
context needs to read lock state. Putting lock above character keeps
the dependency one-way.

Why inside `<DeviceFrame>` rather than replacing it: the device
chrome (bezel, side buttons, Dynamic Island) should be visible
during lock just as it would on a real iPhone. Only the screen
contents change.

---

## 5. State model

`LockProvider` exposes:

| Field | Purpose |
|---|---|
| `locked: boolean` | Master state. Drives every render branch. |
| `unlocking: boolean` | True during the unlock animation, brief. |
| `unlock(): void` | Animate out, set locked = false, persist. |
| `lock(): void` | Re-lock (manual; used by Settings or test paths). |
| `sticky: boolean` | If true, once unlocked stays unlocked across reloads. Settings exposes this. |
| `lastUnlockedAt: ms` | Timestamp; used by the 24h sticky window. |

No PhoneContext / ModeContext changes required.

Persistence: `localStorage.xo-lock-v1` shape

```
   { "v": 1,
     "unlocked": true,
     "sticky": true,
     "lastUnlockedAt": <ms> }
```

If `sticky === false`, the user always sees the lockscreen on first
load of any tab. Useful for demo days.

---

## 6. The unlock interaction

Three input paths, same outcome:

```
   ┌─────────────────────────────────────────────────────┐
   │ A. Swipe up                                         │
   │    The GestureSurface's bottom-edge "home" gesture  │
   │    is repurposed when locked: it unlocks instead    │
   │    of navigating home. The home gesture only        │
   │    behaves as "home" once unlocked.                 │
   └─────────────────────────────────────────────────────┘
   ┌─────────────────────────────────────────────────────┐
   │ B. Tap the indicator pill                           │
   │    The lockscreen's pill at the bottom is tappable. │
   │    A tap is treated as a small swipe and unlocks.   │
   │    Keyboard-equivalent: Enter while focused.        │
   └─────────────────────────────────────────────────────┘
   ┌─────────────────────────────────────────────────────┐
   │ C. Press Esc, Space, or Enter                       │
   │    Accessibility path. Keyboard unlocks.            │
   │    Discoverable for non-touch users.                │
   └─────────────────────────────────────────────────────┘
```

Visual choreography of the unlock (~500ms total):

```
   locked                  in-flight                unlocked
   ┌───────┐               ┌───────┐                ┌───────┐
   │ 9:41  │               │       │                │       │
   │  XO   │   swipe up    │ shell │   settle       │ shell │
   │ wall  │   ────────►   │ fades │   ────────►    │ live  │
   │       │               │ in    │                │       │
   │   ▔   │               │       │                │       │
   └───────┘               └───────┘                └───────┘

   lockscreen slides up + fades, OS shell content fades in
   underneath. Status bar + Dynamic Island unchanged.
```

While locked, the gesture set is **suppressed** except for the
unlock gesture. Notification swipe-down, control center swipe-down,
and Spotlight pull-down are all no-ops on the lockscreen for v1.
(Real iOS allows them; we defer the complexity.)

---

## 7. Layering / z-index updates

The current z-index map (see `LIFECYCLE.md` §5) gets one new entry.

```
   z-[200]   LockScreen          (NEW: above everything inside the screen
                                  except the device chrome status bar)
   z-[100]   TourSpotlight       (character plan)
   z-[60]    Modals / sheets
   z-50      Dynamic Island
   z-40      StatusBar, HomeIndicator
   z-30      NavBar (inside AppView)
   z-20      Character avatar
   z-10      (reserved)
   z-0       HomeScreen / AppView content
```

LockScreen sits above the gesture panels but BELOW the status bar
and Dynamic Island so the OS chrome remains visible (matches iOS).
When locked, the panels are not just hidden visually; they are
suppressed at the GestureSurface level so no off-screen swipes can
trigger them.

---

## 8. Direct-route access policy

Two options. Default: A.

| Option | Behavior |
|---|---|
| **A. Auto-unlock on deep link** | User opens `/coworker` directly → render Coworker, never show lockscreen, persist `unlocked: true`. Lockscreen only ever appears on a `/` first visit. |
| B. Always show lockscreen | Every load goes through lockscreen, even deep links. Slower experience for returning visitors and shared links. |

A is friendlier and matches how a real iPhone behaves when an app
opens a deep link with the device already unlocked.

---

## 9. The wallpaper / screensaver

Three design candidates. Pick one before Phase 1; default to C.

| Option | Description |
|---|---|
| A. Static brand mark | XO chevron centered, sized large, no motion. Cheapest, safest. |
| B. Gradient drift | Two radial gradients of XO lime + ink slowly rotating around each other. Subtle, premium feel, runs forever without distracting. |
| C. **Animated chevron pulse** (recommended) | The XO chevron mark scales 1.00 → 1.04 → 1.00 over ~6s in a slow loop. Combined with B's gradient drift behind. Gives the screen depth + life without being a "screensaver" cliché. |

All three use the existing lime + ink palette. No new color tokens.

Respect `prefers-reduced-motion`: when set, fall back to A
unconditionally.

Future option (not v1): time-of-day wallpaper (sunrise / day /
sunset / night). Reuses the same chevron mark, palette shifts.

---

## 10. Lock state across sessions, tabs, modes

| Situation | Outcome |
|---|---|
| First-ever visit to `/` | Locked, animated wallpaper, swipe to unlock |
| Returning visit within 24h | Unlocked, straight to shell (per stickiness rule) |
| Returning after 24h | Locked again (rolling sticky window expires) |
| Deep link to `/coworker` | Auto-unlock, render Coworker |
| Two tabs open | `storage` event sync: unlock in one tab unlocks the other |
| User toggles `sticky = false` in Settings | Every tab close re-locks; next load shows the lockscreen |
| User taps "Lock" in Settings (manual) | Re-locks immediately in this tab |
| Mode change (landing → setup → default) | Mode is orthogonal; locking does not affect mode. Unlocking takes you to whichever mode is currently active. |

---

## 11. Phased build

```
   Phase 1 → LockProvider + LockScreen static
           - state, persistence, basic component
           - static wallpaper (chevron centered)
           - clock + date readouts
           - "swipe up to unlock" caption + indicator pill
           - swipe-up unlocks (reuses existing GestureSurface
             bottom-edge handler with a branch)
           - tap-to-unlock + keyboard unlock

   Phase 2 → unlock animation
           - lockscreen slides up + fades
           - OS shell underneath fades in
           - ~500 ms spring; respects prefers-reduced-motion

   Phase 3 → animated wallpaper
           - gradient drift + chevron pulse
           - reduce-motion fallback to static

   Phase 4 → Settings + sticky toggle
           - new Settings group: "Lock screen"
           - sticky on/off, "Lock now" button
           - "Reset lockscreen state" (clears localStorage)

   Phase 5 → suppress panels while locked (cleanup)
           - GestureSurface guards against opening any panel
             when locked
           - Direct check, fast

   Phase 6 (defer) → today widgets, weather, music, quick actions
           - reserved for later; nothing ships in v1
```

Estimate (single engineer):

| Phase | Effort |
|---|---|
| 1 static lockscreen + unlock | ~1 day |
| 2 unlock animation | ~0.5 day |
| 3 animated wallpaper | ~0.5 day |
| 4 settings + sticky | ~0.5 day |
| 5 panel suppression | ~0.5 day |
| **v1 total** | **~3 days** |

Cheap. The whole feature is one provider, one component, and a
small branch inside GestureSurface.

---

## 12. Risks

| Risk | Likelihood | Mitigation |
|---|---|---|
| User does not know how to unlock | Medium | Visible "swipe up to unlock" caption + animated pill at the bottom; falls back to tap-to-unlock + keyboard |
| Auto-unlock on deep links surprises a user who expects "always locked" | Low | Settings toggle `Always lock on visit` (sticky = false) addresses this for the 5% who want it |
| SSR / hydration mismatch on lock state (client knows localStorage, server does not) | Medium | Default SSR render = locked; client immediately re-renders to unlocked if localStorage says so. Lockscreen fades out within ~80 ms post-hydrate. |
| Clock time differs between server-rendered "9:41" and client time | Medium | Same pattern as the existing StatusBar clock: format on client after mount only. SSR ships an empty span. |
| Animated wallpaper drains battery on low-end devices | Low | `prefers-reduced-motion` and `(prefers-power-save: reduce)` both fall back to static |
| Panels (notif / control / Spotlight) still partially trigger from off-screen swipes during lock | Low | Phase 5 explicitly guards each gesture |
| Lockscreen prevents accessibility tools from reading the OS | Low | Lockscreen has `role="presentation"` with the unlock control labelled; aria-live announces "device locked, swipe up to unlock" on first focus |

---

## 13. Decisions before Phase 1

1. **Default boot state.** Locked or unlocked on first load? Default:
   **locked** (for the theatre).
2. **Stickiness default.** After first unlock, stay unlocked for how
   long? Default: 24h rolling window with the localStorage flag.
3. **Wallpaper option.** A / B / C from §9? Default: **C**
   (animated chevron + gradient drift).
4. **Auto-unlock on deep link.** Yes / no? Default: **yes** (§8 A).
5. **Panels while locked.** Allow notification / control / Spotlight
   swipes from the lockscreen, or suppress? Default: **suppress**
   in v1.
6. **Re-lock on inactivity.** Auto-lock after N minutes of no
   interaction? Default: **no** for v1. The web does not have a
   clean "device sleep" signal; faking it is more annoying than
   useful.
7. **Lockscreen visible on every mode (landing / setup / default)?**
   Default: **yes**, lock is orthogonal to mode. The mode the user
   sees AFTER unlock is whatever is currently resolved.

---

## 14. Plugs into existing plans

- **Modes plan.** Lock is orthogonal. The provider tree is
  `ModeProvider > LockProvider > ...`. When the user unlocks, the
  OS reveals the home screen in whatever mode is currently active.
  Switching modes (landing → setup → default) does not lock or
  unlock; it only changes the apps the user sees once they are in.
- **Character plan.** The character is suppressed while locked.
  Immediately after unlock, the character greets ("hi, i'm xo") in
  the appropriate mode-aware tone (landing tone, setup tone,
  default tone). Unlock is one of the character's three "natural
  entry moments" (the other two are first-visit-to-an-app and
  reduced-motion-user-arrives).
- **Gesture plan.** GestureSurface gains a small `if (locked)`
  branch on its bottom-edge handler: when locked, an upward swipe
  calls `unlock()` instead of `goHome()`. All other gestures are
  short-circuited while locked (per §11 phase 5).
- **Lifecycle / animation.** §5 z-index map gains a `z-[200]`
  LockScreen layer. §1 mount sequence gains a "LockProvider
  resolves" step between PhoneProvider effects and DeviceFrame
  mount. ARCHITECTURE.md will need a parallel update once Phase 1
  lands.
- **`ARCHITECTURE.md`**. After implementation, add a §15 or extend
  §3 to cover the locked → unlocked render branch and the new
  outer provider order.

---

## 15. Out of scope for v1

- Today widgets (weather, calendar previews, music)
- Real notifications on the lockscreen
- Camera / flashlight quick-action buttons
- Face ID / Touch ID animation
- "Slide to unlock" path tracing (just commit on threshold; no
  rubber-band slide handle to drag)
- Wallpaper customization by the user
- Time-of-day wallpaper variants
- Auto-lock on inactivity
- Re-locking when a panel closes
- Multi-step unlock (passcode, biometric stub)
- Locking the device when navigating away from `/`

---

## 16. What the user actually feels

```
   visit phone.xo.builders for the first time
           │
           ▼
   wallpaper fades in: XO chevron centered, slow pulse
   status bar appears: 9:41 ▌▌
   clock fades in:    9:41
   date fades in:     Saturday · May 18
   indicator pulses:  ↑ swipe up to unlock
           │
           ▼
   user swipes up (or taps, or presses Enter)
           │
           ▼
   ┌─────────────────────────────────────────────┐
   │ Lockscreen slides up + fades. OS shell fades │
   │ in underneath. Character greets immediately. │
   │ User sees the landing-mode home grid.        │
   └─────────────────────────────────────────────┘

   24h later, same browser, returning visit:
           │
           ▼
   LockProvider: sticky flag valid, skip lockscreen entirely.
   OS shell renders immediately in the current mode. No
   theatre on every visit; only on the first one.
```

The lockscreen is a *moment*, not a *gate*. Once you have been let
in, you stay in. Until the sticky window expires and the moment
gets to happen again.
