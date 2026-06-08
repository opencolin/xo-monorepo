"use client"

import * as React from "react"
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"
import { useMode } from "@/context/ModeContext"
import { AppIcon } from "./AppIcon"
import { Dock } from "./Dock"
import { ModeBanner } from "./ModeBanner"
import { WanderingVia } from "./WanderingVia"

const DEFAULT_ACCENT = "#83d63a" // XO lime

/**
 * Home screen: a 4-column icon grid that fills the screen, with a
 * persistent dock pinned to the bottom and a mode-themed wallpaper
 * underneath.
 *
 * Mode-aware:
 *   - icon set + dock come from the active mode (MODES_PLAN.md §6, §7)
 *   - on mode change, grid + dock + wallpaper all crossfade via
 *     AnimatePresence keyed by currentMode
 *   - wallpaper colors derive from `mode.theme.accent` /
 *     `mode.theme.wallpaperBase`, falling back to XO lime
 */
export function HomeScreen() {
  const { currentMode, mode, modeApps, modeDock } = useMode()
  const reduceMotion = useReducedMotion()
  // Grid skips external tiles; they live in the dock per §13.
  const gridApps = modeApps.filter(a => a.kind !== "external")

  const accent = mode.theme?.accent ?? DEFAULT_ACCENT
  const wallpaperBase = mode.theme?.wallpaperBase ?? accent

  // Crossfade transition shape: full ~600 ms for normal motion;
  // ~120 ms opacity-only fade for reduced motion (MODES_PLAN §8.9).
  const gridInitial = reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 1.04 }
  const gridAnimate = reduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1 }
  const gridExit = reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96 }
  const gridTransition = reduceMotion
    ? { duration: 0.12 }
    : { duration: 0.25, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }

  const dockInitial = reduceMotion ? { opacity: 0 } : { opacity: 0, y: 8 }
  const dockAnimate = reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }
  const dockExit = reduceMotion ? { opacity: 0 } : { opacity: 0, y: 8 }
  const dockTransition = gridTransition

  return (
    <motion.div
      key="home"
      className="absolute inset-0 flex flex-col"
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.06 }}
      transition={{ type: "spring", stiffness: 280, damping: 26 }}
    >
      {/* Wallpaper crossfades when mode (or theme) changes. Keyed by
          mode id so AnimatePresence treats each mode's wallpaper as
          a distinct child. */}
      <div className="absolute inset-0 -z-10">
        <AnimatePresence initial={false}>
          <motion.div
            key={`wallpaper-${currentMode}`}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={
              reduceMotion
                ? { duration: 0.12 }
                : { duration: 0.35, ease: "easeOut" }
            }
          >
            <Wallpaper accent={accent} base={wallpaperBase} />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Slim banner at the top showing the active non-default mode.
          Renders nothing in default mode so the home screen stays
          clean. */}
      <div className="relative flex justify-center pt-0.5">
        <ModeBanner />
      </div>

      {/* Mode crossfade: when currentMode changes, the icon grid
          exits with a small scale-down + fade, then the new mode's
          icons enter with a small scale-up + fade. */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={`grid-${currentMode}`}
          initial={gridInitial}
          animate={gridAnimate}
          exit={gridExit}
          transition={gridTransition}
          className="relative flex-1 px-6 pt-4 pb-2 grid grid-cols-4 gap-x-4 gap-y-5 content-start"
        >
          {gridApps.slice(0, 24).map(app => (
            <AppIcon key={app.path} app={app} />
          ))}
        </motion.div>
      </AnimatePresence>

      {/* Ambient Via mascot wandering above the dock. */}
      <WanderingVia />

      {/* Dock crossfade matches the grid. */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={`dock-${currentMode}`}
          initial={dockInitial}
          animate={dockAnimate}
          exit={dockExit}
          transition={dockTransition}
        >
          <Dock apps={[...modeDock]} />
        </motion.div>
      </AnimatePresence>
    </motion.div>
  )
}

/**
 * Theme-aware wallpaper. Two radial gradients tinted with the active
 * mode's accent + a soft chevron watermark. Colors interpolate via
 * the parent AnimatePresence (one Wallpaper per mode).
 */
function Wallpaper({ accent, base }: { accent: string; base: string }) {
  const baseTint = withAlpha(base, 0.18)
  const accentTint = withAlpha(accent, 0.1)
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background:
            `radial-gradient(120% 80% at 20% 10%, ${baseTint} 0%, transparent 55%),` +
            `radial-gradient(100% 80% at 80% 90%, ${accentTint} 0%, transparent 60%),` +
            "linear-gradient(180deg, #0c0d0f 0%, #08090A 100%)",
        }}
      />
      {/* XO chevron watermark — outer chevrons stay white, inner pair
          tints to the mode accent so each mode's wallpaper reads as
          its own color. */}
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.06]">
        <svg width="320" height="320" viewBox="0 0 100 100" aria-hidden>
          <path d="M20 20 L40 50 L20 80" stroke="white" strokeWidth="10" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M40 20 L60 50 L40 80" stroke={accent} strokeWidth="8" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M60 20 L80 50 L60 80" stroke="white" strokeWidth="10" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M80 20 L100 50 L80 80" stroke={accent} strokeWidth="8" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------

/**
 * Convert a hex color to an `rgba(...)` string with the given alpha.
 * Accepts `#rgb` and `#rrggbb`. Falls back to the original color if
 * the input is not recognized (so consumers can pass `rgba(...)`
 * directly).
 */
function withAlpha(hex: string, alpha: number): string {
  const m = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex.trim())
  if (!m) return hex
  let r: number, g: number, b: number
  if (m[1].length === 3) {
    r = parseInt(m[1][0] + m[1][0], 16)
    g = parseInt(m[1][1] + m[1][1], 16)
    b = parseInt(m[1][2] + m[1][2], 16)
  } else {
    r = parseInt(m[1].slice(0, 2), 16)
    g = parseInt(m[1].slice(2, 4), 16)
    b = parseInt(m[1].slice(4, 6), 16)
  }
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}
