"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { useMode } from "@/context/ModeContext"
import { usePhone } from "@/context/PhoneContext"

/**
 * iPhone-style status bar. Decorative, except the clock which is live.
 * Sits above the Dynamic Island visually; text is split left/right to
 * avoid the island cutout.
 *
 * Mode-aware: tints its background using the active mode's
 * `theme.statusBarTint` when set. Default mode has no tint; setup
 * mode gets a faint amber wash, etc.
 */
export function StatusBar() {
  const { status } = usePhone()
  const { mode } = useMode()
  const tint = mode.theme?.statusBarTint ?? "transparent"

  return (
    <motion.div
      className="phone-status-bar relative z-40 h-11 px-6 pt-2 flex items-center justify-between text-white text-[13px] font-semibold tracking-tight"
      animate={{ backgroundColor: tint }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      <span>{status.time}</span>
      <span className="flex items-center gap-1.5">
        <SignalIcon />
        {status.wifi && <WifiIcon />}
        <BatteryIcon level={status.charge} />
      </span>
    </motion.div>
  )
}

function SignalIcon() {
  return (
    <svg width="18" height="11" viewBox="0 0 18 11" aria-hidden>
      <rect x="0"  y="6" width="3" height="5" rx="1" fill="white" />
      <rect x="5"  y="4" width="3" height="7" rx="1" fill="white" />
      <rect x="10" y="2" width="3" height="9" rx="1" fill="white" />
      <rect x="15" y="0" width="3" height="11" rx="1" fill="white" />
    </svg>
  )
}

function WifiIcon() {
  return (
    <svg width="16" height="12" viewBox="0 0 16 12" aria-hidden>
      <path d="M8 11l2-2a3 3 0 0 0-4 0l2 2z" fill="white"/>
      <path d="M8 7l4-4a8 8 0 0 0-8 0l4 4z" fill="white" fillOpacity="0.7"/>
      <path d="M8 3l6-6a12 12 0 0 0-12 0l6 6z" fill="white" fillOpacity="0.4"/>
    </svg>
  )
}

function BatteryIcon({ level }: { level: number }) {
  const w = Math.max(2, Math.round(20 * level))
  return (
    <svg width="26" height="12" viewBox="0 0 26 12" aria-hidden>
      <rect x="0.5" y="0.5" width="22" height="11" rx="2.5" ry="2.5" fill="none" stroke="white" strokeOpacity="0.5"/>
      <rect x="2"   y="2"   width={w} height="8" rx="1.5" ry="1.5" fill="white" />
      <rect x="23"  y="4"   width="2" height="4" rx="1" fill="white" fillOpacity="0.6"/>
    </svg>
  )
}
