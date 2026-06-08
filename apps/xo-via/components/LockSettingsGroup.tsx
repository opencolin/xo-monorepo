"use client"

import * as React from "react"
import { useLock } from "@/context/LockContext"

/**
 * "Lock screen" settings group, mounted from app/settings/page.tsx.
 *
 * Phase 4 of LOCKSCREEN_PLAN.md:
 *   - sticky toggle (stay unlocked between visits in the 24h window)
 *   - Lock now (manual re-lock)
 *   - Reset lockscreen state (clear localStorage, lock immediately)
 *
 * Visual contract matches the Group/Row layout used elsewhere in
 * Settings: a labelled section with rows divided by phone-divider.
 */
export function LockSettingsGroup() {
  const { sticky, setSticky, lock, resetLockState, lastUnlockedAt } = useLock()

  return (
    <section className="mt-2">
      <div className="px-5 mb-1 text-xs uppercase tracking-wider text-white/40">
        Lock screen
      </div>
      <div className="bg-phone-card2 mx-3 rounded-xl divide-y divide-phone-divider">
        <ToggleRow
          label="Stay unlocked between visits"
          description={
            sticky
              ? "Lockscreen reappears after 24 hours of no activity"
              : "Lockscreen appears every visit"
          }
          checked={sticky}
          onChange={setSticky}
        />
        <ButtonRow
          label="Lock now"
          description="Show the lockscreen again until you swipe up"
          onClick={lock}
        />
        <ButtonRow
          label="Reset lockscreen state"
          description={
            lastUnlockedAt
              ? `Last unlocked ${formatLastUnlocked(lastUnlockedAt)}`
              : "Clear stored preferences"
          }
          onClick={resetLockState}
          danger
        />
      </div>
    </section>
  )
}

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string
  description?: string
  checked: boolean
  onChange: (next: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between px-4 py-3 gap-3">
      <div className="min-w-0 flex-1">
        <div className="text-white text-sm">{label}</div>
        {description && (
          <div className="text-white/40 text-[11px] mt-0.5">{description}</div>
        )}
      </div>
      <button
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={[
          "relative w-11 h-6 rounded-full transition-colors shrink-0",
          checked ? "bg-lime-400" : "bg-white/15",
        ].join(" ")}
      >
        <span
          aria-hidden
          className={[
            "absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform",
            checked ? "translate-x-5" : "translate-x-0",
          ].join(" ")}
        />
      </button>
    </div>
  )
}

function ButtonRow({
  label,
  description,
  onClick,
  danger = false,
}: {
  label: string
  description?: string
  onClick: () => void
  danger?: boolean
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between px-4 py-3 gap-3 text-left hover:bg-white/[0.03] active:bg-white/[0.06]"
    >
      <div className="min-w-0 flex-1">
        <div
          className={[
            "text-sm",
            danger ? "text-red-400" : "text-white",
          ].join(" ")}
        >
          {label}
        </div>
        {description && (
          <div className="text-white/40 text-[11px] mt-0.5">{description}</div>
        )}
      </div>
      <span aria-hidden className="text-white/30 text-sm">
        ›
      </span>
    </button>
  )
}

function formatLastUnlocked(ms: number): string {
  if (!ms) return "never"
  const delta = Date.now() - ms
  const mins = Math.round(delta / 60_000)
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.round(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.round(hrs / 24)
  return `${days}d ago`
}
