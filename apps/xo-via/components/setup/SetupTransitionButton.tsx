"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useMode } from "@/context/ModeContext"
import { usePhone } from "@/context/PhoneContext"

/**
 * Three CTAs that drive mode transitions during the setup flow.
 *
 *   <BeginSetupButton/>       lands on /setup-welcome from landing.
 *                             Switches mode → "setup" and routes to
 *                             /setup-profile.
 *
 *   <SetupContinueLink/>      mid-flow next step (profile → workspace
 *                             → integrations). Pure router push, no
 *                             mode change (we are already in setup).
 *
 *   <FinishSetupButton/>      end of /setup-integrations. Switches
 *                             mode → "default" and routes to /.
 *
 * Splitting the three rather than one polymorphic button keeps each
 * intent explicit at the call site.
 */

// Setup CTAs match the existing in-app CTA pattern (see
// /coworker, /swarm, /pricing): block, mt-6, bg-<accent>-400,
// text-ink-900, font-semibold, py-3, rounded-xl. Setup uses
// amber (mode accent) instead of lime so it reads as the setup
// flow.
const AMBER_CTA = [
  "block w-full mt-6 text-center bg-amber-400 text-ink-900",
  "font-semibold py-3 rounded-xl",
  "hover:brightness-105 active:brightness-95 transition-[filter]",
].join(" ")

const SECONDARY_CTA = [
  "block w-full text-center bg-white/10 text-white",
  "font-medium py-3 rounded-xl border border-white/15",
  "hover:bg-white/15 transition-colors",
].join(" ")

export function BeginSetupButton() {
  const router = useRouter()
  const { openApp } = usePhone()
  const { setMode, currentMode } = useMode()

  function onClick() {
    if (currentMode !== "setup") {
      setMode("setup")
    }
    openApp("/setup-profile")
    router.push("/setup-profile")
  }

  return (
    <button onClick={onClick} className={AMBER_CTA}>
      Begin setup
    </button>
  )
}

export function SetupContinueLink({
  path,
  label = "Continue",
}: {
  path: string
  label?: string
}) {
  const router = useRouter()
  const { openApp } = usePhone()

  function onClick() {
    openApp(path)
    router.push(path)
  }

  return (
    <button onClick={onClick} className={AMBER_CTA}>
      {label}
    </button>
  )
}

export function FinishSetupButton() {
  const router = useRouter()
  const { setMode } = useMode()
  const { goHome } = usePhone()

  function onClick() {
    setMode("default")
    goHome()
    router.push("/")
  }

  return (
    <div className="space-y-2">
      <button onClick={onClick} className={AMBER_CTA}>
        Finish setup
      </button>
      <p className="text-white/40 text-[11px] text-center">
        Returns you to the full XO experience.
      </p>
    </div>
  )
}

/** Re-exported for places that want the secondary class without
 *  re-deriving it. */
export const SETUP_SECONDARY_CTA_CLASS = SECONDARY_CTA
