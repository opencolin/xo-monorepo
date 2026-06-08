"use client"

import * as React from "react"
import { motion, useTransform } from "framer-motion"
import { useRouter } from "next/navigation"
import { useGestures } from "@/context/GestureContext"
import { useMode } from "@/context/ModeContext"
import { usePhone } from "@/context/PhoneContext"
import { PANEL_SPRING } from "@/lib/gestures/constants"
import type { ResolvedXOApp } from "@/lib/xo-app"
import {
  GLASS_PANEL_CLASS,
  GlassHighlight,
  GlassInnerGlow,
  GlassSpecular,
} from "./glass"

/**
 * Slides from the top. Covers ~70% of the phone screen. Shows a
 * search input + filtered list of all XOApps (real search content
 * lands later; v1 ships the gesture surface + a literal label match).
 *
 * Spotlight mounts only when the user is on the home route, since
 * arbitration (GESTURE_PLAN.md §7) only allows it there.
 */
export function SpotlightPanel() {
  const { spotlightT, closeAll, openPanel } = useGestures()
  const { modeApps } = useMode()
  const { openApp } = usePhone()
  const router = useRouter()
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [query, setQuery] = React.useState("")

  const translateY = useTransform(spotlightT, [0, 1], ["-100%", "0%"])
  // Low scrim so the glass refraction stays visible. See glass.tsx.
  const scrimOpacity = useTransform(spotlightT, [0, 1], [0, 0.25])
  const isOwner = openPanel === "spotlight"

  // Decision §18.5: focus the input on desktop only. Coarse pointer
  // detection is the closest signal to "has a real keyboard."
  React.useEffect(() => {
    if (!isOwner) return
    if (typeof window === "undefined") return
    const isTouch = window.matchMedia("(pointer: coarse)").matches
    if (!isTouch) inputRef.current?.focus()
  }, [isOwner])

  const filtered = React.useMemo<ResolvedXOApp[]>(() => {
    const q = query.trim().toLowerCase()
    // Spotlight respects the active mode: only apps visible in this
    // mode show up. External tiles never appear (they open in a new
    // tab via the dock, not by search).
    const visible = modeApps.filter(a => a.kind !== "external")
    if (!q) return [...visible]
    return visible.filter(a => a.label.toLowerCase().includes(q))
  }, [query, modeApps])

  function activate(app: ResolvedXOApp) {
    closeAll()
    if (app.kind === "external") {
      window.open((app as { href: string }).href, "_blank", "noopener,noreferrer")
      return
    }
    openApp(app.path)
    router.push(app.path)
  }

  return (
    <>
      <motion.div
        aria-hidden
        className="absolute inset-0 z-30 bg-black"
        style={{
          opacity: scrimOpacity,
          // Pass clicks through when the panel is closed, otherwise
          // this absolute-inset div swallows every tap on the screen.
          pointerEvents: isOwner ? "auto" : "none",
        }}
        onClick={closeAll}
      />
      <motion.section
        role="dialog"
        aria-modal="true"
        aria-label="Spotlight search"
        className={`absolute top-0 left-0 right-0 z-40 h-[70%] flex flex-col ${GLASS_PANEL_CLASS}`}
        style={{ y: translateY }}
        transition={PANEL_SPRING}
      >
        <GlassSpecular />
        <GlassInnerGlow />
        <GlassHighlight />

        {/* Header: back chevron on the left, sits above the search input. */}
        <div className="relative px-3 pt-10 pb-1">
          <button
            onClick={closeAll}
            className="text-lime-300 hover:text-lime-200 flex items-center gap-1 px-2 py-1 rounded font-medium text-sm"
            aria-label="Back to home"
          >
            <svg width="10" height="16" viewBox="0 0 10 16" aria-hidden>
              <path
                d="M9 1L2 8l7 7"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>Back</span>
          </button>
        </div>

        <div className="relative px-5 pb-3 pt-1">
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-xl px-3 py-2 border border-white/10">
            <span aria-hidden className="text-white/50 text-sm">
              ⌕
            </span>
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="search apps"
              className="flex-1 bg-transparent outline-none text-white text-sm placeholder:text-white/40"
              aria-label="Search apps"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="text-white/40 hover:text-white text-xs"
                aria-label="Clear search"
              >
                clear
              </button>
            )}
          </div>
        </div>

        <div className="relative flex-1 overflow-y-auto px-3 pb-6">
          {filtered.length === 0 ? (
            <p className="text-white/40 text-sm text-center px-6 py-8">
              no apps match &ldquo;{query}&rdquo;
            </p>
          ) : (
            <ul className="space-y-1">
              {filtered.map(app => (
                <li key={app.path}>
                  <button
                    onClick={() => activate(app)}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/5 text-left"
                  >
                    <span
                      className={[
                        "w-10 h-10 rounded-xl grid place-items-center font-semibold text-sm",
                        app.tile,
                      ].join(" ")}
                      aria-hidden
                    >
                      {app.glyph}
                    </span>
                    <span className="flex-1">
                      <span className="block text-white text-sm">
                        {app.label}
                      </span>
                      {app.description && (
                        <span className="block text-white/40 text-[11px] truncate">
                          {app.description}
                        </span>
                      )}
                    </span>
                    <span aria-hidden className="text-white/30 text-xs">
                      ›
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </motion.section>
    </>
  )
}
