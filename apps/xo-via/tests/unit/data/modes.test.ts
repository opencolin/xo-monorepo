/**
 * Section C: mode registry tests.
 *
 * Validates that the three v.Next modes (Landing, Agent, Public) are
 * registered in the right order with the right auth flags. Catches
 * regressions where someone drops `auth` from a mode or swaps the
 * precedence around.
 */

import { describe, expect, it } from "vitest"
import { modeRegistry, DEFAULT_MODE_ID } from "@/data/modes"

describe("mode registry (Section C v.Next)", () => {
  it("registers the three v.Next modes", () => {
    expect(modeRegistry.has("landing")).toBe(true)
    expect(modeRegistry.has("agent")).toBe(true)
    expect(modeRegistry.has("public")).toBe(true)
  })

  it("does not register the legacy `default` mode", () => {
    expect(modeRegistry.has("default")).toBe(false)
  })

  it("does not register `setup` for v.Next", () => {
    expect(modeRegistry.has("setup")).toBe(false)
  })

  it("DEFAULT_MODE_ID is `landing`", () => {
    expect(DEFAULT_MODE_ID).toBe("landing")
  })

  it("Landing is auth: public", () => {
    const m = modeRegistry.get("landing")
    expect(m).toBeDefined()
    expect(m?.auth).toBe("public")
  })

  it("Agent is auth: required", () => {
    const m = modeRegistry.get("agent")
    expect(m).toBeDefined()
    expect(m?.auth).toBe("required")
  })

  it("Public is auth: public (placeholder)", () => {
    const m = modeRegistry.get("public")
    expect(m).toBeDefined()
    expect(m?.auth).toBe("public")
  })

  it("registry list returns modes sorted by precedence: landing, agent, public", () => {
    const list = modeRegistry.list()
    const ids = list.map((m) => m.id)
    expect(ids).toEqual(["landing", "agent", "public"])
  })

  it("every registered mode has at least one app path", () => {
    for (const m of modeRegistry.list()) {
      expect(m.appPaths.length).toBeGreaterThan(0)
    }
  })

  it("every dock path in every mode is a subset of its appPaths", () => {
    for (const m of modeRegistry.list()) {
      for (const p of m.dockPaths) {
        expect(m.appPaths).toContain(p)
      }
    }
  })

  it("no mode has more than 4 dock paths", () => {
    for (const m of modeRegistry.list()) {
      expect(m.dockPaths.length).toBeLessThanOrEqual(4)
    }
  })
})
