/**
 * Section C, Pager commit decision tests.
 *
 * Pure-logic tests for the swipe → commit calculation. No React, no
 * DOM. The Pager component delegates to this function in its
 * onDragEnd handler, so testing the logic here covers the only
 * non-visual branching in the component.
 */

import { describe, expect, it } from "vitest"
import {
  calculateCommitTarget,
  COMMIT_DISTANCE_RATIO,
  COMMIT_VELOCITY_PX_S,
} from "@/lib/pager/commit"

const W = 400 // container width
const DIST_THRESHOLD = W * COMMIT_DISTANCE_RATIO // 120

function decision(over: Partial<Parameters<typeof calculateCommitTarget>[0]>) {
  return calculateCommitTarget({
    currentIdx: 1,
    totalModes: 3,
    offsetX: 0,
    velocityX: 0,
    containerWidth: W,
    ...over,
  })
}

describe("calculateCommitTarget", () => {
  describe("distance threshold", () => {
    it("does not commit below the distance threshold", () => {
      const d = decision({ offsetX: -(DIST_THRESHOLD - 1) })
      expect(d.committed).toBe(false)
      expect(d.nextIdx).toBe(1)
      expect(d.direction).toBe("none")
    })

    it("commits to the next mode on leftward drag past threshold", () => {
      const d = decision({ offsetX: -(DIST_THRESHOLD + 1) })
      expect(d.committed).toBe(true)
      expect(d.nextIdx).toBe(2)
      expect(d.direction).toBe("left")
    })

    it("commits to the previous mode on rightward drag past threshold", () => {
      const d = decision({ offsetX: DIST_THRESHOLD + 1 })
      expect(d.committed).toBe(true)
      expect(d.nextIdx).toBe(0)
      expect(d.direction).toBe("right")
    })
  })

  describe("velocity threshold", () => {
    it("commits even on small offset when leftward velocity is high", () => {
      const d = decision({
        offsetX: -10,
        velocityX: -(COMMIT_VELOCITY_PX_S + 50),
      })
      expect(d.committed).toBe(true)
      expect(d.nextIdx).toBe(2)
      expect(d.direction).toBe("left")
    })

    it("commits even on small offset when rightward velocity is high", () => {
      const d = decision({
        offsetX: 10,
        velocityX: COMMIT_VELOCITY_PX_S + 50,
      })
      expect(d.committed).toBe(true)
      expect(d.nextIdx).toBe(0)
      expect(d.direction).toBe("right")
    })

    it("does not commit when velocity is just below threshold and offset is small", () => {
      const d = decision({
        offsetX: -5,
        velocityX: -(COMMIT_VELOCITY_PX_S - 1),
      })
      expect(d.committed).toBe(false)
      expect(d.direction).toBe("none")
    })
  })

  describe("clamping at edges", () => {
    it("does not advance past the last mode", () => {
      const d = decision({
        currentIdx: 2,
        offsetX: -(DIST_THRESHOLD + 50),
      })
      // clamps to 2
      expect(d.committed).toBe(false)
      expect(d.nextIdx).toBe(2)
    })

    it("does not retreat before the first mode", () => {
      const d = decision({
        currentIdx: 0,
        offsetX: DIST_THRESHOLD + 50,
      })
      expect(d.committed).toBe(false)
      expect(d.nextIdx).toBe(0)
    })
  })

  describe("ambiguity", () => {
    it("returns no-op when offset and velocity disagree (held back)", () => {
      // offset goes left past threshold, velocity goes hard right
      const d = decision({
        offsetX: -(DIST_THRESHOLD + 50),
        velocityX: COMMIT_VELOCITY_PX_S + 100,
      })
      // both wantsNext and wantsPrev are true, so neither wins
      expect(d.committed).toBe(false)
      expect(d.direction).toBe("none")
    })
  })

  describe("realistic full swipes", () => {
    it("a typical left-swipe (200px drag, fast release)", () => {
      const d = decision({
        currentIdx: 0,
        offsetX: -200,
        velocityX: -800,
      })
      expect(d.committed).toBe(true)
      expect(d.nextIdx).toBe(1)
    })

    it("a typical right-swipe (200px drag, fast release)", () => {
      const d = decision({
        currentIdx: 2,
        offsetX: 200,
        velocityX: 800,
      })
      expect(d.committed).toBe(true)
      expect(d.nextIdx).toBe(1)
    })
  })
})
