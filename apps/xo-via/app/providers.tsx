"use client"

import * as React from "react"
import { PhoneProvider } from "@/context/PhoneContext"
import { GestureProvider } from "@/context/GestureContext"
import { LockProvider } from "@/context/LockContext"
import { ModeProvider } from "@/context/ModeContext"
import { RoleProvider } from "@/context/RoleContext"
import { AgentProvider } from "@/context/AgentContext"
import { DeviceFrame } from "@/components/DeviceFrame"

/**
 * The single client boundary above the OS shell.
 *
 * Provider tree from outermost to innermost:
 *   RoleProvider     who the user is (anonymous / signed-in / etc.)
 *   AgentProvider    shared agent visual state + quip fetcher
 *   ModeProvider     which app set + dock the home screen shows
 *   LockProvider     orthogonal lock state, gates entry to the OS
 *   PhoneProvider    current route + back stack
 *   GestureProvider  panel state + drag motion values
 *   DeviceFrame      renders the phone chrome and the gesture layer
 *
 * Why this order:
 *   - Roles sit outermost: every other system can read role state
 *     when it needs to (e.g. a future role-aware ModeProvider could
 *     surface different default modes per role).
 *   - Agent sits next so any OS surface (WanderingVia on home,
 *     future StatusBar agent indicator, NotificationPanel badges)
 *     can read busy/streaming/error from one source. AgentSurface
 *     on /ask broadcasts; everyone else reads.
 *   - Mode is the next-broadest reframing (see MODES_PLAN.md §4);
 *     it sits outside lock/phone/gesture so the rest can react
 *     when mode changes.
 *   - Lock sits inside Mode but outside the rest so GestureSurface
 *     can read locked state and route the bottom-edge swipe to
 *     unlock when locked, or goHome when unlocked.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <RoleProvider>
      <AgentProvider>
        <ModeProvider>
          <LockProvider>
            <PhoneProvider pageElement={children}>
              <GestureProvider>
                <DeviceFrame />
              </GestureProvider>
            </PhoneProvider>
          </LockProvider>
        </ModeProvider>
      </AgentProvider>
    </RoleProvider>
  )
}
