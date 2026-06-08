"use client"

import * as React from "react"
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react"
import { useMotionValue, type MotionValue } from "framer-motion"

/**
 * Gesture provider state.
 *
 * Holds:
 *   - which panel (if any) is currently open
 *   - shared MotionValues that the GestureSurface writes during a
 *     drag and that each panel subscribes to for live position
 *   - PTR status for the currently-pulling app
 *
 * Actions are intent-level ("open notifications") rather than
 * pointer-level. The GestureSurface is the only consumer that drives
 * the MotionValues directly.
 *
 * See GESTURE_PLAN.md §4 (architecture) and §8 (state additions).
 */

export type OpenPanel = "notifications" | "control" | "spotlight" | null

export type PtrStatus = "idle" | "pulling" | "refreshing"

interface GestureContextValue {
  /** Settled panel state. Null when nothing is open. */
  openPanel: OpenPanel
  /** Open intents. Animate the panel's MotionValue to 1 and set state. */
  openNotifications: () => void
  openControl: () => void
  openSpotlight: () => void
  /** Close any open panel (and zero its MotionValue via subscriber). */
  closeAll: () => void

  /**
   * Live drag offsets, 0 (closed) to 1 (fully open). Subscribed by
   * each panel component; written by GestureSurface during TRACKING
   * and animated by intent actions.
   */
  notifT: MotionValue<number>
  controlT: MotionValue<number>
  spotlightT: MotionValue<number>

  /** PTR distance in px (0 = idle). Written by PullToRefresh wrapper. */
  ptrPx: MotionValue<number>
  /** PTR lifecycle status, exposed for spinner + scroll-lock decisions. */
  ptrStatus: PtrStatus
  setPtrStatus: (s: PtrStatus) => void

  /**
   * Lockout flag. GestureSurface checks this before claiming a new
   * gesture; PhoneContext route transitions set it briefly to avoid
   * gestures fighting an in-flight layoutId morph.
   */
  gestureLocked: boolean
  lockGestures: (ms: number) => void
}

const GestureCtx = createContext<GestureContextValue | null>(null)

export function useGestures(): GestureContextValue {
  const ctx = useContext(GestureCtx)
  if (!ctx) throw new Error("useGestures must be used inside <GestureProvider>")
  return ctx
}

export function GestureProvider({ children }: { children: ReactNode }) {
  const [openPanel, setOpenPanel] = useState<OpenPanel>(null)
  const [ptrStatus, setPtrStatus] = useState<PtrStatus>("idle")
  const [gestureLocked, setGestureLocked] = useState(false)
  const lockTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const notifT = useMotionValue(0)
  const controlT = useMotionValue(0)
  const spotlightT = useMotionValue(0)
  const ptrPx = useMotionValue(0)

  const openNotifications = useCallback(() => setOpenPanel("notifications"), [])
  const openControl = useCallback(() => setOpenPanel("control"), [])
  const openSpotlight = useCallback(() => setOpenPanel("spotlight"), [])
  const closeAll = useCallback(() => setOpenPanel(null), [])

  const lockGestures = useCallback((ms: number) => {
    setGestureLocked(true)
    if (lockTimeoutRef.current) clearTimeout(lockTimeoutRef.current)
    lockTimeoutRef.current = setTimeout(() => setGestureLocked(false), ms)
  }, [])

  const value = useMemo<GestureContextValue>(
    () => ({
      openPanel,
      openNotifications,
      openControl,
      openSpotlight,
      closeAll,
      notifT,
      controlT,
      spotlightT,
      ptrPx,
      ptrStatus,
      setPtrStatus,
      gestureLocked,
      lockGestures,
    }),
    [
      openPanel,
      openNotifications,
      openControl,
      openSpotlight,
      closeAll,
      notifT,
      controlT,
      spotlightT,
      ptrPx,
      ptrStatus,
      gestureLocked,
      lockGestures,
    ],
  )

  return <GestureCtx.Provider value={value}>{children}</GestureCtx.Provider>
}
