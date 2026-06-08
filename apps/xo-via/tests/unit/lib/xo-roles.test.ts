import { describe, it, expect } from "vitest"
import {
  hasAnyRole,
  hasRole,
  missingRoles,
  type Role,
} from "@/lib/xo-roles"

/**
 * Phase 1 starter: lib/xo-roles.ts is the smallest, purest module
 * in the OS. Five cases of `hasAnyRole` are the canonical example
 * the Phase 0 scaffold targets (TESTING_PLAN.md §5).
 *
 * Later additions for Phase 1 proper will add cases for hasRole,
 * missingRoles, and roleLabel.
 */

describe("hasAnyRole", () => {
  it("returns true when required is undefined (no role gate)", () => {
    expect(hasAnyRole([], undefined)).toBe(true)
    expect(hasAnyRole(["signed-in"], undefined)).toBe(true)
  })

  it("returns true when required is an empty array (no role gate)", () => {
    expect(hasAnyRole([], [])).toBe(true)
    expect(hasAnyRole(["signed-in"], [])).toBe(true)
  })

  it("returns true when the user has the single required role", () => {
    expect(hasAnyRole(["signed-in"], ["signed-in"])).toBe(true)
  })

  it("returns true when the user satisfies at least one of multiple required roles (OR semantics)", () => {
    const current: Role[] = ["signed-in"]
    // Future role like "admin" is a string the taxonomy does not
    // include; the OR still matches via signed-in.
    expect(hasAnyRole(current, ["signed-in", "admin"])).toBe(true)
    expect(hasAnyRole(current, ["admin", "signed-in"])).toBe(true)
  })

  it("returns false when the user satisfies none of the required roles", () => {
    expect(hasAnyRole([], ["signed-in"])).toBe(false)
    expect(hasAnyRole([], ["signed-in", "admin"])).toBe(false)
    // Future role only: known role missing, exact mismatch.
    expect(hasAnyRole([] as Role[], ["admin"])).toBe(false)
  })
})

describe("hasRole + missingRoles smoke", () => {
  // Lightweight coverage to verify the related helpers wire through
  // the same precedence as hasAnyRole. Full Phase 1 expands this.
  it("hasRole matches an exact present role", () => {
    expect(hasRole(["signed-in"], "signed-in")).toBe(true)
    expect(hasRole([], "signed-in")).toBe(false)
  })

  it("missingRoles returns empty when access is granted", () => {
    expect(missingRoles(["signed-in"], ["signed-in"])).toEqual([])
    expect(missingRoles(["signed-in"], undefined)).toEqual([])
  })

  it("missingRoles returns the required set when access is denied", () => {
    expect(missingRoles([], ["signed-in"])).toEqual(["signed-in"])
  })
})
