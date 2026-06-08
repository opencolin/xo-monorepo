/**
 * Auth gate hook (Section G stub).
 *
 * The full implementation is delivered in Section G when @clerk/nextjs
 * wires in. Until then this hook always permits entry to any mode so
 * the Pager can ship with the gate seam in place; the moment Clerk
 * lands, the real implementation drops in here without UI changes.
 *
 * Contract:
 *   canEnter(mode) - true if the user may swipe into this mode
 *                    given current auth state. Public modes always
 *                    return true. Required modes return true when
 *                    a Clerk session is active.
 *
 *   isAuthenticated - true when a Clerk session is active. Until
 *                     Section G lands this is always false.
 *
 *   requestSignIn(redirect) - intent surface for the Pager to fire
 *                             the Clerk sign-in surface. No-op in
 *                             the stub; the Pager treats a `false`
 *                             from canEnter as "snap back" instead.
 *
 * See V_NEXT_PLAN.html Section G + Section C (Pager behavior bullet
 * on auth gating).
 */

import type { ResolvedMode } from "@/lib/xo-mode"

export interface AuthGate {
  /** Is a Clerk session active? */
  isAuthenticated: boolean
  /** May the user enter this mode given current auth state? */
  canEnter: (mode: ResolvedMode) => boolean
  /**
   * Fire the sign-in surface, optionally redirecting back to a
   * specific mode after success.
   *
   * Stub: no-op. Section G fills it in.
   */
  requestSignIn: (opts?: { redirectMode?: string }) => void
}

export function useAuthGate(): AuthGate {
  // Section G replaces this with `useUser()` from @clerk/nextjs.
  //
  // Stub behavior: permit ALL modes until Clerk lands. Returning false
  // for "required" modes here would block the Pager swipe (no Clerk
  // means no session means the gate fires forever), which makes the
  // OS unusable in dev. Once Section G ships, this becomes:
  //
  //   const { isSignedIn } = useUser()
  //   canEnter: (m) => m.auth !== "required" || isSignedIn
  return {
    isAuthenticated: false,
    canEnter: (_mode: ResolvedMode) => true,
    requestSignIn: () => {
      // no-op until Section G
    },
  }
}
