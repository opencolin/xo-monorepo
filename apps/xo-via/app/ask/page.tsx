import { xoApp } from "./app"
import { XOAppShell } from "@/components/XOAppShell"
import { AgentSurface } from "@/components/agent/AgentSurface"

export const metadata = xoApp.metadata

/**
 * Ask XO chat app. Phase 1 of AGENT_PLAN.md: bare conversation with
 * the Claude Agent SDK, no OS tools yet.
 *
 * The page itself stays a Server Component; only <AgentSurface/> is
 * client. XOAppShell renders the in-OS chrome; the agent surface
 * fills the rest of the screen and manages its own scroll.
 */
export default function AskPage() {
  return (
    <XOAppShell app={xoApp} className="flex flex-col h-full pb-3">
      <AgentSurface />
    </XOAppShell>
  )
}
