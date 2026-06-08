"use client"

import * as React from "react"
import {
  hasAnyRole,
  missingRoles,
  type Role,
} from "@/lib/xo-roles"

/**
 * Role state. v7.0 backs it with localStorage (dev stub); v7.1 will
 * swap the source to Clerk without changing this context's public
 * API.
 *
 * Permissive discovery: this context never filters modes or apps.
 * Discovery surfaces (HomeScreen grid, dock, Spotlight, Settings
 * switcher) all stay role-blind. Only `<RoleGate/>` rendered inside
 * each app body actually blocks access.
 *
 * See Phase 7 in MODES_PLAN.md.
 */

const STORAGE_KEY = "xo-roles-v1"
const STORAGE_VERSION = 1
const DEV_COOKIE = "xo-dev"

interface RoleContextValue {
  /** Current roles. Empty array = anonymous. */
  roles: readonly Role[]
  /**
   * True when current roles satisfy at least one of the required
   * roles. Accepts `readonly string[]` because the AppDef + ModeDef
   * `requiredRoles` fields are intentionally loose-typed (so
   * plugins can declare future roles without touching the core
   * Role union).
   */
  canAccess: (required: readonly string[] | undefined) => boolean
  /** Returns the gap (which roles would unlock access). */
  missingFor: (required: readonly string[] | undefined) => readonly string[]
  /** Add a role to the current set. Idempotent. Persists in dev stub. */
  grant: (role: Role) => void
  /** Remove a role. Idempotent. */
  revoke: (role: Role) => void
  /** Replace the role set wholesale. */
  setRoles: (roles: readonly Role[]) => void
  /**
   * True when the dev role switcher should be exposed. Gated by
   * NODE_ENV !== "production" OR the `xo-dev=1` cookie. Lets
   * production users in our hands flip roles to test gating.
   */
  devModeEnabled: boolean
}

const RoleCtx = React.createContext<RoleContextValue | null>(null)

export function useRoles(): RoleContextValue {
  const ctx = React.useContext(RoleCtx)
  if (!ctx) throw new Error("useRoles must be used inside <RoleProvider>")
  return ctx
}

// ---------------------------------------------------------------------------

interface StoredState {
  v: number
  roles: Role[]
}

function readStorage(): StoredState | null {
  if (typeof window === "undefined") return null
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as StoredState
    if (parsed.v !== STORAGE_VERSION) return null
    if (!Array.isArray(parsed.roles)) return null
    return parsed
  } catch {
    return null
  }
}

function writeStorage(roles: readonly Role[]): void {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ v: STORAGE_VERSION, roles }),
    )
  } catch {}
}

function checkDevCookie(): boolean {
  if (typeof document === "undefined") return false
  return document.cookie
    .split(";")
    .map(c => c.trim())
    .some(c => c === `${DEV_COOKIE}=1`)
}

// ---------------------------------------------------------------------------

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [roles, setRolesState] = React.useState<readonly Role[]>([])
  const [devModeEnabled, setDevModeEnabled] = React.useState(false)
  const hydratedRef = React.useRef(false)

  // Hydrate from localStorage + detect dev mode after mount.
  React.useEffect(() => {
    hydratedRef.current = true
    const stored = readStorage()
    if (stored) setRolesState(stored.roles)
    // Dev mode: NODE_ENV !== production OR the explicit cookie.
    const isDev =
      process.env.NODE_ENV !== "production" || checkDevCookie()
    setDevModeEnabled(isDev)
  }, [])

  // Persist on change (only after hydration to avoid stomping stored
  // state with the default empty array on first render).
  React.useEffect(() => {
    if (!hydratedRef.current) return
    writeStorage(roles)
  }, [roles])

  // Cross-tab sync.
  React.useEffect(() => {
    if (typeof window === "undefined") return
    function onStorage(e: StorageEvent) {
      if (e.key !== STORAGE_KEY || !e.newValue) return
      try {
        const next = JSON.parse(e.newValue) as StoredState
        if (next.v !== STORAGE_VERSION) return
        if (Array.isArray(next.roles)) setRolesState(next.roles)
      } catch {}
    }
    window.addEventListener("storage", onStorage)
    return () => window.removeEventListener("storage", onStorage)
  }, [])

  const grant = React.useCallback((role: Role) => {
    setRolesState(prev =>
      prev.includes(role) ? prev : [...prev, role],
    )
  }, [])

  const revoke = React.useCallback((role: Role) => {
    setRolesState(prev => prev.filter(r => r !== role))
  }, [])

  const setRoles = React.useCallback((next: readonly Role[]) => {
    setRolesState(next)
  }, [])

  const canAccess = React.useCallback(
    (required: readonly string[] | undefined) => hasAnyRole(roles, required),
    [roles],
  )

  const missingFor = React.useCallback(
    (required: readonly string[] | undefined) => missingRoles(roles, required),
    [roles],
  )

  const value = React.useMemo<RoleContextValue>(
    () => ({
      roles,
      canAccess,
      missingFor,
      grant,
      revoke,
      setRoles,
      devModeEnabled,
    }),
    [roles, canAccess, missingFor, grant, revoke, setRoles, devModeEnabled],
  )

  return <RoleCtx.Provider value={value}>{children}</RoleCtx.Provider>
}
