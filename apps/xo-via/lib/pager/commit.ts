/**
 * Pure logic for the Pager's swipe-commit decision.
 *
 * Extracted from the Pager component so it can be tested without
 * mounting React or simulating pointer events. The Pager uses this
 * inside its Framer Motion `onDragEnd` handler.
 *
 * See V_NEXT_PLAN.html Section C (Pager behavior).
 */

/** Drag past this fraction of the container width to commit a swipe. */
export const COMMIT_DISTANCE_RATIO = 0.3

/** Or release with velocity past this many px/s to commit. */
export const COMMIT_VELOCITY_PX_S = 500

export interface CommitDecisionInput {
  /** Current mode index in the registry's list. */
  currentIdx: number
  /** Total number of modes (registry.list().length). */
  totalModes: number
  /** Horizontal drag offset at release, in pixels. Negative = left. */
  offsetX: number
  /** Horizontal velocity at release, in px/s. Negative = leftward. */
  velocityX: number
  /** Pager container width in pixels (drives the distance threshold). */
  containerWidth: number
}

export interface CommitDecision {
  /** The target mode index after evaluation. */
  nextIdx: number
  /** True when nextIdx differs from currentIdx. */
  committed: boolean
  /** Which direction the swipe went. */
  direction: "left" | "right" | "none"
}

/**
 * Decide whether the drag commits to the next or previous mode.
 *
 * - Negative offset / velocity = leftward drag = next mode (idx+1)
 * - Positive offset / velocity = rightward drag = prev mode (idx-1)
 * - Either distance OR velocity over threshold triggers a commit
 * - Clamps to [0, totalModes - 1]
 */
export function calculateCommitTarget(
  input: CommitDecisionInput,
): CommitDecision {
  const { currentIdx, totalModes, offsetX, velocityX, containerWidth } = input
  const distanceThreshold = containerWidth * COMMIT_DISTANCE_RATIO

  const wantsNext =
    offsetX < -distanceThreshold || velocityX < -COMMIT_VELOCITY_PX_S
  const wantsPrev =
    offsetX > distanceThreshold || velocityX > COMMIT_VELOCITY_PX_S

  if (wantsNext && !wantsPrev) {
    const next = Math.min(totalModes - 1, currentIdx + 1)
    return {
      nextIdx: next,
      committed: next !== currentIdx,
      direction: "left",
    }
  }
  if (wantsPrev && !wantsNext) {
    const prev = Math.max(0, currentIdx - 1)
    return {
      nextIdx: prev,
      committed: prev !== currentIdx,
      direction: "right",
    }
  }
  return { nextIdx: currentIdx, committed: false, direction: "none" }
}
