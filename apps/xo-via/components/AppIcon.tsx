"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { usePhone } from "@/context/PhoneContext"
import type { ResolvedXOApp } from "@/lib/xo-app"

/**
 * Square rounded app icon. Tapping it either opens the route in-OS
 * or, for `kind: "external"` apps, opens the href in a new tab.
 *
 * `layoutId` matches the AppView's layoutId, so when Framer Motion sees
 * the icon disappear and the AppView appear with the same layoutId, it
 * animates a shared-element transition: the icon expands into the app.
 */
export function AppIcon({ app }: { app: ResolvedXOApp }) {
  const { openApp } = usePhone()
  const router = useRouter()

  function onActivate() {
    if (app.kind === "external") {
      window.open(app.href, "_blank", "noopener,noreferrer")
      return
    }
    openApp(app.path)
    router.push(app.path)
  }

  // Prefetch the route so the layoutId morph does not stall on RSC fetch.
  React.useEffect(() => {
    if (app.kind !== "external" && app.path !== "/") {
      router.prefetch(app.path)
    }
  }, [app.kind, app.path, router])

  return (
    <motion.button
      onClick={onActivate}
      whileTap={{ scale: 0.9 }}
      className="flex flex-col items-center gap-1.5 select-none"
      aria-label={app.label}
    >
      <motion.span
        layoutId={`app-tile-${app.path}`}
        className={[
          "app-icon-tile w-14 h-14 rounded-2xl grid place-items-center font-semibold text-base",
          app.tile,
        ].join(" ")}
      >
        <span aria-hidden>{app.glyph}</span>
      </motion.span>
      <span className="text-[11px] font-medium text-white/95 drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)] leading-tight max-w-[70px] truncate">
        {app.label}
      </span>
    </motion.button>
  )
}
