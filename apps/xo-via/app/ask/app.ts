import { defineXOApp } from "@/lib/xo-app"

/**
 * The agent chat surface. Promoted to the 4th dock pin (replacing the
 * Sign-up external tile). The chat is also surfaced as the Spotlight
 * panel (pull-down from the top of any screen) per AGENT_PLAN.md §5.
 *
 * v1 ships Phase 1 from AGENT_PLAN.md: bare conversation, no OS tools.
 * Phases 2+ add Tier R/N/A/W OS control.
 */
export const xoApp = defineXOApp({
  path: "/ask",
  label: "Chat",
  navTitle: "Ask XO",
  glyph: "💬",
  tile: "bg-gradient-to-br from-lime-300 to-lime-500 text-ink-900",
  dock: true,
  description: "Chat with XO. Ask anything; it knows your phone OS.",
  kind: "native",
})
