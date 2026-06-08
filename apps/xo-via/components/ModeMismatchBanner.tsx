"use client"

import * as React from "react"
import { useMode } from "@/context/ModeContext"
import { DEFAULT_MODE_ID } from "@/data/modes"
import type { ResolvedXOApp } from "@/lib/xo-app"

/**
 * Soft banner shown above an app body when the user lands on an
 * app that is not in the current mode's appPaths (via direct URL
 * or a stale link). Per MODES_PLAN.md §10 option A: never block
 * access, always offer the right mode.
 *
 * Tap → switch to a mode that includes this app (default first,
 * else the highest-precedence mode that lists it).
 *
 * Server-rendered: reads `mode` from context which is a client
 * component, so this banner is rendered client-side. Hidden by
 * default during SSR (renders empty); appears post-hydrate if the
 * app does not belong to the active mode.
 */
export function ModeMismatchBanner({ app }: { app: ResolvedXOApp }) {
  const { currentMode, mode, modes, setMode } = useMode()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => setMounted(true), [])

  // Block until hydration so server output stays clean.
  if (!mounted) return null

  // App opted out of the current mode? Or current mode does not
  // list the app's path?
  const optedOut =
    app.availableIn && !app.availableIn.includes(currentMode)
  const notListed = !mode.appPaths.includes(app.path)
  if (!optedOut && !notListed) return null

  // Find a mode that DOES include this app, preferring default.
  const candidateMode =
    modes.find(
      m =>
        m.id === DEFAULT_MODE_ID &&
        m.appPaths.includes(app.path) &&
        (!app.availableIn || app.availableIn.includes(m.id)),
    ) ??
    modes.find(
      m =>
        m.appPaths.includes(app.path) &&
        (!app.availableIn || app.availableIn.includes(m.id)),
    )

  if (!candidateMode) {
    // No mode includes this app; banner offers nothing useful.
    return null
  }

  return (
    <div className="px-5 pt-3">
      <button
        type="button"
        onClick={() => setMode(candidateMode.id)}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-2xl bg-lime-400/10 border border-lime-400/30 text-left hover:bg-lime-400/15 transition-colors"
      >
        <div className="min-w-0 flex-1">
          <div className="text-lime-300 text-sm font-medium">
            Not available in {mode.label} mode
          </div>
          <div className="text-lime-300/70 text-[11px] mt-0.5">
            Tap to switch to {candidateMode.label} and explore freely
          </div>
        </div>
        <span aria-hidden className="text-lime-300/60 text-sm">
          ›
        </span>
      </button>
    </div>
  )
}
