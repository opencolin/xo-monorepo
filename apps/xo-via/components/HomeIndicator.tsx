"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { usePhone } from "@/context/PhoneContext"

/**
 * The pill at the bottom of every iPhone screen.
 *
 * v1 gesture refactor: drag handling moved into `GestureSurface`,
 * which owns the bottom-edge swipe-up home gesture. This component
 * is now a tappable visual hint only.
 *
 * Tap returns home (kept for accessibility + non-touch input).
 */
export function HomeIndicator() {
  const { current, goHome } = usePhone()
  const router = useRouter()
  const isHome = current === "/"

  return (
    <div className="phone-home-indicator relative z-40 h-7 flex items-end justify-center pb-1.5">
      <motion.button
        aria-label="Home"
        onClick={() => {
          if (!isHome) {
            goHome()
            router.push("/")
          }
        }}
        whileTap={{ scaleX: 0.95 }}
        className="h-1.5 w-32 rounded-full bg-white/85"
      />
    </div>
  )
}
