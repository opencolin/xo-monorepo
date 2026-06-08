"use client"

import * as React from "react"
import { useRoles } from "@/context/RoleContext"
import type { ResolvedXOApp } from "@/lib/xo-app"
import { SignInGate } from "./SignInGate"

/**
 * Per-app access gate.
 *
 * Wraps an app's body. Reads the app's `requiredRoles` and the
 * current user's roles; if the user lacks any required role, renders
 * the appropriate gate UI instead of the body.
 *
 * v7.0: the only gate is `<SignInGate/>` (anonymous user hits a
 * sign-in-required app). v7.1+ will add `<PaywallGate/>` for paid
 * tiers; the dispatcher here picks based on which role is missing.
 *
 * Discovery stays permissive: this gate only fires when the user
 * is INSIDE an app. Home grid, dock, Spotlight, Settings switcher
 * are all role-blind by design.
 *
 * Mounted from XOAppShell so every app picks up the same gate
 * behavior without per-page wiring.
 */
export function RoleGate({
  app,
  children,
}: {
  app: ResolvedXOApp
  children: React.ReactNode
}) {
  const { canAccess, missingFor } = useRoles()

  const required = app.requiredRoles
  if (canAccess(required)) {
    return <>{children}</>
  }

  // Pick the right gate based on which role is missing. v7.0 only
  // has "signed-in"; future roles (pro, admin, etc.) route to
  // paywall, request-access, or upgrade flows respectively.
  const missing = missingFor(required)
  return <GateFor missing={missing} app={app} />
}

function GateFor({
  missing,
  app,
}: {
  missing: readonly string[]
  app: ResolvedXOApp
}) {
  // Only one role today, only one gate. The switch is here so the
  // dispatch site is obvious when more roles + gates arrive.
  if (missing.includes("signed-in")) {
    return <SignInGate app={app} />
  }
  // Unknown role required (taxonomy mismatch); fall back to sign-in
  // gate so the user has SOMETHING actionable.
  return <SignInGate app={app} />
}
