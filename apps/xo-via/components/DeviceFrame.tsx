"use client"

import * as React from "react"
import { AnimatePresence } from "framer-motion"
import { StatusBar } from "./StatusBar"
import { Pager } from "./Pager"
import { AppView } from "./AppView"
import { HomeIndicator } from "./HomeIndicator"
import { LockScreen } from "./LockScreen"
import { GestureSurface } from "./gestures/GestureSurface"
import { NotificationPanel } from "./gestures/NotificationPanel"
import { ControlCenterPanel } from "./gestures/ControlCenterPanel"
import { SpotlightPanel } from "./gestures/SpotlightPanel"
import { usePhone } from "@/context/PhoneContext"
import { useLock } from "@/context/LockContext"
import { findApp } from "@/data/apps"

/**
 * The iPhone-style device chrome.
 *
 * On viewports >= 600px, renders a phone-shaped frame centered on a
 * dark XO backdrop. On phones (< 600px), CSS makes the frame full bleed
 * so the OS fills the viewport (see global.css media query).
 *
 * Lock state (from LockProvider) gates the screen content:
 *   - locked: LockScreen renders, panels + home indicator hidden
 *   - unlocked: HomeScreen / AppView with all gesture panels mounted
 *
 * The right-side cosmetic button is now a real button that locks the
 * device when tapped while unlocked (the iPhone "side button" / power
 * key analog).
 */
export function DeviceFrame() {
  const { current } = usePhone()
  const { locked, lock } = useLock()
  const app = findApp(current)
  const isHome = current === "/"

  return (
    <div className="phone-backdrop fixed inset-0 flex items-center justify-center p-4 sm:p-6 lg:p-10">
      {/* Decorative XO mark behind the phone (desktop only). */}
      <DesktopWatermark />

      <div
        className="device-frame relative bg-phone-bezel shadow-device rounded-device border-[3px] border-phone-metal"
        style={{
          width: "min(393px, 92vw)",
          height: "min(852px, 90dvh)",
          padding: 6,
        }}
      >
        {/* Left side: action button + volume up / down (cosmetic). */}
        <span className="device-side-button absolute left-[-5px] top-[120px] w-[3px] h-10 bg-phone-metal rounded-l" />
        <span className="device-side-button absolute left-[-5px] top-[180px] w-[3px] h-16 bg-phone-metal rounded-l" />
        <span className="device-side-button absolute left-[-5px] top-[260px] w-[3px] h-16 bg-phone-metal rounded-l" />

        {/* Right side: lock / power button. Real, tappable. Locks when
            the device is unlocked; no-op when already locked (same as
            iOS: side-button press wakes the device, lockscreen is
            already shown). */}
        <button
          type="button"
          onClick={() => {
            if (!locked) lock()
          }}
          aria-label={locked ? "Device locked" : "Lock device"}
          aria-pressed={locked}
          className="device-side-button absolute right-[-6px] top-[200px] w-[4px] h-24 bg-phone-metal rounded-r hover:bg-phone-metal/80 active:translate-x-[1px] transition-transform"
        />

        {/* The actual phone screen */}
        <div className="phone-screen relative w-full h-full overflow-hidden rounded-screen bg-phone-screen flex flex-col">
          {/* Dynamic Island */}
          <div className="device-dynamic-island-cosmetic absolute top-2 left-1/2 -translate-x-1/2 z-50 w-28 h-7 rounded-full bg-black pointer-events-none" />

          <StatusBar />

          <main className="relative flex-1 overflow-hidden">
            {isHome ? (
              <Pager />
            ) : app ? (
              <AppView app={app} />
            ) : (
              <Pager />
            )}
          </main>

          {/* Home indicator hidden while locked; lockscreen has its
              own pill. */}
          {!locked && <HomeIndicator />}

          {/* Gesture layer always mounted: when locked, the surface
              routes the bottom-edge swipe to unlock; when unlocked,
              it drives the normal home + panel gestures. */}
          <GestureSurface />

          {/* Panels suppressed while locked. */}
          {!locked && (
            <>
              <NotificationPanel />
              <ControlCenterPanel />
              {isHome && <SpotlightPanel />}
            </>
          )}

          {/* Lockscreen overlay. AnimatePresence drives the slide-up
              exit when unlocking. `initial={false}` skips the
              entrance animation on first page load (lockscreen is
              already there), but re-locks via side button or
              Settings DO animate in (slide down from above) because
              the child is being mounted fresh after a prior exit. */}
          <AnimatePresence initial={false}>
            {locked && <LockScreen />}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

function DesktopWatermark() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 hidden lg:flex items-center justify-center opacity-[0.05]"
    >
      <svg width="600" height="600" viewBox="0 0 100 100">
        <path d="M20 20 L40 50 L20 80" stroke="white" strokeWidth="10" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M40 20 L60 50 L40 80" stroke="#83d63a" strokeWidth="8" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M60 20 L80 50 L60 80" stroke="white" strokeWidth="10" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M80 20 L100 50 L80 80" stroke="#83d63a" strokeWidth="8" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
  )
}
