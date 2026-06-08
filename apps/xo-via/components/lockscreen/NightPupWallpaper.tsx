"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Via } from "@/components/via"
import { viaStateFromAgent, type ViaExpression, type ViaAnimation } from "@/lib/via"
import { useAgent } from "@/context/AgentContext"

/**
 * NightPup wallpaper, v.Next.
 *
 * Composition top-to-bottom:
 *   - radial gradient: lime pool at 50% 70%, fading to ink
 *   - faint scattered star field across the top 60%
 *   - large lime glow under the mascot
 *   - Mood mascot: Via with current expression, tap to pat
 *
 * The mascot replaces the old hardcoded `SleepingPup` SVG. Now it is
 * the standard <Via/> component reading current expression from
 * AgentContext via viaStateFromAgent. Tapping Via "pats" it: the body
 * scales briefly, a sparkle fades in/out, and the expression switches
 * to `happy` + `bob` for 3 seconds before reverting to whatever the
 * agent state actually says.
 *
 * Pointer events:
 *   - Wallpaper container is pointer-events-none so the foreground
 *     div in LockScreen doesn't have to fight it.
 *   - The mascot wrapper turns pointer-events-auto back on so the pat
 *     button is reachable. LockScreen's middle flex placeholder is
 *     also pointer-events-none so taps fall through to here.
 *
 * `reducedMotion` suppresses: Via's CSS animation, the scale bounce
 * on tap, and the sparkle render. Pat still works (expression swap is
 * preserved); it just lands instantly.
 */
export function NightPupWallpaper({
  reducedMotion = false,
}: {
  reducedMotion?: boolean
}) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Base gradient: lime pool under the mascot, ink at the edges. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 50% 70%, #15291a 0%, #050807 60%, #000 100%)",
        }}
      />

      {/* Star field, top 60%. Deterministic positions so SSR + client
          render identically. */}
      <StarField />

      {/* Big soft glow under the mascot. */}
      <div
        className="absolute"
        style={{
          left: "50%",
          top: "64%",
          transform: "translate(-50%, -50%)",
          width: 280,
          height: 280,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(131, 214, 58, 0.22) 0%, transparent 60%)",
          filter: "blur(20px)",
        }}
      />

      {/* Mood mascot: Via with current expression, centered around
          60% from the top. pointer-events-auto re-enables clicks. */}
      <div
        className="absolute pointer-events-auto"
        style={{
          left: "50%",
          top: "60%",
          transform: "translate(-50%, -50%)",
        }}
      >
        <MoodMascot reducedMotion={reducedMotion} />
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------

/**
 * Deterministic star scatter. 24 stars across the top 60% of the
 * screen. Positions derived from index so SSR and client match
 * exactly (no Math.random).
 */
function StarField() {
  const stars = React.useMemo(
    () =>
      Array.from({ length: 24 }).map((_, i) => ({
        x: (i * 47.3) % 100,
        y: (i * 31.7) % 60,
        r: (i % 3) * 0.4 + 0.5,
        opacity: 0.15 + (i % 5) * 0.06,
      })),
    [],
  )

  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      aria-hidden
    >
      {stars.map((s, i) => (
        <circle
          key={i}
          cx={`${s.x}%`}
          cy={`${s.y}%`}
          r={s.r}
          fill="#fff"
          opacity={s.opacity}
        />
      ))}
    </svg>
  )
}

// ---------------------------------------------------------------------------

/**
 * The Via mascot on the lockscreen. Reads current agent state, shows
 * the derived expression, and supports tap-to-pat: briefly happy +
 * sparkle for ~3s, then reverts.
 *
 * We pass `empty: false` to viaStateFromAgent so the resting state is
 * `idle` (the `empty: true` branch returns `happy`, which would make
 * the pat invisible to the eye).
 */
const PAT_DURATION_MS = 3000
const MASCOT_SIZE = 140

function MoodMascot({ reducedMotion }: { reducedMotion: boolean }) {
  const { state } = useAgent()
  const [patted, setPatted] = React.useState(false)
  const [sparkleKey, setSparkleKey] = React.useState(0)

  const computed: { expression: ViaExpression; animation: ViaAnimation } = patted
    ? { expression: "happy", animation: "bob" }
    : viaStateFromAgent({ ...state, empty: false })

  // Auto-revert after PAT_DURATION_MS. Re-armed every pat (sparkleKey
  // changes), which lets a second tap during the pat extend the
  // happy state.
  React.useEffect(() => {
    if (!patted) return
    const t = setTimeout(() => setPatted(false), PAT_DURATION_MS)
    return () => clearTimeout(t)
  }, [patted, sparkleKey])

  const onPat = React.useCallback(() => {
    setPatted(true)
    setSparkleKey(k => k + 1)
  }, [])

  return (
    <div className="relative" style={{ width: MASCOT_SIZE, height: MASCOT_SIZE }}>
      <motion.button
        type="button"
        onClick={onPat}
        aria-label="Pat Via"
        whileTap={reducedMotion ? undefined : { scale: 1.12 }}
        transition={{ type: "spring", stiffness: 400, damping: 18 }}
        className="block rounded-full cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-lime-400/60"
        style={{
          width: MASCOT_SIZE,
          height: MASCOT_SIZE,
          padding: 0,
          background: "transparent",
          border: "none",
        }}
      >
        <Via
          expression={computed.expression}
          animation={reducedMotion ? "none" : computed.animation}
          size={MASCOT_SIZE}
          label="Via"
        />
      </motion.button>

      {/* Sparkle: rendered after the first pat, re-keyed per tap so
          the animation restarts each time. */}
      {sparkleKey > 0 && !reducedMotion && (
        <Sparkle key={sparkleKey} />
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------

/**
 * Tiny lime four-point sparkle that fades in, grows, fades out.
 * Lives one render cycle; re-mounts (via key change) on every pat.
 */
function Sparkle() {
  return (
    <motion.svg
      className="absolute pointer-events-none"
      style={{ top: -10, right: -14, width: 30, height: 30 }}
      viewBox="0 0 32 32"
      aria-hidden
      initial={{ opacity: 0, scale: 0.4, rotate: -10 }}
      animate={{
        opacity: [0, 1, 0],
        scale: [0.4, 1, 1.4],
        rotate: [-10, 10, 18],
      }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <path
        d="M16 3 L18.4 13.6 L29 16 L18.4 18.4 L16 29 L13.6 18.4 L3 16 L13.6 13.6 Z"
        fill="#83d63a"
      />
    </motion.svg>
  )
}
