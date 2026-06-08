"use client"

import * as React from "react"
import { modeRegistry, DEFAULT_MODE_ID } from "@/data/modes"
import { findApp } from "@/data/apps"
import type { ModeId, ResolvedMode } from "@/lib/xo-mode"
import type { ResolvedXOApp } from "@/lib/xo-app"

/**
 * Mode state. Orthogonal to lock, character, route.
 *
 * Per MODES_PLAN.md §4: ModeProvider sits outside everything else.
 * The provider reads the registry via `useSyncExternalStore` so any
 * runtime mode registration (plugins, A/B tests) re-renders the
 * shell automatically.
 *
 * `setMode` is the sole intent surface. The provider:
 *   1. Validates the target mode exists in the registry
 *   2. Flips `transitioning` true (drives the ~600ms cross-dissolve
 *      in HomeScreen + Dock)
 *   3. Updates `currentMode` immediately (optimistic UI)
 *   4. Persists to localStorage
 *   5. Clears `transitioning` after the animation settles
 *
 * SSR: server renders DEFAULT_MODE_ID (landing). First client effect
 * reads URL `?mode=foo` and localStorage; if either resolves to a
 * different mode, we switch instantly (no animation, since the user
 * didn't actually do anything).
 */

const STORAGE_KEY = "xo-mode-v1"
// v2: DEFAULT_MODE_ID changed from "landing" → "default" mid-flight.
// v3 (Section C, v.Next): the mode set is now landing + agent + public.
// `default` no longer exists; bumping invalidates any v2 store that
// still held "default" so users land on the v.Next-default mode
// (Landing) instead of getting stuck on an unregistered id.
const STORAGE_VERSION = 3
const TRANSITION_DURATION_MS = 600

interface ModeContextValue {
  /** Settled current mode id. */
  currentMode: ModeId
  /** ResolvedMode object for currentMode. */
  mode: ResolvedMode
  /** All registered modes, sorted by precedence. */
  modes: readonly ResolvedMode[]
  /** Apps visible in the current mode, after app-side opt-out. */
  modeApps: readonly ResolvedXOApp[]
  /** Dock apps for the current mode (max 4). */
  modeDock: readonly ResolvedXOApp[]
  /** True while a transition cross-dissolve is in flight. */
  transitioning: boolean
  /**
   * Change mode. Default animates; `opts.instant` skips the
   * animation (used by URL override, cross-tab sync).
   */
  setMode: (id: ModeId, opts?: { instant?: boolean }) => void
  /** Clear persisted mode and reset to DEFAULT_MODE_ID. */
  resetModeState: () => void
}

const ModeCtx = React.createContext<ModeContextValue | null>(null)

export function useMode(): ModeContextValue {
  const ctx = React.useContext(ModeCtx)
  if (!ctx) throw new Error("useMode must be used inside <ModeProvider>")
  return ctx
}

interface StoredState {
  v: number
  currentMode: ModeId
  lastChangedAt: number
}

function readStorage(): StoredState | null {
  if (typeof window === "undefined") return null
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as StoredState
    if (parsed.v !== STORAGE_VERSION) return null
    return parsed
  } catch {
    return null
  }
}

function writeStorage(state: StoredState): void {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // Quota / private-mode failures: persistence is best-effort.
  }
}

function clearStorage(): void {
  if (typeof window === "undefined") return
  try {
    window.localStorage.removeItem(STORAGE_KEY)
  } catch {}
}

function resolveUrlMode(): ModeId | null {
  if (typeof window === "undefined") return null
  try {
    const params = new URLSearchParams(window.location.search)
    const id = params.get("mode")
    if (id && modeRegistry.has(id)) return id
  } catch {}
  return null
}

export function ModeProvider({ children }: { children: React.ReactNode }) {
  // Subscribe to the mode registry so runtime registrations re-render.
  const modes = React.useSyncExternalStore(
    modeRegistry.subscribe,
    () => modeRegistry.list(),
    // Server snapshot: registry is populated synchronously on import,
    // so server and client see the same list at first render.
    () => modeRegistry.list(),
  )

  const [currentMode, setCurrentMode] = React.useState<ModeId>(DEFAULT_MODE_ID)
  const [transitioning, setTransitioning] = React.useState(false)
  const transitionTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  // Hydration: read URL override + localStorage; if they resolve to
  // something other than the SSR-default, switch instantly. URL wins
  // over localStorage (per §3 resolution precedence).
  React.useEffect(() => {
    const urlMode = resolveUrlMode()
    if (urlMode) {
      if (urlMode !== currentMode) setCurrentMode(urlMode)
      return
    }
    const stored = readStorage()
    if (stored && modeRegistry.has(stored.currentMode) && stored.currentMode !== currentMode) {
      setCurrentMode(stored.currentMode)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Persist currentMode on change.
  React.useEffect(() => {
    writeStorage({
      v: STORAGE_VERSION,
      currentMode,
      lastChangedAt: Date.now(),
    })
  }, [currentMode])

  // Cross-tab sync: if another tab changes the mode, follow.
  React.useEffect(() => {
    if (typeof window === "undefined") return
    function onStorage(e: StorageEvent) {
      if (e.key !== STORAGE_KEY || !e.newValue) return
      try {
        const next = JSON.parse(e.newValue) as StoredState
        if (next.v !== STORAGE_VERSION) return
        if (modeRegistry.has(next.currentMode) && next.currentMode !== currentMode) {
          // Cross-tab updates are instant, not animated.
          setCurrentMode(next.currentMode)
        }
      } catch {}
    }
    window.addEventListener("storage", onStorage)
    return () => window.removeEventListener("storage", onStorage)
  }, [currentMode])

  const setMode = React.useCallback(
    (id: ModeId, opts?: { instant?: boolean }) => {
      if (!modeRegistry.has(id)) return
      if (id === currentMode) return
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current)
        transitionTimeoutRef.current = null
      }
      if (opts?.instant) {
        setCurrentMode(id)
        setTransitioning(false)
        return
      }
      setTransitioning(true)
      setCurrentMode(id)
      transitionTimeoutRef.current = setTimeout(() => {
        setTransitioning(false)
        transitionTimeoutRef.current = null
      }, TRANSITION_DURATION_MS)
    },
    [currentMode],
  )

  const resetModeState = React.useCallback(() => {
    clearStorage()
    setMode(DEFAULT_MODE_ID, { instant: true })
  }, [setMode])

  // Resolve the active mode object. Falls back to DEFAULT_MODE_ID if
  // somehow currentMode is no longer registered (e.g. a plugin
  // unregistered the active mode).
  const mode = React.useMemo(() => {
    return (
      modeRegistry.get(currentMode) ??
      modeRegistry.get(DEFAULT_MODE_ID) ??
      modes[0]
    )
  }, [currentMode, modes])

  // Mode-filtered app list. Mode-side declares paths; app-side may
  // opt out via `availableIn`.
  const modeApps = React.useMemo<readonly ResolvedXOApp[]>(() => {
    return mode.appPaths
      .map(path => findApp(path))
      .filter((a): a is ResolvedXOApp => a !== undefined)
      .filter(
        a =>
          !a.availableIn ||
          a.availableIn.length === 0 ||
          a.availableIn.includes(mode.id),
      )
  }, [mode])

  // Dock list (max 4 per §6).
  const modeDock = React.useMemo<readonly ResolvedXOApp[]>(() => {
    return mode.dockPaths
      .map(path => findApp(path))
      .filter((a): a is ResolvedXOApp => a !== undefined)
      .filter(
        a =>
          !a.availableIn ||
          a.availableIn.length === 0 ||
          a.availableIn.includes(mode.id),
      )
  }, [mode])

  const value = React.useMemo<ModeContextValue>(
    () => ({
      currentMode,
      mode,
      modes,
      modeApps,
      modeDock,
      transitioning,
      setMode,
      resetModeState,
    }),
    [currentMode, mode, modes, modeApps, modeDock, transitioning, setMode, resetModeState],
  )

  return <ModeCtx.Provider value={value}>{children}</ModeCtx.Provider>
}
