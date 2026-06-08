"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useMode } from "@/context/ModeContext"
import { DEFAULT_MODE_ID } from "@/data/modes"

/**
 * Slim pill banner that appears below the status bar on the home
 * screen whenever the current mode is NOT the default. Tap to
 * return to the default mode.
 *
 * Renders nothing in the default mode, so users who never switch
 * see no extra chrome. Marketing default stays clean.
 */
const DEFAULT_ACCENT = "#83d63a" // XO lime

export function ModeBanner() {
  const { currentMode, mode, setMode } = useMode()
  const isDefault = currentMode === DEFAULT_MODE_ID
  const accent = mode.theme?.accent ?? DEFAULT_ACCENT

  return (
    <AnimatePresence initial={false}>
      {!isDefault && (
        <motion.button
          key={`mode-banner-${currentMode}`}
          type="button"
          onClick={() => setMode(DEFAULT_MODE_ID)}
          aria-label={`Current mode: ${mode.label}. Tap to return to default.`}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 mx-auto mt-1 px-3 py-1 rounded-full text-[11px] font-medium backdrop-blur-md transition-colors flex items-center gap-1.5"
          // Per-mode accent: background tint, border, text + dot all
          // derive from theme.accent (falls back to XO lime).
          style={{
            backgroundColor: `${accent}26`, // ~15% alpha
            color: accent,
            border: `1px solid ${accent}4D`, // ~30% alpha
          }}
        >
          <span
            aria-hidden
            className="w-1.5 h-1.5 rounded-full animate-pulse"
            style={{ backgroundColor: accent }}
          />
          <span>{mode.label} mode</span>
          <span aria-hidden className="text-[10px] opacity-60">
            tap to exit
          </span>
        </motion.button>
      )}
    </AnimatePresence>
  )
}
