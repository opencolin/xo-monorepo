"use client"

import * as React from "react"
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react"
import { usePathname, useRouter } from "next/navigation"

/**
 * Phone OS state.
 *
 *   - current: which app is in the foreground ("/" === home screen)
 *   - backStack: in-app navigation history
 *   - pageElement: the React element Next gave us for the current route
 *   - switcherOpen / notificationsOpen / controlCenterOpen: overlay flags
 *
 * Clean-room implementation. Architecture pattern inspired by iOS
 * conceptually; no Apple code or assets are used.
 */

interface PhoneContextValue {
  /** "/" means home screen; any other path is an open app */
  current: string
  /** route element rendered into the foreground app */
  pageElement: ReactNode
  /** in-app navigation back stack */
  backStack: string[]
  /** overlay flags */
  switcherOpen: boolean
  notificationsOpen: boolean
  controlCenterOpen: boolean
  /** decorative status bar data */
  status: { time: string; charge: number; wifi: boolean }
  /** open an app (sets current and pushes location) */
  openApp: (path: string) => void
  /** go back to home screen */
  goHome: () => void
  /** push back stack within the current app */
  pushBack: (path: string) => void
  /** in-app back */
  pop: () => void
  toggleSwitcher: (v?: boolean) => void
  toggleNotifications: (v?: boolean) => void
  toggleControlCenter: (v?: boolean) => void
  closeAllOverlays: () => void
}

const PhoneContext = createContext<PhoneContextValue | null>(null)

export function usePhone(): PhoneContextValue {
  const ctx = useContext(PhoneContext)
  if (!ctx) throw new Error("usePhone must be used inside <PhoneProvider>")
  return ctx
}

// ---------------------------------------------------------------------------

function formatTime(d = new Date()): string {
  let h = d.getHours()
  const m = d.getMinutes()
  h = h % 12 || 12
  return `${h}:${m.toString().padStart(2, "0")}`
}

function normalizePath(p: string | null | undefined): string {
  if (!p) return "/"
  const trimmed = p.replace(/\/$/, "")
  return trimmed || "/"
}

interface ProviderProps {
  pageElement: ReactNode
  children: ReactNode
}

export function PhoneProvider({ pageElement, children }: ProviderProps) {
  const pathname = usePathname()
  const router = useRouter()

  const initialPath = normalizePath(pathname)
  const [current, setCurrent] = useState<string>(initialPath)
  const [backStack, setBackStack] = useState<string[]>([])
  const [switcherOpen, setSwitcherOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [controlCenterOpen, setControlCenterOpen] = useState(false)
  const [time, setTime] = useState<string>(formatTime())
  const lastSyncedPath = useRef<string>(initialPath)

  // Live clock for status bar
  useEffect(() => {
    if (typeof window === "undefined") return
    const t = setInterval(() => setTime(formatTime()), 1000 * 15)
    return () => clearInterval(t)
  }, [])

  // Sync to Next location
  useEffect(() => {
    const path = normalizePath(pathname)
    if (path === lastSyncedPath.current) return
    lastSyncedPath.current = path
    setCurrent(path)
    setSwitcherOpen(false)
    setNotificationsOpen(false)
    setControlCenterOpen(false)
  }, [pathname])

  const openApp = useCallback((path: string) => {
    setCurrent(prev => {
      if (prev !== "/" && prev !== path) {
        setBackStack(bs => [...bs, prev])
      }
      return path
    })
    setSwitcherOpen(false)
  }, [])

  const goHome = useCallback(() => {
    setCurrent("/")
    setBackStack([])
    setSwitcherOpen(false)
  }, [])

  const pushBack = useCallback(
    (path: string) => {
      setBackStack(bs => [...bs, current])
      setCurrent(path)
    },
    [current],
  )

  const pop = useCallback(() => {
    setBackStack(bs => {
      if (bs.length === 0) {
        setCurrent("/")
        return bs
      }
      const next = bs[bs.length - 1]
      setCurrent(next)
      return bs.slice(0, -1)
    })
  }, [])

  const toggleSwitcher = useCallback(
    (v?: boolean) => setSwitcherOpen(prev => v ?? !prev),
    [],
  )
  const toggleNotifications = useCallback(
    (v?: boolean) => setNotificationsOpen(prev => v ?? !prev),
    [],
  )
  const toggleControlCenter = useCallback(
    (v?: boolean) => setControlCenterOpen(prev => v ?? !prev),
    [],
  )
  const closeAllOverlays = useCallback(() => {
    setSwitcherOpen(false)
    setNotificationsOpen(false)
    setControlCenterOpen(false)
  }, [])

  // Keyboard: Esc goes home / closes overlays
  useEffect(() => {
    if (typeof window === "undefined") return
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        if (switcherOpen || notificationsOpen || controlCenterOpen) {
          closeAllOverlays()
        } else if (current !== "/") {
          goHome()
          router.push("/")
        }
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [
    current,
    switcherOpen,
    notificationsOpen,
    controlCenterOpen,
    closeAllOverlays,
    goHome,
    router,
  ])

  const value: PhoneContextValue = useMemo(
    () => ({
      current,
      pageElement,
      backStack,
      switcherOpen,
      notificationsOpen,
      controlCenterOpen,
      status: { time, charge: 0.84, wifi: true },
      openApp,
      goHome,
      pushBack,
      pop,
      toggleSwitcher,
      toggleNotifications,
      toggleControlCenter,
      closeAllOverlays,
    }),
    [
      current,
      pageElement,
      backStack,
      switcherOpen,
      notificationsOpen,
      controlCenterOpen,
      time,
      openApp,
      goHome,
      pushBack,
      pop,
      toggleSwitcher,
      toggleNotifications,
      toggleControlCenter,
      closeAllOverlays,
    ],
  )

  return (
    <PhoneContext.Provider value={value}>{children}</PhoneContext.Provider>
  )
}
