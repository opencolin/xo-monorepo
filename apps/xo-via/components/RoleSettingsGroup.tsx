"use client"

import * as React from "react"
import { useRoles } from "@/context/RoleContext"
import { ALL_ROLES, roleLabel, type Role } from "@/lib/xo-roles"

/**
 * Dev-only role switcher. Lets a developer flip the current role
 * set to test gating without real auth. Renders nothing in
 * production unless the `xo-dev=1` cookie is present.
 *
 * Mounted from app/settings/page.tsx between Mode and Appearance.
 *
 * v7.1 will replace this with a read-only display once Clerk owns
 * the role source; the toggles are temporary scaffolding.
 */
export function RoleSettingsGroup() {
  const { roles, grant, revoke, devModeEnabled } = useRoles()
  const [mounted, setMounted] = React.useState(false)

  // Avoid SSR/hydration mismatch: devModeEnabled is determined
  // post-mount (cookies + env aren't read on server).
  React.useEffect(() => setMounted(true), [])
  if (!mounted) return null
  if (!devModeEnabled) return null

  return (
    <section className="mt-2">
      <div className="px-5 mb-1 text-xs uppercase tracking-wider text-amber-300/70 flex items-center gap-2">
        Roles
        <span className="px-1.5 py-0.5 rounded-md bg-amber-400/15 border border-amber-400/30 text-amber-300 text-[9px] tracking-widest">
          DEV
        </span>
      </div>
      <div className="bg-phone-card2 mx-3 rounded-xl divide-y divide-phone-divider">
        {ALL_ROLES.map(role => (
          <RoleToggleRow
            key={role}
            role={role}
            checked={roles.includes(role)}
            onToggle={() =>
              roles.includes(role) ? revoke(role) : grant(role)
            }
          />
        ))}
      </div>
      <p className="px-5 mt-1.5 text-white/35 text-[10px] leading-relaxed">
        Temporary scaffold (Phase 7.0). Phase 7.1 replaces these with
        the real Clerk-derived role state.
      </p>
    </section>
  )
}

function RoleToggleRow({
  role,
  checked,
  onToggle,
}: {
  role: Role
  checked: boolean
  onToggle: () => void
}) {
  return (
    <div className="flex items-center justify-between px-4 py-3 gap-3">
      <div className="min-w-0 flex-1">
        <div className="text-white text-sm">{roleLabel(role)}</div>
        <div className="text-white/40 text-[11px] mt-0.5">
          {checked
            ? "Active. Gated apps render normally."
            : "Inactive. Gated apps show the sign-in screen."}
        </div>
      </div>
      <button
        role="switch"
        aria-checked={checked}
        aria-label={`Toggle role ${roleLabel(role)}`}
        onClick={onToggle}
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
