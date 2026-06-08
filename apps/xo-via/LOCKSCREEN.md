# Lockscreen, a one-pager

An iPhone-style gate before the OS. Big clock, animated XO
wallpaper, "swipe up to unlock" pill. Orthogonal to mode and route;
sits as the outermost interactive layer inside the phone screen.

Full design: `LOCKSCREEN_PLAN.md`. This page is the cheat sheet.

---

## What it shows

```
   ┌──────────────────────────────────────────┐
   │ 9:41    Dynamic Island    ▌▌  ◢  ⚡       │ status bar
   │                                          │ (always visible)
   │                                          │
   │                  9:41                    │ big clock (live)
   │            Saturday, May 18              │ date
   │                                          │
   │              ╲╲   ╲╲   ╲╲                │ XO chevron
   │               ╲╲   ╲╲   ╲╲               │ wallpaper
   │              ╱╱   ╱╱   ╱╱                │ (animated pulse)
   │                                          │
   │            swipe up to unlock            │ hint
   │                ────────                  │ pill (tap, drag,
   │                                          │  or key to unlock)
   └──────────────────────────────────────────┘
```

Status bar and Dynamic Island sit ON TOP of the lockscreen (higher
z-index), so the device chrome remains visible. The lockscreen
itself fills everything below.

---

## Boot sequence

```
   page loads
       │
       ▼
   ┌─────────────────────────────────────────────────────┐
   │ LockProvider resolves initial state                 │
   │                                                     │
   │   1. URL path !== "/"          → unlocked           │
   │      (deep-linked into an app; never gate)          │
   │                                                     │
   │   2. localStorage xo-lock-v1                        │
   │      unlocked && sticky && within 24h               │
   │                              → unlocked             │
   │                                                     │
   │   3. Otherwise               → locked               │
   └─────────────────────────────────────────────────────┘
```

The default boot state for `/` is **locked**, by design (the
theatre). Deep links never see the lockscreen.

---

## The three unlock paths

| Input | Path |
|---|---|
| Swipe up from bottom edge | `GestureSurface` bottom-edge handler routes commit to `LockContext.unlock()` instead of `goHome()` |
| Tap the unlock pill | `LockScreen` mounts a button on the pill that calls `unlock()` |
| Esc / Space / Enter | `LockScreen` window keydown listener calls `unlock()` |

All three end up calling the same `unlock()` action, which:

1. Sets `LockContext.locked = false`
2. Marks `unlocking = true` for ~900 ms (covers the animation)
3. Records `lastUnlockedAt = Date.now()`
4. Triggers the slow slide-up exit in `LockScreen` via
   `AnimatePresence`

---

## What lock and unlock change in the rest of the OS

### When the device becomes locked

```
   LockContext.locked → true
        │
        ├─► DeviceFrame: hides HomeIndicator
        │              hides NotificationPanel
        │              hides ControlCenterPanel
        │              hides SpotlightPanel
        │              mounts <LockScreen/>
        │              (status bar + Dynamic Island stay visible)
        │
        ├─► GestureSurface: every zone except bottom-edge becomes
        │                   a no-op at pointerdown
        │
        └─► The side-button (right side of frame): becomes aria-
            disabled; tapping it is a no-op until unlocked
```

The lockscreen does not animate in on the first page load (the
device starts locked). It DOES animate in when re-locked via the
side button or `LockContext.lock()` from Settings.

### When the device unlocks

```
   LockContext.unlock() called
        │
        ▼
   LockContext.locked → false
   LockContext.unlocking → true (~900 ms)
        │
        ├─► AnimatePresence in DeviceFrame triggers LockScreen
        │   exit animation (slow tween up, ~850 ms, decelerating)
        │
        ├─► HomeIndicator + panels mount in the background as
        │   children become reachable
        │
        ├─► GestureSurface: full zone vocabulary becomes active
        │   again
        │
        ├─► localStorage persists { unlocked: true, lastUnlockedAt }
        │
        └─► Other tabs (storage event) follow within the next render
```

The mode underneath the lockscreen is unchanged. If you locked
while in landing mode, you unlock back into landing mode.

---

## The side lock button (right edge of frame)

The right-side cosmetic span on `DeviceFrame` is a real button:

- **Unlocked + tapped**: calls `LockContext.lock()`. Lockscreen
  slides DOWN from above over ~750 ms.
- **Locked + tapped**: no-op. Aria-label flips to "Device locked".

This mirrors the iOS side-button behavior: it locks an unlocked
device but does nothing meaningful when already locked.

---

## Persistence

`localStorage.xo-lock-v1` (versioned, v1):

| Field | Purpose |
|---|---|
| `unlocked` | True when within the sticky window |
| `sticky` | User preference: stay unlocked between visits (default true) |
| `lastUnlockedAt` | ms epoch; powers the 24h sticky window |

The sticky window is **rolling**: every unlock resets
`lastUnlockedAt`. Visit hourly forever → never see the lockscreen
again. Skip a day → next visit shows it.

Cross-tab sync: `storage` event listener picks up changes from
other tabs. Unlock in one tab → other tab unlocks too.

---

## Animation choreography

```
   LOCK (entering)              UNLOCK (exiting)
   ┌───────┐                    ┌───────┐
   │       │                    │ 9:41  │
   │       │  slides             │  XO   │  slides up
   │       │  down               │ wall  │  and fades
   │       │  ~750ms             │       │  ~850ms
   │ 9:41  │  (decelerate)       │   ▔   │  (decelerate)
   │  XO   │                    └───────┘
   │ wall  │                          │
   │       │                          ▼
   │   ▔   │                    OS reveals beneath
   └───────┘
```

Both transitions use Apple-style decelerating tweens (not
springs). `prefers-reduced-motion: reduce` collapses both to a
~200 ms opacity fade.

Wallpaper itself has two layered animations (both stop on
reduced motion):

- Two radial-gradient layers drift in opposite arcs (22 s and
  26 s loops)
- The chevron mark breathes (scale 1.00 ↔ 1.04 over 6 s)

---

## Working today

- Three unlock paths (swipe / tap / keyboard)
- Right-side lock button on the device frame
- Slow tween animations matching iOS feel
- Animated XO wallpaper with reduced-motion fallback
- 24 h rolling sticky window + localStorage versioning
- Cross-tab `storage` sync
- Deep-link auto-unlock (anything other than `/` skips lockscreen)
- Status bar + Dynamic Island stay visible above lockscreen
- Settings → Lock screen group (sticky toggle, Lock now, Reset)
- Suppression of panels + home indicator while locked
- AnimatePresence `initial={false}` so first-load lockscreen has
  no entrance animation; re-locks DO animate in

---

## Not yet (planned)

| Feature | Plan ref |
|---|---|
| Today widgets (weather, calendar) | `LOCKSCREEN_PLAN.md` §15 |
| Real notifications on lockscreen | §15 |
| Camera / flashlight quick actions | §15 |
| Auto-lock on inactivity | §15 |
| Wallpaper customization | §15 |
| Passcode / biometric stub | §15 |

---

## File map

```
context/LockContext.tsx              provider, persistence, sticky window
components/LockScreen.tsx            visible component + animated wallpaper
components/LockSettingsGroup.tsx     Settings UI (sticky, Lock now, Reset)

components/DeviceFrame.tsx           mounts lockscreen via AnimatePresence,
                                     converts right-side button to a real
                                     <button> that calls lock()
components/HomeIndicator.tsx         hidden when locked (DeviceFrame guards)
components/gestures/GestureSurface.tsx   has `if (lock.locked)` branches in
                                          onPointerDown + commit handlers
```

---

## Common tasks

| I want to... | Do this |
|---|---|
| Force the lockscreen to show on every visit | Settings → Lock screen → toggle "Stay unlocked between visits" off |
| Lock the device manually | Tap the right-side button, OR Settings → "Lock now" |
| Clear stuck state | Settings → "Reset lockscreen state" |
| Change the sticky window (24 h default) | Edit `STICKY_WINDOW_MS` in `LockContext.tsx` |
| Tune unlock animation speed | Edit `exitTransition.duration` in `LockScreen.tsx` (also bump the `setTimeout(..., 900)` in LockContext to match) |
| Swap the wallpaper for a static image | Replace the `Wallpaper` component in `LockScreen.tsx` |
| Add a today widget | New component slotted into `LockScreen.tsx`'s middle area + read its data from a new context |
| Add auto-lock on inactivity | New `useEffect` in LockContext listening for `pointerdown` to reset a timer; on timer expiry call `lock()` |
