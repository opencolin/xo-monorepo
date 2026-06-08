"use client"

import * as React from "react"
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import { usePathname } from "next/navigation"

/**
 * Lock state, orthogonal to mode / app navigation.
 *
 * See LOCKSCREEN_PLAN.md.
 *
 * Persistence schema (localStorage `xo-lock-v1`):
 *   { v: 1, unlocked, sticky, lastUnlockedAt }
 *
 *   - `sticky` (default true): once unlocked, stay unlocked across
 *     reloads inside the 24h window.
 *   - `lastUnlockedAt`: ms epoch; the sticky window expires after
 *     STICKY_WINDOW_MS so re-engagement on day 2 sees the lockscreen
 *     again.
 *
 * SSR safety: server cannot read localStorage. Initial state is
 * derived from pathname only (deep links auto-unlock). The first
 * client-side effect reads localStorage and may flip locked to false
 * on returning visits; that produces a brief lockscreen flash on
 * sticky returnees, which is acceptable per LOCKSCREEN_PLAN.md §12.
 */

const STORAGE_KEY = "xo-lock-v1"
const STORAGE_VERSION = 1
const STICKY_WINDOW_MS = 24 * 60 * 60 * 1000 // 24h

interface LockContextValue {
  /** True when the lockscreen is showing. */
  locked: boolean
  /** True briefly during the unlock animation. */
  unlocking: boolean
  /** Stay unlocked across reloads inside the sticky window. */
  sticky: boolean
  /** ms epoch of the last unlock; powers the sticky window check. */
  lastUnlockedAt: number
  /** Unlock the device. Idempotent. */
  unlock: () => void
  /** Re-lock the device manually. Idempotent. */
  lock: () => void
  /** Toggle the sticky behavior. */
  setSticky: (next: boolean) => void
  /** Clear localStorage and lock immediately. */
  resetLockState: () => void
}

const LockCtx = createContext<LockContextValue | null>(null)

export function useLock(): LockContextValue {
  const ctx = useContext(LockCtx)
  if (!ctx) throw new Error("useLock must be used inside <LockProvider>")
  return ctx
}

interface StoredState {
  v: number
  unlocked: boolean
  sticky: boolean
  lastUnlockedAt: number
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
    // quota / private-mode failures are silently fine
  }
}

function clearStorage(): void {
  if (typeof window === "undefined") return
  try {
    window.localStorage.removeItem(STORAGE_KEY)
  } catch {}
}

export function LockProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  // SSR-safe initial: deep links auto-unlock; root path defaults to
  // locked so the server-rendered HTML matches what a first-time
  // visitor expects.
  const [locked, setLocked] = useState<boolean>(() => {
    if (pathname && pathname !== "/") return false
    return true
  })
  const [unlocking, setUnlocking] = useState(false)
  const [sticky, setStickyState] = useState(true)
  const [lastUnlockedAt, setLastUnlockedAt] = useState(0)
  const hydratedRef = React.useRef(false)

  // One-time hydration from localStorage. Runs only on the client.
  useEffect(() => {
    const stored = readStorage()
    hydratedRef.current = true
    if (!stored) return
    setStickyState(stored.sticky)
    setLastUnlockedAt(stored.lastUnlockedAt)
    if (
      stored.unlocked &&
      stored.sticky &&
      Date.now() - stored.lastUnlockedAt < STICKY_WINDOW_MS
    ) {
      setLocked(false)
    }
  }, [])

  // Persist state changes. Skip the first render so we don't write
  // the default state before hydration has had a chance to load.
  useEffect(() => {
    if (!hydratedRef.current) return
    writeStorage({
      v: STORAGE_VERSION,
      unlocked: !locked,
      sticky,
      lastUnlockedAt,
    })
  }, [locked, sticky, lastUnlockedAt])

  // Cross-tab sync: if another tab unlocks, this tab unlocks too.
  useEffect(() => {
    if (typeof window === "undefined") return
    function onStorage(e: StorageEvent) {
      if (e.key !== STORAGE_KEY || !e.newValue) return
      try {
        const next = JSON.parse(e.newValue) as StoredState
        if (next.v !== STORAGE_VERSION) return
        setStickyState(next.sticky)
        setLastUnlockedAt(next.lastUnlockedAt)
        setLocked(!next.unlocked)
      } catch {}
    }
    window.addEventListener("storage", onStorage)
    return () => window.removeEventListener("storage", onStorage)
  }, [])

  const unlock = useCallback(() => {
    setLocked(prev => {
      if (!prev) return prev
      setUnlocking(true)
      setLastUnlockedAt(Date.now())
      // Clear the unlocking flag after the slow exit animation
      // settles. Match the longest exit duration in LockScreen
      // (850 ms tween + small buffer).
      setTimeout(() => setUnlocking(false), 900)
      return false
    })
  }, [])

  const lock = useCallback(() => {
    setLocked(true)
    setUnlocking(false)
  }, [])

  const setSticky = useCallback((next: boolean) => {
    setStickyState(next)
  }, [])

  const resetLockState = useCallback(() => {
    clearStorage()
    setStickyState(true)
    setLastUnlockedAt(0)
    setLocked(true)
    setUnlocking(false)
  }, [])

  const value = useMemo<LockContextValue>(
    () => ({
      locked,
      unlocking,
      sticky,
      lastUnlockedAt,
      unlock,
      lock,
      setSticky,
      resetLockState,
    }),
    [locked, unlocking, sticky, lastUnlockedAt, unlock, lock, setSticky, resetLockState],
  )

  return <LockCtx.Provider value={value}>{children}</LockCtx.Provider>
}
