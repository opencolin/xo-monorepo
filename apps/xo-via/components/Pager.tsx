"use client"

import * as React from "react"
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useReducedMotion,
  animate,
  type PanInfo,
} from "framer-motion"
import { useMode } from "@/context/ModeContext"
import { useAuthGate } from "@/lib/auth/auth-gate"
import { calculateCommitTarget } from "@/lib/pager/commit"
import { ModePage } from "./ModePage"
import { ModeBanner } from "./ModeBanner"
import { WanderingVia } from "./WanderingVia"
import { Dock } from "./Dock"

const DEFAULT_ACCENT = "#83d63a" // XO lime

/**
 * Section C, the iPhone-style Pager.
 *
 * Three vertical layers, stacked back-to-front:
 *
 *   1. Wallpaper (back, themed by active mode). Crossfades on mode
 *      commit via AnimatePresence; does not translate with the swipe.
 *
 *   2. Mode banner (top, fixed). Reflects active mode, never swipes.
 *
 *   3. SWIPEABLE STRIP (middle). Only this layer translates with the
 *      finger. Contains N `<ModePage mode={...} />` instances stacked
 *      horizontally, one per registered mode. Each ModePage is just
 *      the icon grid for its mode.
 *
 *   4. WanderingVia + page dots + DOCK (bottom, fixed). The dock
 *      content crossfades in place on mode commit (no translation)
 *      so the user sees the dock animate to the new mode's items
 *      while their finger releases the grid swipe.
 *
 * This is the iPhone home-screen feel: icons slide, the dock stays.
 * Different from iOS in one place: our dock CHANGES per mode (not per
 * sub-page), so the crossfade on commit replaces iOS's "dock stays
 * identical across home pages" behavior with "dock stays anchored,
 * content morphs".
 *
 * Auth gate (Section G stub): outer swipe to an auth-required mode
 * snaps back today (stub permits all in dev). Section G replaces the
 * snap-back with the Clerk sign-in surface + queued swipe.
 *
 * Reduced motion: spring physics collapse to instant snaps.
 *
 * See V_NEXT_PLAN.html Section C; SCREENS.html Screens 02-06.
 */
export function Pager() {
  const { modes, mode: activeMode, modeDock, currentMode, setMode } = useMode()
  const { canEnter } = useAuthGate()
  const reduceMotion = useReducedMotion()

  // The swipeable strip's container ref; pixel-based math drives drag.
  const stripBoxRef = React.useRef<HTMLDivElement>(null)
  const [containerWidth, setContainerWidth] = React.useState(0)
  const x = useMotionValue(0)

  const currentIdx = Math.max(
    0,
    modes.findIndex(m => m.id === currentMode),
  )

  // Measure the strip's outer box on mount + resize. useLayoutEffect
  // ensures containerWidth is set before first paint so the strip
  // doesn't show a zero-width frame.
  React.useLayoutEffect(() => {
    if (!stripBoxRef.current) return
    const measure = () => {
      const w = stripBoxRef.current?.offsetWidth ?? 0
      setContainerWidth(w)
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(stripBoxRef.current)
    return () => ro.disconnect()
  }, [])

  // Drive the strip's x to match currentIdx whenever it changes
  // (from user swipe, URL override, or external setMode call). The
  // spring matches PANEL_SPRING used elsewhere in the OS.
  React.useEffect(() => {
    if (containerWidth === 0) return
    const target = -currentIdx * containerWidth
    if (reduceMotion) {
      x.set(target)
      return
    }
    const controls = animate(x, target, {
      type: "spring",
      stiffness: 280,
      damping: 32,
      mass: 0.9,
    })
    return () => controls.stop()
  }, [currentIdx, containerWidth, x, reduceMotion])

  const handleDragEnd = React.useCallback(
    (_e: PointerEvent | MouseEvent | TouchEvent, info: PanInfo) => {
      if (containerWidth === 0) return

      const decision = calculateCommitTarget({
        currentIdx,
        totalModes: modes.length,
        offsetX: info.offset.x,
        velocityX: info.velocity.x,
        containerWidth,
      })

      const snapBack = () => {
        animate(x, -currentIdx * containerWidth, {
          type: "spring",
          stiffness: 320,
          damping: 32,
        })
      }

      if (!decision.committed) {
        snapBack()
        return
      }

      const target = modes[decision.nextIdx]
      if (!target || !canEnter(target)) {
        snapBack()
        return
      }

      // Instant mode change: the slide IS the visible grid transition;
      // the dock + wallpaper crossfades in place via AnimatePresence
      // because their keys (currentMode) change.
      setMode(target.id, { instant: true })
    },
    [containerWidth, currentIdx, modes, x, canEnter, setMode],
  )

  const stripWidth = containerWidth * modes.length
  const minX = -(modes.length - 1) * containerWidth
  const maxX = 0

  const accent = activeMode.theme?.accent ?? DEFAULT_ACCENT
  const wallpaperBase = activeMode.theme?.wallpaperBase ?? accent

  return (
    <div className="relative w-full h-full flex flex-col">
      {/* LAYER 1: Wallpaper (back, themed). Crossfades on mode change. */}
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

      {/* LAYER 2: Mode banner (top, fixed, above the strip) */}
      <div className="relative flex justify-center pt-0.5 flex-shrink-0 z-10">
        <ModeBanner />
      </div>

      {/* LAYER 3: SWIPEABLE STRIP (the only thing that translates) */}
      <div
        ref={stripBoxRef}
        className="relative flex-1 overflow-hidden"
      >
        <motion.div
          className="absolute top-0 left-0 h-full flex"
          style={{
            x,
            width: stripWidth || `${modes.length * 100}%`,
            touchAction: "pan-y",
          }}
          drag="x"
          dragConstraints={{ left: minX, right: maxX }}
          dragElastic={0.22}
          dragDirectionLock
          onDragEnd={handleDragEnd}
        >
          {modes.map(mode => (
            <div
              key={mode.id}
              className="h-full flex-shrink-0"
              style={{ width: containerWidth || `${100 / modes.length}%` }}
            >
              <ModePage mode={mode} />
            </div>
          ))}
        </motion.div>
      </div>

      {/* LAYER 4: WanderingVia + page dots + Dock (bottom, ALWAYS mounted) */}
      <div className="relative flex-shrink-0 z-10">
        <WanderingVia />

        {modes.length > 1 && (
          <PageDots total={modes.length} active={currentIdx} />
        )}

        {/*
          Dock container is ALWAYS in the DOM, never inside an
          AnimatePresence-with-mode=wait wrapper. That used to cause
          the dock to fully exit before the new one mounted, leaving
          a visible gap. Now the container is anchored; only the
          icons inside swap when modeDock updates (per-icon
          enter/exit can be added later as polish).
        */}
        <Dock apps={[...modeDock]} />
      </div>
    </div>
  )
}

/**
 * Page dots rendered just above the Dock. Two-dot tall stack: outer
 * (mode) dots only for v.Next; inner (sub-page) dots get added when
 * Section H lands sub-pages within a mode.
 */
function PageDots({ total, active }: { total: number; active: number }) {
  return (
    <div
      className="flex justify-center gap-1.5 pb-1 pointer-events-none"
      aria-label={`Mode ${active + 1} of ${total}`}
    >
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className={`w-1.5 h-1.5 rounded-full transition-colors duration-200 ${
            i === active ? "bg-white" : "bg-white/30"
          }`}
        />
      ))}
    </div>
  )
}

// ──────────────────────────────────────────────────────────────────
// Wallpaper (inlined from the v0 HomeScreen). Themed per active mode.
// ──────────────────────────────────────────────────────────────────

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
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.06]">
        <svg width="320" height="320" viewBox="0 0 100 100" aria-hidden>
          <path
            d="M20 20 L40 50 L20 80"
            stroke="white"
            strokeWidth="10"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M40 20 L60 50 L40 80"
            stroke={accent}
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M60 20 L80 50 L60 80"
            stroke="white"
            strokeWidth="10"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M80 20 L100 50 L80 80"
            stroke={accent}
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  )
}

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
