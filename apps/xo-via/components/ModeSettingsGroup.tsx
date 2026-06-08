"use client"

import * as React from "react"
import { useMode } from "@/context/ModeContext"

/**
 * "Mode" settings group. Lists every registered mode and lets the
 * user switch. Plus a "Reset mode state" button that clears
 * localStorage and returns to the default mode.
 *
 * Per MODES_PLAN.md §11: the list is rendered from the live
 * registry, so any third-party / A/B-test mode that registers shows
 * up automatically. RBAC-gated modes are hidden once the role
 * evaluator ships (Phase 7).
 */
export function ModeSettingsGroup() {
  const { currentMode, modes, setMode, resetModeState } = useMode()

  return (
    <section className="mt-2">
      <div className="px-5 mb-1 text-xs uppercase tracking-wider text-white/40">
        Mode
      </div>
      <div className="bg-phone-card2 mx-3 rounded-xl divide-y divide-phone-divider">
        {modes.map(mode => (
          <ModeRow
            key={mode.id}
            label={mode.label}
            description={mode.description}
            checked={mode.id === currentMode}
            onSelect={() => setMode(mode.id)}
          />
        ))}
        <ButtonRow
          label="Reset mode state"
          description="Clear stored mode and return to the default"
          onClick={resetModeState}
          danger
        />
      </div>
    </section>
  )
}

function ModeRow({
  label,
  description,
  checked,
  onSelect,
}: {
  label: string
  description?: string
  checked: boolean
  onSelect: () => void
}) {
  return (
    <button
      onClick={onSelect}
      aria-pressed={checked}
      className="w-full flex items-center justify-between px-4 py-3 gap-3 text-left hover:bg-white/[0.03] active:bg-white/[0.06]"
    >
      <div className="min-w-0 flex-1">
        <div className="text-white text-sm">{label}</div>
        {description && (
          <div className="text-white/40 text-[11px] mt-0.5">{description}</div>
        )}
      </div>
      <RadioIndicator checked={checked} />
    </button>
  )
}

function RadioIndicator({ checked }: { checked: boolean }) {
  return (
    <span
      aria-hidden
      className={[
        "shrink-0 w-5 h-5 rounded-full border-2 transition-colors grid place-items-center",
        checked ? "border-lime-400" : "border-white/30",
      ].join(" ")}
    >
      {checked && <span className="w-2.5 h-2.5 rounded-full bg-lime-400" />}
    </span>
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
