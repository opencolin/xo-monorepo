"use client"

import * as React from "react"
import { motion, useTransform } from "framer-motion"
import { useGestures } from "@/context/GestureContext"
import { PANEL_SPRING } from "@/lib/gestures/constants"
import {
  GLASS_PANEL_CLASS,
  GlassHighlight,
  GlassInnerGlow,
  GlassSpecular,
} from "./glass"

/**
 * Slides from the top, anchored to the top-left. Covers ~80% of the
 * phone screen. Empty state for v1; real notifications are a separate
 * feature (see GESTURE_PLAN.md §9).
 *
 * Position is driven by the shared `notifT` motion value:
 *   0   = fully off-screen above
 *   1   = fully open at rest
 * The GestureSurface writes this value during TRACKING; intent
 * actions (openNotifications / closeAll) animate it to 0 or 1.
 */
export function NotificationPanel() {
  const { notifT, closeAll, openPanel } = useGestures()

  // Translate Y from -100% (closed) to 0% (open).
  const translateY = useTransform(notifT, [0, 1], ["-100%", "0%"])
  // Scrim is intentionally low: the panel's backdrop-blur is the
  // primary visual; a heavy scrim would darken the home content
  // behind the glass, killing the refraction.
  const scrimOpacity = useTransform(notifT, [0, 1], [0, 0.2])

  const isOwner = openPanel === "notifications"

  return (
    <>
      <motion.div
        aria-hidden
        className="absolute inset-0 z-30 bg-black"
        style={{
          opacity: scrimOpacity,
          // Critical: pass clicks through when closed, otherwise the
          // scrim swallows every tap on the screen.
          pointerEvents: isOwner ? "auto" : "none",
        }}
        onClick={closeAll}
      />
      <motion.section
        role="dialog"
        aria-modal="true"
        aria-label="Notifications"
        className={`absolute top-0 left-0 right-0 z-40 h-[80%] flex flex-col ${GLASS_PANEL_CLASS}`}
        style={{ y: translateY }}
        transition={PANEL_SPRING}
        // Tap-to-close caught by the scrim above; panel itself
        // does not handle taps so its children can be interactive.
      >
        <GlassSpecular />
        <GlassInnerGlow />
        <GlassHighlight />
        <div className="relative px-6 pt-12 pb-4 flex items-center justify-between">
          <h2 className="text-white text-lg font-semibold">Notifications</h2>
          {isOwner && (
            <button
              onClick={closeAll}
              className="text-white/60 text-xs uppercase tracking-wider hover:text-white"
              aria-label="Close notifications"
            >
              Close
            </button>
          )}
        </div>
        <div className="relative flex-1 overflow-y-auto px-6 pb-8">
          <div className="bg-white/[0.06] backdrop-blur-md rounded-2xl p-6 text-center border border-white/10">
            <p className="text-white/70 text-sm">Nothing here yet.</p>
            <p className="text-white/40 text-xs mt-2">
              When XO has something to tell you, it will show up here.
            </p>
          </div>
        </div>
      </motion.section>
    </>
  )
}
