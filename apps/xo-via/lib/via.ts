/**
 * Via, XO's digital alter-ego.
 *
 * This module defines the public Via API: expressions, animations,
 * and the agent-state-to-Via-state mapper. The concrete component
 * lives in `components/via/Via.tsx`.
 *
 * Two-stage roadmap (see VIA.md):
 *   v1: chevron-based body using the existing XO logo. Ships today.
 *   v2: Chevi-based body (dog mascot from the design tool). Swap
 *       internals; this API stays stable. Consumers do not change.
 *
 * Keep this module pure: types + constants + small pure functions.
 * No React, no DOM, no server-only imports.
 */

/**
 * Public expression vocabulary. Stable across v1 (chevron) and v2
 * (Chevi). When v2 lands, each expression maps to a Chevi expression
 * inside `components/via/Via.tsx`; consumers keep using these names.
 */
export type ViaExpression =
  | "idle"      // resting, baseline. Default.
  | "thinking"  // agent is processing (pending bubble, RSC fetch, etc.)
  | "speaking"  // agent is actively streaming text
  | "happy"     // success, positive ack
  | "error"     // something failed; pairs with red accent

/**
 * Public animation vocabulary. Independent of expression so they
 * compose (e.g. `expression: "thinking", animation: "bob"`).
 */
export type ViaAnimation =
  | "none"      // static
  | "bob"       // gentle vertical bob, idle hint
  | "pulse"     // scale + opacity breath, used while thinking
  | "flash"     // brief flash, used on error

/** Shared props every Via variant must accept. */
export interface ViaProps {
  expression?: ViaExpression
  animation?: ViaAnimation
  /** Square pixel size. The component renders at this width/height. */
  size?: number
  /** Optional className passed to the root <svg>. */
  className?: string
  /** Accessible label for the figure. Defaults to "Via". */
  label?: string
}

/**
 * Agent surface state. Used by AgentSurface and other consumers to
 * describe what the agent is doing right now. `viaStateFromAgent`
 * collapses this into a (expression, animation) tuple.
 */
export interface AgentVisualState {
  busy: boolean      // a turn is in flight
  streaming: boolean // assistant text is currently arriving
  error: boolean     // last turn ended in error
  empty: boolean     // no messages yet (greeting state)
}

/**
 * The single mapping function from agent state to Via expression +
 * animation. Centralizing this means future tweaks happen in one
 * place and no consumer wires the rules itself.
 *
 * Precedence (highest first): error > streaming > busy > empty > idle.
 */
export function viaStateFromAgent(s: AgentVisualState): {
  expression: ViaExpression
  animation: ViaAnimation
} {
  if (s.error)     return { expression: "error",    animation: "flash" }
  if (s.streaming) return { expression: "speaking", animation: "bob"   }
  if (s.busy)      return { expression: "thinking", animation: "pulse" }
  if (s.empty)     return { expression: "happy",    animation: "bob"   }
  return             { expression: "idle",     animation: "bob"   }
}

/**
 * Brand palette used by the v1 chevron body. v2 (Chevi) can ignore
 * these or re-derive from `--color-lime-400` + `--color-ink-900` via
 * the Tailwind 4 theme.
 */
export const VIA_PALETTE = {
  outer: "#FFFFFF",          // outer chevrons
  inner: "#83d63a",          // inner chevrons (XO lime)
  errorOuter: "#FFFFFF",
  errorInner: "#ef4444",     // red-500
  ink: "#08090A",            // background contexts
} as const
