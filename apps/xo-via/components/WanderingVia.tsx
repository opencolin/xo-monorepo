"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Via } from "@/components/via"
import type { ViaExpression, ViaAnimation } from "@/lib/via"
import { useAgent } from "@/context/AgentContext"

/**
 * Small ambient Via that lives in the strip between the home-screen
 * icon grid and the dock. Hops between four dock-aligned x-positions
 * on a random interval and picks a fresh mood each hop, so the home
 * screen always has some sign of life on it.
 *
 * Tap Via and she stops hopping for a moment to show a small speech
 * bubble: mood label in mono-caps + a short on-brand one-liner pulled
 * from the mood's quote pool. After ~3.5s the bubble dismisses and
 * the hop scheduler resumes.
 *
 * Replaces the static page-dots placeholder. Since v1 ships a single
 * home page (no paging), there is nothing for the dots to indicate;
 * Via wandering across the dock is more on-brand and more alive.
 *
 * `error` is excluded from the random mood pool: a wandering red-X Via
 * would misread as "something is broken" when nothing actually is.
 */

const MOODS: { expression: ViaExpression; animation: ViaAnimation }[] = [
  { expression: "idle",     animation: "bob" },
  { expression: "happy",    animation: "bob" },
  { expression: "thinking", animation: "pulse" },
  { expression: "speaking", animation: "bob" },
]

// Four landing spots, aligned to the 4 dock slots when the dock uses
// `justify-around`. Each value is a `left:` percentage of the strip.
const SLOTS = [12.5, 37.5, 62.5, 87.5] as const

const MOOD_LABEL: Record<ViaExpression, string> = {
  idle:     "Idle",
  happy:    "Happy",
  thinking: "Thinking",
  speaking: "Yapping",
  error:    "Oof",
}

// Short original one-liners. Kept under ~6 words so they fit the
// bubble without wrapping awkwardly on a 393px phone.
const QUOTES: Record<ViaExpression, readonly string[]> = {
  idle: [
    "Just vibing.",
    "Tail's up. What's up?",
    "All ears.",
    "Ready when you are.",
    "Standing by.",
    "Watching the dock.",
  ],
  happy: [
    "Best dock ever.",
    "Found a sunbeam.",
    "Could do this all day.",
    "Tail won't quit.",
    "Living the dream.",
    "Snacks acquired.",
  ],
  thinking: [
    "Cooking on it.",
    "Sniffing around.",
    "One sec.",
    "Hmm.",
    "Lemme think.",
    "Chasing an idea.",
  ],
  speaking: [
    "Got something to say.",
    "Storytime.",
    "Listen up.",
    "Bark bark.",
    "Here we go.",
    "Just between us.",
  ],
  error: [
    "Yikes.",
    "Wires crossed.",
    "Hit a snag.",
  ],
}

function pickFrom<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function pickDifferent<T>(values: readonly T[], current: T): T {
  if (values.length <= 1) return values[0]
  let next = values[Math.floor(Math.random() * values.length)]
  // bias against repeating the same slot back-to-back
  if (next === current) {
    next = values[(values.indexOf(current) + 1 + Math.floor(Math.random() * (values.length - 1))) % values.length]
  }
  return next
}

export function WanderingVia({ size = 32 }: { size?: number }) {
  const [slotIdx, setSlotIdx]     = React.useState(1)
  const [moodIdx, setMoodIdx]     = React.useState(0)
  const [talking, setTalking]     = React.useState(false)
  const [quote, setQuote]         = React.useState("")
  const dismissRef                = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  const { state: agentState } = useAgent()

  // Derive an "agent override". When the agent is genuinely busy /
  // streaming / errored, Via reflects that instead of her random
  // ambient mood. Precedence matches lib/via.ts:viaStateFromAgent.
  const override: { expression: ViaExpression; animation: ViaAnimation } | null =
    agentState.error
      ? { expression: "error",    animation: "flash" }
      : agentState.streaming
      ? { expression: "speaking", animation: "bob" }
      : agentState.busy
      ? { expression: "thinking", animation: "pulse" }
      : null
  const agentActive = override !== null

  // Hop scheduler. Paused while talking (bubble visible) or while
  // the agent is active (Via stays put to feel attentive).
  React.useEffect(() => {
    if (talking || agentActive) return
    let cancelled = false

    function scheduleNext() {
      const wait = 3000 + Math.random() * 3000
      const t = setTimeout(() => {
        if (cancelled) return
        const idxs = SLOTS.map((_, i) => i)
        setSlotIdx(prev => pickDifferent(idxs, prev))
        setMoodIdx(Math.floor(Math.random() * MOODS.length))
        scheduleNext()
      }, wait)
      return t
    }

    const handle = scheduleNext()
    return () => {
      cancelled = true
      clearTimeout(handle)
    }
  }, [talking, agentActive])

  const ambient = MOODS[moodIdx]
  const expression = override?.expression ?? ambient.expression
  const animation  = override?.animation  ?? ambient.animation
  const leftPct    = SLOTS[slotIdx]

  function onActivate() {
    // Section A: the live /api/agent/quip route is gone. Show a
    // quote from the local pool only. Section E (Widgets) brings
    // back a quip source via a Next-route proxy to cowork.
    const mood = expression
    setQuote(pickFrom(QUOTES[mood]))
    setTalking(true)
    if (dismissRef.current) clearTimeout(dismissRef.current)
    dismissRef.current = setTimeout(() => setTalking(false), 4000)
  }

  React.useEffect(() => () => {
    if (dismissRef.current) clearTimeout(dismissRef.current)
  }, [])

  return (
    <div
      className="relative mx-3 select-none"
      style={{ height: size + 6 }}
    >
      <motion.div
        className="absolute top-0 -translate-x-1/2"
        initial={false}
        animate={{ left: `${leftPct}%` }}
        transition={{ type: "spring", stiffness: 90, damping: 18, mass: 0.7 }}
      >
        {/* Speech bubble: anchored above Via, pointer-events-none so
            it never blocks the dock or the tap target underneath. */}
        <AnimatePresence>
          {talking && (
            <motion.div
              key="bubble"
              className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 pointer-events-none z-10"
              initial={{ opacity: 0, scale: 0.85, y: 6 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 3 }}
              transition={{ type: "spring", stiffness: 320, damping: 24 }}
            >
              <div
                className="bg-phone-card2 border border-white/10 rounded-2xl px-3 py-2 text-center shadow-lg"
                style={{ minWidth: 120, maxWidth: 200 }}
              >
                <div
                  className="text-[9px] uppercase tracking-[0.18em] text-lime-300 mb-0.5"
                  style={{ fontFamily: 'ui-monospace, "SF Mono", Menlo, monospace' }}
                >
                  {MOOD_LABEL[expression]}
                </div>
                <div className="text-white text-xs leading-snug">
                  {quote}
                </div>
              </div>
              {/* Down-pointing arrow */}
              <div
                className="absolute left-1/2 -translate-x-1/2 -bottom-[5px] w-[10px] h-[10px] rotate-45 bg-phone-card2 border-r border-b border-white/10"
                aria-hidden
              />
            </motion.div>
          )}
        </AnimatePresence>

        <button
          type="button"
          onClick={onActivate}
          aria-label={`Via is ${MOOD_LABEL[expression].toLowerCase()}. Tap to hear what she has to say.`}
          aria-expanded={talking}
          className="block rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-400"
          style={{ lineHeight: 0 }}
        >
          <Via expression={expression} animation={animation} size={size} />
        </button>
      </motion.div>
    </div>
  )
}
