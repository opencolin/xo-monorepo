"use client"

import * as React from "react"

/**
 * Shared agent visual state. Lives one layer above the OS shell so
 * any surface (WanderingVia on home, future StatusBar indicator,
 * NotificationPanel badges, etc.) can read the same source of truth
 * for what the agent is doing right now.
 *
 * Section A: the v0 Anthropic-SDK backend is gone. This context now
 * exposes ONLY the visual state; the previous `requestQuip` helper
 * (which posted to /api/agent/quip) is removed because that route was
 * deleted with the rest of the agent backend. Consumers fall back to
 * their local quote pools until Section D / E land.
 *
 * Section D will re-add a writer (the new ChatExpanded) that updates
 * busy/streaming/error as the dock-button chat session progresses.
 */

export interface AgentVisualState {
  /** A turn is in flight (request sent, no done yet). */
  busy: boolean
  /** Assistant text is actively arriving. Implies busy. */
  streaming: boolean
  /** Last turn ended in an error. Clears on next successful turn. */
  error: boolean
  /** Epoch ms of the last completed (non-error) turn. */
  lastTurnAt: number | null
}

const DEFAULT_STATE: AgentVisualState = {
  busy: false,
  streaming: false,
  error: false,
  lastTurnAt: null,
}

interface AgentContextValue {
  state: AgentVisualState
  /** Merge a patch into the visual state. */
  setVisualState: (patch: Partial<AgentVisualState>) => void
}

const AgentContext = React.createContext<AgentContextValue | null>(null)

export function useAgent(): AgentContextValue {
  const ctx = React.useContext(AgentContext)
  if (!ctx) throw new Error("useAgent must be used inside <AgentProvider>")
  return ctx
}

export function AgentProvider({ children }: { children: React.ReactNode }) {
  const [state, setStateRaw] = React.useState<AgentVisualState>(DEFAULT_STATE)

  const setVisualState = React.useCallback(
    (patch: Partial<AgentVisualState>) => {
      setStateRaw(prev => {
        // Skip the re-render if nothing actually changed. Saves work
        // when a chat surface fires set on every keystroke.
        const next = { ...prev, ...patch }
        if (
          next.busy === prev.busy &&
          next.streaming === prev.streaming &&
          next.error === prev.error &&
          next.lastTurnAt === prev.lastTurnAt
        ) {
          return prev
        }
        return next
      })
    },
    [],
  )

  const value = React.useMemo<AgentContextValue>(
    () => ({ state, setVisualState }),
    [state, setVisualState],
  )

  return (
    <AgentContext.Provider value={value}>{children}</AgentContext.Provider>
  )
}
