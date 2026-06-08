"use client"

import * as React from "react"
import { motion, useTransform } from "framer-motion"
import { useGestures } from "@/context/GestureContext"
import { useMode } from "@/context/ModeContext"
import { PANEL_SPRING } from "@/lib/gestures/constants"
import {
  GLASS_PANEL_CLASS,
  GlassHighlight,
  GlassInnerGlow,
  GlassSpecular,
} from "./glass"

/**
 * Slides from the top, anchored to the top-right. Covers ~80% of the
 * phone screen. Three real toggles + four decorative tiles for v1.
 * Decorative tiles are marked aria-disabled so screen readers know.
 *
 * See GESTURE_PLAN.md §9.
 */
export function ControlCenterPanel() {
  const { controlT, closeAll, openPanel } = useGestures()
  const { currentMode, modes, setMode } = useMode()
  const [reducedMotion, setReducedMotion] = React.useState(false)
  const [theme, setTheme] = React.useState<"dark" | "light">("dark")
  const [xoDismissed, setXoDismissed] = React.useState(false)

  const translateY = useTransform(controlT, [0, 1], ["-100%", "0%"])
  // Low scrim so the glass refraction stays visible. See glass.tsx.
  const scrimOpacity = useTransform(controlT, [0, 1], [0, 0.2])
  const isOwner = openPanel === "control"

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
        aria-label="Control center"
        className={`absolute top-0 left-0 right-0 z-40 h-[80%] flex flex-col ${GLASS_PANEL_CLASS}`}
        style={{ y: translateY }}
        transition={PANEL_SPRING}
      >
        <GlassSpecular />
        <GlassInnerGlow />
        <GlassHighlight />
        <div className="relative px-6 pt-12 pb-4 flex items-center justify-between">
          <h2 className="text-white text-lg font-semibold">Control center</h2>
          <button
            onClick={closeAll}
            className="text-white/60 text-xs uppercase tracking-wider hover:text-white"
            aria-label="Close control center"
          >
            Close
          </button>
        </div>

        <div className="relative flex-1 overflow-y-auto px-6 pb-8 space-y-3">
          <Section title="Mode">
            <ModeSegmentedControl
              modes={modes.map(m => ({ id: m.id, label: m.label }))}
              currentId={currentMode}
              onSelect={id => setMode(id)}
            />
          </Section>

          <Section title="Real toggles">
            <Grid>
              <Toggle
                label="Reduced motion"
                active={reducedMotion}
                onClick={() => setReducedMotion(v => !v)}
              />
              <Toggle
                label={theme === "dark" ? "Dark theme" : "Light theme"}
                active={theme === "dark"}
                onClick={() => setTheme(t => (t === "dark" ? "light" : "dark"))}
              />
              <Toggle
                label={xoDismissed ? "XO hidden" : "XO visible"}
                active={!xoDismissed}
                onClick={() => setXoDismissed(v => !v)}
              />
            </Grid>
          </Section>

          <Section title="Decorative">
            <Grid>
              <Toggle label="Brightness" active decorative />
              <Toggle label="Wi-Fi" active decorative />
              <Toggle label="Bluetooth" active decorative />
              <Toggle label="Flashlight" decorative />
            </Grid>
          </Section>
        </div>
      </motion.section>
    </>
  )
}

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wider text-white/40 mb-2">
        {title}
      </div>
      {children}
    </div>
  )
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-2">{children}</div>
}

/**
 * iOS-style segmented control. One pill per registered mode; the
 * active mode is highlighted in lime. Works for any number of modes
 * since we read the registry; the layout flows to a wrap if more
 * than 4 modes ever register.
 */
function ModeSegmentedControl({
  modes,
  currentId,
  onSelect,
}: {
  modes: { id: string; label: string }[]
  currentId: string
  onSelect: (id: string) => void
}) {
  return (
    <div
      role="radiogroup"
      aria-label="Mode"
      className="flex flex-wrap gap-1 p-1 bg-white/10 rounded-2xl border border-white/15"
    >
      {modes.map(m => {
        const active = m.id === currentId
        return (
          <button
            key={m.id}
            role="radio"
            aria-checked={active}
            onClick={() => onSelect(m.id)}
            className={[
              "flex-1 min-w-0 px-3 py-2 rounded-xl text-sm font-medium transition-colors",
              active
                ? "bg-lime-400 text-ink-900 shadow-sm"
                : "text-white/80 hover:bg-white/10",
            ].join(" ")}
          >
            {m.label}
          </button>
        )
      })}
    </div>
  )
}

function Toggle({
  label,
  active = false,
  decorative = false,
  onClick,
}: {
  label: string
  active?: boolean
  decorative?: boolean
  onClick?: () => void
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      aria-disabled={decorative}
      className={[
        "h-14 rounded-2xl px-3 text-left text-sm font-medium transition-colors",
        active
          ? "bg-lime-400 text-ink-900"
          : "bg-white/10 text-white/80 hover:bg-white/15",
        decorative ? "cursor-default opacity-80" : "cursor-pointer",
      ].join(" ")}
    >
      {label}
      {decorative && (
        <span className="block text-[10px] uppercase tracking-wider opacity-60 mt-1">
          decorative
        </span>
      )}
    </button>
  )
}
