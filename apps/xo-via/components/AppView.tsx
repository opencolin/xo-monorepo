"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { usePhone } from "@/context/PhoneContext"
import { NavBar } from "./NavBar"
import { PullToRefresh } from "./gestures/PullToRefresh"
import type { ResolvedXOApp } from "@/lib/xo-app"

/**
 * Full-bleed app container. When opened from an icon, the layoutId
 * `app-tile-{path}` on the icon matches the one here, so Framer Motion
 * morphs the icon into the app. Closing reverses the animation.
 *
 * AppView owns the scroll container for the page body so the OS can
 * decide whether to wrap it in PullToRefresh (when the app opts in
 * via `app.gesture?.pullToRefresh`) or use a plain overflow-auto div.
 * Pages never need to render their own scroll container.
 */
export function AppView({ app }: { app: ResolvedXOApp }) {
  const { pageElement } = usePhone()
  const ptr = app.gesture?.pullToRefresh

  return (
    <motion.div
      key={app.path}
      layoutId={`app-tile-${app.path}`}
      className="absolute inset-0 bg-phone-card flex flex-col"
      transition={{ type: "spring", stiffness: 280, damping: 28 }}
    >
      <NavBar title={app.navTitle ?? app.label} />
      {ptr?.enabled ? (
        <PullToRefresh spec={ptr} appKind={app.kind}>
          {pageElement}
        </PullToRefresh>
      ) : (
        <div
          className="flex-1 overflow-auto bg-phone-card text-white"
          style={{ overscrollBehavior: "contain", touchAction: "pan-y" }}
        >
          {pageElement}
        </div>
      )}
    </motion.div>
  )
}
