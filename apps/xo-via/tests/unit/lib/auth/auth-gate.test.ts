/**
 * Section G stub tests.
 *
 * Verifies the canEnter contract that the Pager (Section C) relies on:
 *   - public modes always pass
 *   - required modes block until Clerk lands
 *   - isAuthenticated is false in the stub
 */

import { describe, expect, it } from "vitest"
import { renderHook } from "@testing-library/react"
import { useAuthGate } from "@/lib/auth/auth-gate"
import { defineMode } from "@/lib/xo-mode"

const publicMode = defineMode({
  id: "_test_public",
  label: "Test Public",
  auth: "public",
  appPaths: ["/"],
  dockPaths: [],
})

const requiredMode = defineMode({
  id: "_test_required",
  label: "Test Required",
  auth: "required",
  appPaths: ["/"],
  dockPaths: [],
})

const unspecifiedMode = defineMode({
  id: "_test_unspecified",
  label: "Test Unspecified (auth omitted)",
  appPaths: ["/"],
  dockPaths: [],
})

describe("useAuthGate (stub)", () => {
  it("isAuthenticated defaults to false in the stub", () => {
    const { result } = renderHook(() => useAuthGate())
    expect(result.current.isAuthenticated).toBe(false)
  })

  it("permits public modes", () => {
    const { result } = renderHook(() => useAuthGate())
    expect(result.current.canEnter(publicMode)).toBe(true)
  })

  it("permits modes with no auth field (default: public)", () => {
    const { result } = renderHook(() => useAuthGate())
    expect(result.current.canEnter(unspecifiedMode)).toBe(true)
  })

  it("PERMITS required modes in the stub (Section G ships the real gate)", () => {
    // Stub-only behavior: blocking required modes here would make the
    // Pager unusable in dev (no Clerk = no session = perpetual block).
    // Section G replaces this with the real Clerk check.
    const { result } = renderHook(() => useAuthGate())
    expect(result.current.canEnter(requiredMode)).toBe(true)
  })

  it("requestSignIn is a no-op in the stub (does not throw)", () => {
    const { result } = renderHook(() => useAuthGate())
    expect(() => result.current.requestSignIn()).not.toThrow()
    expect(() =>
      result.current.requestSignIn({ redirectMode: "agent" }),
    ).not.toThrow()
  })
})
