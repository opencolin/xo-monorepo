"use client"

import * as React from "react"

/**
 * Shared visual contract for the slide-down panels.
 *
 * iOS-grade frosted glass:
 *   - heavy backdrop-blur so the underlying icons/wallpaper smear into
 *     soft color washes
 *   - generous saturation + brightness lift so the smear keeps its
 *     vibrance instead of turning grey
 *   - low-opacity white surface so the blur shows through; high
 *     opacity would just give a solid card
 *   - bright border + top highlight to indicate "edge of a glass pane"
 *
 * The scrim opacity matters: it sits BEHIND the panel, so a dark
 * scrim makes the blur pick up a dark image. The panels keep scrim
 * opacity low (~0.2) so the glass actually has something to refract.
 */
export const GLASS_PANEL_CLASS = [
  "bg-white/10",
  "backdrop-blur-3xl",
  "backdrop-saturate-200",
  "backdrop-brightness-110",
  "border-b-2 border-l-2 border-r-2 border-white/20",
  "shadow-[0_24px_60px_-20px_rgba(0,0,0,0.7)]",
  "rounded-b-3xl",
  "overflow-hidden",
].join(" ")

/**
 * Bright pencil-thin highlight along the top edge of a glass panel.
 * The "rim light" cue. Should be visible against any background.
 */
export function GlassHighlight() {
  return (
    <div
      aria-hidden
      className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent pointer-events-none z-10"
    />
  )
}

/**
 * Soft inner light at the top, fading down. Mimics how a glass slab
 * catches a little extra light along its leading edge.
 */
export function GlassInnerGlow() {
  return (
    <div
      aria-hidden
      className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-white/10 via-white/[0.04] to-transparent pointer-events-none"
    />
  )
}

/**
 * Faint specular streak across the top quarter. Diagonal sheen that
 * makes the slab read as glass rather than as a plastic card. Subtle
 * by design; you should notice it on a dark background but not in
 * bright content.
 */
export function GlassSpecular() {
  return (
    <div
      aria-hidden
      className="absolute -top-10 -left-10 right-1/3 h-40 bg-gradient-to-br from-white/15 to-transparent blur-2xl pointer-events-none rotate-6"
    />
  )
}
