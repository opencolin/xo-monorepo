"use client"

import * as React from "react"
import { animate, type MotionValue } from "framer-motion"
import { useRouter } from "next/navigation"
import { useGestures } from "@/context/GestureContext"
import { useLock } from "@/context/LockContext"
import { usePhone } from "@/context/PhoneContext"
import {
  COMMIT_DISTANCE_RATIO,
  OFF_AXIS_CANCEL_PX,
  PANEL_SPRING,
  RECOGNITION_PX,
} from "@/lib/gestures/constants"
import { isVerticalDrag, zoneFor, type ZoneKind } from "@/lib/gestures/zones"

/**
 * Pointer-event orchestrator for v1 gestures.
 *
 * Attaches capture-phase pointer listeners to the `.phone-screen`
 * ancestor. On pointerdown:
 *   - if a panel is already open, route the touch to the scrim
 *     (handled by the panel itself; we do nothing here)
 *   - if the touch lands in a reserved edge zone (top-left, top-right,
 *     bottom), claim immediately and prevent default
 *   - if the touch lands in the Spotlight zone on the home route,
 *     watch for vertical movement past RECOGNITION_PX before claiming
 *     (so plain icon taps still work)
 *
 * Once tracking, the surface writes the panel's MotionValue from 0
 * (closed) to 1 (open) based on drag distance. On release, commit or
 * spring back.
 *
 * Renders nothing; pure side-effect component.
 */
export function GestureSurface() {
  const phone = usePhone()
  const gestures = useGestures()
  const lock = useLock()
  const router = useRouter()

  // Stash latest refs in a mutable object so the long-lived
  // useEffect does not re-bind listeners on every state change.
  const ctxRef = React.useRef({ phone, gestures, lock, router })
  ctxRef.current = { phone, gestures, lock, router }

  React.useEffect(() => {
    if (typeof window === "undefined") return

    const screen = document.querySelector(".phone-screen") as HTMLElement | null
    if (!screen) return

    type Tracking = {
      gesture: "home" | "notifications" | "control" | "spotlight"
      startX: number
      startY: number
      pointerId: number
      // Travel distance the gesture fully covers from closed (0) to
      // open (1). For top panels this is panel height; for the home
      // gesture, ~40% of screen height feels right.
      travelPx: number
      mv: MotionValue<number> | null   // null for "home" (just navigation)
      // Direction sign: panels open by dragging DOWN (+1); the home
      // gesture commits by dragging UP (-1).
      sign: 1 | -1
    }

    let pending: {
      zone: Exclude<ZoneKind, "none">
      startX: number
      startY: number
      pointerId: number
      // Whether we have claimed (called setPointerCapture + preventDefault).
      claimed: boolean
    } | null = null

    let tracking: Tracking | null = null

    function rect(): DOMRect {
      return screen!.getBoundingClientRect()
    }

    function isHome(): boolean {
      return ctxRef.current.phone.current === "/"
    }

    function startTracking(zone: Exclude<ZoneKind, "none">, e: PointerEvent) {
      const r = rect()
      let next: Tracking
      switch (zone) {
        case "top-left":
          next = {
            gesture: "notifications",
            startX: e.clientX,
            startY: e.clientY,
            pointerId: e.pointerId,
            travelPx: r.height * 0.8,
            mv: ctxRef.current.gestures.notifT,
            sign: 1,
          }
          break
        case "top-right":
          next = {
            gesture: "control",
            startX: e.clientX,
            startY: e.clientY,
            pointerId: e.pointerId,
            travelPx: r.height * 0.8,
            mv: ctxRef.current.gestures.controlT,
            sign: 1,
          }
          break
        case "spotlight":
          next = {
            gesture: "spotlight",
            startX: e.clientX,
            startY: e.clientY,
            pointerId: e.pointerId,
            travelPx: r.height * 0.7,
            mv: ctxRef.current.gestures.spotlightT,
            sign: 1,
          }
          break
        case "bottom":
          next = {
            gesture: "home",
            startX: e.clientX,
            startY: e.clientY,
            pointerId: e.pointerId,
            travelPx: r.height * 0.4,
            mv: null,
            sign: -1,
          }
          break
      }
      tracking = next
      try {
        screen!.setPointerCapture(e.pointerId)
      } catch {}
    }

    function onPointerDown(e: PointerEvent) {
      // Ignore non-primary pointers (no multi-touch in v1).
      if (e.isPrimary === false) return
      // Block while a panel is open; the panel's scrim handles taps.
      if (ctxRef.current.gestures.openPanel !== null) return
      // Block during route morphs.
      if (ctxRef.current.gestures.gestureLocked) return
      // Block while PTR is refreshing.
      if (ctxRef.current.gestures.ptrStatus === "refreshing") return

      const zone = zoneFor(e.clientX, e.clientY, rect(), isHome())
      if (zone === "none") return

      // Locked: only the bottom-edge zone is active, and it maps to
      // unlock instead of home. Suppress every other zone so panels
      // cannot be summoned from the lockscreen.
      if (ctxRef.current.lock.locked) {
        if (zone !== "bottom") return
        pending = {
          zone,
          startX: e.clientX,
          startY: e.clientY,
          pointerId: e.pointerId,
          claimed: true,
        }
        e.preventDefault()
        e.stopPropagation()
        startTracking(zone, e)
        return
      }

      // Edge zones claim immediately so the page does not also
      // process the touch as a scroll or button tap.
      if (zone === "top-left" || zone === "top-right" || zone === "bottom") {
        pending = {
          zone,
          startX: e.clientX,
          startY: e.clientY,
          pointerId: e.pointerId,
          claimed: true,
        }
        e.preventDefault()
        e.stopPropagation()
        startTracking(zone, e)
        return
      }

      // Spotlight: wait for movement before claiming so icon taps
      // still propagate to AppIcon's button.
      pending = {
        zone,
        startX: e.clientX,
        startY: e.clientY,
        pointerId: e.pointerId,
        claimed: false,
      }
    }

    function onPointerMove(e: PointerEvent) {
      // If we have a pending Spotlight that has not claimed yet,
      // watch for vertical movement to commit recognition.
      if (pending && !pending.claimed && pending.pointerId === e.pointerId) {
        const dy = e.clientY - pending.startY
        const dx = e.clientX - pending.startX
        if (Math.abs(dx) > OFF_AXIS_CANCEL_PX) {
          pending = null
          return
        }
        if (dy > RECOGNITION_PX && isVerticalDrag(dx, dy)) {
          pending.claimed = true
          e.preventDefault()
          e.stopPropagation()
          startTracking(pending.zone, e)
        } else if (dy < -RECOGNITION_PX) {
          // Drag up in spotlight zone → not a Spotlight; release.
          pending = null
        }
        return
      }

      if (!tracking || tracking.pointerId !== e.pointerId) return

      const r = rect()
      const dy = e.clientY - tracking.startY
      const dx = e.clientX - tracking.startX

      // Off-axis cancel: page deserves the gesture, not us.
      if (Math.abs(dx) > OFF_AXIS_CANCEL_PX && Math.abs(dx) > Math.abs(dy)) {
        cancelTracking()
        return
      }

      // Signed progress: +dy for top panels, -dy for the bottom home gesture.
      const signedDistance = tracking.sign * dy
      const progress = Math.min(1, Math.max(0, signedDistance / tracking.travelPx))

      if (tracking.mv) {
        tracking.mv.set(progress)
      } else {
        // home gesture: no panel motion, just track for commit decision
      }
      e.preventDefault()
    }

    function onPointerUp(e: PointerEvent) {
      // Spotlight that never claimed: nothing to do; let the icon
      // handle the click normally.
      if (pending && !pending.claimed && pending.pointerId === e.pointerId) {
        pending = null
        return
      }
      if (!tracking || tracking.pointerId !== e.pointerId) return

      try {
        screen!.releasePointerCapture(e.pointerId)
      } catch {}

      const dy = e.clientY - tracking.startY
      const signedDistance = tracking.sign * dy
      const progress = signedDistance / tracking.travelPx

      const commit = progress >= COMMIT_DISTANCE_RATIO

      if (tracking.gesture === "home") {
        if (commit) {
          ctxRef.current.gestures.lockGestures(280)
          if (ctxRef.current.lock.locked) {
            // Locked: bottom-edge swipe is the unlock gesture.
            ctxRef.current.lock.unlock()
          } else {
            // Unlocked: bottom-edge swipe goes home through Next
            // router so RSC payload + PhoneContext stay in sync.
            ctxRef.current.phone.goHome()
            if (window.location.pathname !== "/") {
              ctxRef.current.router.push("/")
            }
          }
        }
        tracking = null
        pending = null
        return
      }

      const mv = tracking.mv
      if (!mv) {
        tracking = null
        pending = null
        return
      }

      if (commit) {
        animate(mv, 1, PANEL_SPRING)
        switch (tracking.gesture) {
          case "notifications":
            ctxRef.current.gestures.openNotifications()
            break
          case "control":
            ctxRef.current.gestures.openControl()
            break
          case "spotlight":
            ctxRef.current.gestures.openSpotlight()
            break
        }
      } else {
        animate(mv, 0, PANEL_SPRING)
      }

      tracking = null
      pending = null
    }

    function cancelTracking() {
      if (tracking?.mv) {
        animate(tracking.mv, 0, PANEL_SPRING)
      }
      tracking = null
      pending = null
    }

    function onPointerCancel(e: PointerEvent) {
      if (pending?.pointerId === e.pointerId) pending = null
      if (tracking?.pointerId === e.pointerId) cancelTracking()
    }

    // Capture phase so we see events before icons / buttons can
    // claim them. We only call stopPropagation when we actually
    // claim a gesture.
    screen.addEventListener("pointerdown", onPointerDown, true)
    screen.addEventListener("pointermove", onPointerMove, true)
    screen.addEventListener("pointerup", onPointerUp, true)
    screen.addEventListener("pointercancel", onPointerCancel, true)

    return () => {
      screen.removeEventListener("pointerdown", onPointerDown, true)
      screen.removeEventListener("pointermove", onPointerMove, true)
      screen.removeEventListener("pointerup", onPointerUp, true)
      screen.removeEventListener("pointercancel", onPointerCancel, true)
    }
  }, [])

  // Sync panel MotionValues when state.openPanel changes externally
  // (e.g. closing via scrim tap).
  const { openPanel, notifT, controlT, spotlightT } = gestures
  React.useEffect(() => {
    if (openPanel === null) {
      if (notifT.get() > 0) animate(notifT, 0, PANEL_SPRING)
      if (controlT.get() > 0) animate(controlT, 0, PANEL_SPRING)
      if (spotlightT.get() > 0) animate(spotlightT, 0, PANEL_SPRING)
    }
    if (openPanel === "notifications") animate(notifT, 1, PANEL_SPRING)
    if (openPanel === "control") animate(controlT, 1, PANEL_SPRING)
    if (openPanel === "spotlight") animate(spotlightT, 1, PANEL_SPRING)
  }, [openPanel, notifT, controlT, spotlightT])

  return null
}
