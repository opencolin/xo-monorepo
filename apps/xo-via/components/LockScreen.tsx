"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { useLock } from "@/context/LockContext"
import { NightPupWallpaper } from "./lockscreen/NightPupWallpaper"

/**
 * iPhone-style lockscreen. Big clock + date + animated wallpaper +
 * "swipe up to unlock" pill.
 *
 * Mounted from DeviceFrame inside an <AnimatePresence> so the
 * slide-up exit animation runs when locked → unlocked. The unlock
 * gesture is handled by GestureSurface (bottom-edge swipe); this
 * component also exposes a tap-the-pill and keyboard unlock for
 * accessibility.
 *
 * Respects prefers-reduced-motion: wallpaper animations stop, exit
 * becomes a plain fade.
 */
export function LockScreen() {
  const { unlock } = useLock()
  const [now, setNow] = React.useState(() => new Date())
  const [reducedMotion, setReducedMotion] = React.useState(false)

  // Live clock: tick every 15s, matches the StatusBar cadence so
  // the two are never visibly out of sync.
  React.useEffect(() => {
    setNow(new Date())
    const id = setInterval(() => setNow(new Date()), 15_000)
    return () => clearInterval(id)
  }, [])

  // Reduced-motion detection.
  React.useEffect(() => {
    if (typeof window === "undefined") return
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    const apply = () => setReducedMotion(mq.matches)
    apply()
    mq.addEventListener("change", apply)
    return () => mq.removeEventListener("change", apply)
  }, [])

  // Keyboard unlock: Esc / Space / Enter while lockscreen is mounted.
  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" || e.key === " " || e.key === "Enter") {
        e.preventDefault()
        unlock()
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [unlock])

  const timeStr = formatTime(now)

  // iOS-feel timings:
  //   unlock (exit, slides UP off screen): ~0.85s, decelerating curve
  //   lock   (enter, slides DOWN from above): ~0.75s, decelerating curve
  // The first lockscreen render on page load skips the enter animation
  // via `initial={false}` on the AnimatePresence in DeviceFrame; only
  // re-locks (Settings or side button) run the enter animation.
  const exitTransition = reducedMotion
    ? { duration: 0.2 }
    : { duration: 0.85, ease: [0.32, 0.72, 0, 1] as [number, number, number, number] }
  const enterTransition = reducedMotion
    ? { duration: 0.2 }
    : { duration: 0.75, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }

  return (
    <motion.div
      key="lockscreen"
      role="presentation"
      aria-label="Device locked, swipe up to unlock"
      // Enter: slide down from above (only runs on re-locks; first
      // mount uses AnimatePresence initial={false}).
      initial={{ y: "-100%", opacity: 0 }}
      animate={{ y: 0, opacity: 1, transition: enterTransition }}
      // Exit: slow slide up + fade.
      exit={{ y: "-100%", opacity: 0, transition: exitTransition }}
      // z-30 puts the lockscreen above content (z-0) and panel scrims
      // (z-30 is shared but panels are suppressed when locked, so no
      // collision), but BELOW the status bar (z-40) and Dynamic
      // Island (z-50), which is the iOS behavior.
      className="absolute inset-0 z-30 flex flex-col overflow-hidden"
    >
      <NightPupWallpaper reducedMotion={reducedMotion} />

      {/* Foreground content sits above the wallpaper layer. */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-between pt-20 pb-6 px-6">
        {/* Top: clock + thought of the day (was date) */}
        <div className="flex flex-col items-center">
          <div
            className="text-white font-thin tracking-tight leading-none"
            style={{ fontSize: "72px" }}
          >
            {timeStr}
          </div>
          <ThoughtOfTheDay />
        </div>

        {/* Center: wallpaper hosts the Via mascot (tap to pat).
            pointer-events-none lets taps fall through to the wallpaper
            mascot below us. */}
        <div className="flex-1 pointer-events-none" aria-hidden />

        {/* Bottom: unlock hint + tap-target pill */}
        <div className="flex flex-col items-center gap-3">
          <motion.p
            className="text-white/55 text-[11px] uppercase tracking-[0.2em] select-none"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.4 }}
          >
            swipe up to unlock
          </motion.p>
          <motion.button
            onClick={unlock}
            aria-label="Unlock"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.4 }}
            whileTap={{ scaleY: 0.7 }}
            className="h-1.5 w-32 rounded-full bg-white/85"
          />
        </div>
      </div>
    </motion.div>
  )
}

// ---------------------------------------------------------------------------

function formatTime(d: Date): string {
  let h = d.getHours()
  const m = d.getMinutes()
  h = h % 12 || 12
  return `${h}:${m.toString().padStart(2, "0")}`
}

// ---------------------------------------------------------------------------

/**
 * Thought of the day. Single short line beneath the clock that
 * replaces the old date.
 *
 * v.Next ships with a local mock pool only. The earlier
 * `/api/agent/quip` Next route was deleted with the rest of the v0
 * agent backend in Section A; a real quip source (cowork-api or
 * elsewhere) lands later and slots in without touching this
 * component (just hydrate `pool` from a hook).
 *
 * Tap to cycle through the pool.
 */
const QUIP_FALLBACK_POOL: readonly string[] = [
  "agents that work for you",
  "ready when you are",
  "tap to chat with me",
  "your XO awaits",
  "i'm here",
]

function ThoughtOfTheDay() {
  const [index, setIndex] = React.useState(0)
  const current = QUIP_FALLBACK_POOL[index % QUIP_FALLBACK_POOL.length]

  return (
    <motion.button
      type="button"
      onClick={() => setIndex(i => (i + 1) % QUIP_FALLBACK_POOL.length)}
      aria-label={`Thought of the day, tap to cycle: ${current}`}
      initial={{ opacity: 0, y: -2 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.4 }}
      className="text-white/85 text-sm mt-2 tracking-wide cursor-pointer bg-transparent border-0 p-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-lime-400/60 rounded"
    >
      {current}
    </motion.button>
  )
}

