"use client"

import * as React from "react"
import { motion, animate, useMotionValue, useTransform } from "framer-motion"
import { useRouter } from "next/navigation"
import {
  OFF_AXIS_CANCEL_PX,
  PANEL_SPRING,
  PTR_COMMIT_PX,
  PTR_REFRESHING_PX,
} from "@/lib/gestures/constants"
import type { PullToRefreshSpec, XOApp } from "@/lib/xo-app"

/**
 * Scroll container wrapper that adds pull-to-refresh. Consumed by
 * XOAppShell when the app declares `gesture.pullToRefresh`.
 *
 * Behavior:
 *   - pointerdown at scrollTop === 0
 *   - while dragging down, content translates 1:1 with finger and a
 *     spinner reveals at the top
 *   - release past PTR_COMMIT_PX → spinner settles, intent runs,
 *     then everything snaps back
 *   - release before threshold → springs back, no refresh
 *
 * Off-axis movement greater than OFF_AXIS_CANCEL_PX cancels.
 */
export function PullToRefresh({
  spec,
  appKind,
  children,
}: {
  spec: PullToRefreshSpec
  appKind: XOApp["kind"]
  children: React.ReactNode
}) {
  const router = useRouter()
  const scrollRef = React.useRef<HTMLDivElement>(null)
  const pullPx = useMotionValue(0)
  const [status, setStatus] = React.useState<"idle" | "pulling" | "refreshing">(
    "idle",
  )
  const stateRef = React.useRef<{
    tracking: boolean
    startY: number
    startX: number
    pointerId: number | null
  }>({ tracking: false, startY: 0, startX: 0, pointerId: null })

  const intent = resolveIntent(spec, appKind)

  // Run the refresh intent. Returns a promise so the spinner can wait.
  const runIntent = React.useCallback(async () => {
    if (intent === "refresh-route") {
      router.refresh()
      // Give Next a moment to start re-rendering; visual feedback only.
      await new Promise(r => setTimeout(r, 350))
      return
    }
    if (intent === "reload-iframe") {
      // Find the first iframe inside the scroll container and reset src.
      const iframe = scrollRef.current?.querySelector("iframe") as
        | HTMLIFrameElement
        | null
      if (iframe?.src) {
        const src = iframe.src
        iframe.src = ""
        await new Promise(r => setTimeout(r, 50))
        iframe.src = src
      }
      await new Promise(r => setTimeout(r, 350))
      return
    }
    if (intent === "refetch-api") {
      // v1 placeholder: same as refresh-route. API apps are not yet
      // a thing in this repo; when they land, swap this to call the
      // app's data layer.
      router.refresh()
      await new Promise(r => setTimeout(r, 350))
      return
    }
    if (intent === "custom") {
      // Custom handlers are looked up by name. v1 has none registered.
      // eslint-disable-next-line no-console
      console.warn(
        `[PullToRefresh] custom intent "${spec.onTrigger}" has no handler`,
      )
      await new Promise(r => setTimeout(r, 200))
    }
  }, [intent, router, spec.onTrigger])

  React.useEffect(() => {
    const el = scrollRef.current
    if (!el) return

    function onPointerDown(e: PointerEvent) {
      if (status !== "idle") return
      if (e.pointerType === "mouse" && e.button !== 0) return
      if (el!.scrollTop > 0) return
      stateRef.current.tracking = false
      stateRef.current.startY = e.clientY
      stateRef.current.startX = e.clientX
      stateRef.current.pointerId = e.pointerId
    }

    function onPointerMove(e: PointerEvent) {
      const s = stateRef.current
      if (s.pointerId !== e.pointerId) return
      const dy = e.clientY - s.startY
      const dx = e.clientX - s.startX

      // If the user starts scrolling normally (because new content
      // arrived) or moves horizontally, release.
      if (!s.tracking) {
        if (Math.abs(dx) > OFF_AXIS_CANCEL_PX) {
          s.pointerId = null
          return
        }
        if (dy <= 0) return
        if (el!.scrollTop > 0) {
          s.pointerId = null
          return
        }
        // Cross recognition: start tracking.
        s.tracking = true
        try {
          el!.setPointerCapture(e.pointerId)
        } catch {}
        setStatus("pulling")
      }

      // Resist: pull distance grows slower than finger movement past
      // the threshold, giving the rubber-band feel.
      const damped = dy < PTR_COMMIT_PX ? dy : PTR_COMMIT_PX + (dy - PTR_COMMIT_PX) * 0.4
      pullPx.set(Math.max(0, damped))
    }

    function onPointerUp(e: PointerEvent) {
      const s = stateRef.current
      if (s.pointerId !== e.pointerId) return
      try {
        el!.releasePointerCapture(e.pointerId)
      } catch {}
      s.pointerId = null
      if (!s.tracking) return
      s.tracking = false

      const currentPull = pullPx.get()
      if (currentPull >= PTR_COMMIT_PX) {
        // Commit: settle the spinner, run intent, then snap back.
        setStatus("refreshing")
        animate(pullPx, PTR_REFRESHING_PX, PANEL_SPRING)
        runIntent().then(() => {
          animate(pullPx, 0, PANEL_SPRING)
          setStatus("idle")
        })
      } else {
        // No commit: spring back, no refresh.
        animate(pullPx, 0, PANEL_SPRING)
        setStatus("idle")
      }
    }

    function onPointerCancel(e: PointerEvent) {
      const s = stateRef.current
      if (s.pointerId !== e.pointerId) return
      s.pointerId = null
      s.tracking = false
      animate(pullPx, 0, PANEL_SPRING)
      setStatus("idle")
    }

    el.addEventListener("pointerdown", onPointerDown)
    el.addEventListener("pointermove", onPointerMove)
    el.addEventListener("pointerup", onPointerUp)
    el.addEventListener("pointercancel", onPointerCancel)

    return () => {
      el.removeEventListener("pointerdown", onPointerDown)
      el.removeEventListener("pointermove", onPointerMove)
      el.removeEventListener("pointerup", onPointerUp)
      el.removeEventListener("pointercancel", onPointerCancel)
    }
  }, [status, pullPx, runIntent])

  // Spinner reveal: opacity ramps with pull, rotation continues while
  // refreshing.
  const spinnerOpacity = useTransform(pullPx, [0, 40, PTR_COMMIT_PX], [0, 0.5, 1])

  return (
    <div
      ref={scrollRef}
      className="flex-1 overflow-y-auto bg-phone-card text-white relative"
      style={{ overscrollBehavior: "contain", touchAction: "pan-y" }}
    >
      <motion.div
        aria-hidden
        className="absolute inset-x-0 top-0 flex items-center justify-center pointer-events-none"
        style={{ opacity: spinnerOpacity, height: pullPx }}
      >
        <Spinner spinning={status === "refreshing"} />
      </motion.div>
      <motion.div style={{ y: pullPx }}>{children}</motion.div>
    </div>
  )
}

function Spinner({ spinning }: { spinning: boolean }) {
  return (
    <motion.span
      className="block w-5 h-5 rounded-full border-2 border-white/30 border-t-white"
      animate={spinning ? { rotate: 360 } : { rotate: 0 }}
      transition={
        spinning
          ? { repeat: Infinity, duration: 0.8, ease: "linear" }
          : { duration: 0 }
      }
    />
  )
}

function resolveIntent(
  spec: PullToRefreshSpec,
  kind: XOApp["kind"],
): NonNullable<PullToRefreshSpec["intent"]> {
  if (spec.intent) return spec.intent
  switch (kind) {
    case "iframe":
      return "reload-iframe"
    case "api":
      return "refetch-api"
    case "native":
    case "mdx":
    default:
      return "refresh-route"
  }
}
