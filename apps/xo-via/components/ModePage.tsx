"use client"

import * as React from "react"
import { findApp } from "@/data/apps"
import type { ResolvedMode } from "@/lib/xo-mode"
import type { ResolvedXOApp } from "@/lib/xo-app"
import { AppIcon } from "./AppIcon"

/**
 * One mode's icon grid. Renders the apps for the given mode in a 4-col
 * grid; nothing else (no wallpaper, no dock, no banner).
 *
 * Section C (v.Next, iPhone-style): the Pager renders one ModePage per
 * registered mode inside a horizontally-translating strip. Only the
 * grid layer translates with the swipe; the wallpaper, banner, dock,
 * WanderingVia, and page dots all live ABOVE the strip in Pager and
 * stay in place (the dock crossfades in-place on mode commit).
 *
 * Reads mode + apps from the passed `mode` prop, not from context, so
 * off-screen pages render correctly without depending on the active
 * currentMode.
 */
export function ModePage({ mode }: { mode: ResolvedMode }) {
  const modeApps = React.useMemo<readonly ResolvedXOApp[]>(() => {
    return mode.appPaths
      .map(p => findApp(p))
      .filter((a): a is ResolvedXOApp => a !== undefined)
      .filter(
        a =>
          !a.availableIn ||
          a.availableIn.length === 0 ||
          a.availableIn.includes(mode.id),
      )
  }, [mode])

  // Grid skips external tiles; they live in the dock per MODES_PLAN §13.
  const gridApps = modeApps.filter(a => a.kind !== "external")

  return (
    <div className="h-full w-full px-6 pt-4 pb-2 grid grid-cols-4 gap-x-4 gap-y-5 content-start">
      {gridApps.slice(0, 24).map(app => (
        <AppIcon key={app.path} app={app} />
      ))}
    </div>
  )
}
