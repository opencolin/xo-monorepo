"use client"

import * as React from "react"
import { AppIcon } from "./AppIcon"
import type { ResolvedXOApp } from "@/lib/xo-app"

/**
 * Bottom dock. Holds up to 4 pinned apps. Lives above the HomeIndicator.
 */
export function Dock({ apps }: { apps: ResolvedXOApp[] }) {
  return (
    <div className="relative mx-3 mb-2 px-3 py-2 rounded-3xl bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-around">
      {apps.slice(0, 4).map(a => (
        <AppIcon key={a.path} app={a} />
      ))}
    </div>
  )
}
