import { defineMode } from "@/lib/xo-mode"

/**
 * Agent mode (v.Next).
 *
 * Inherits the v0 "default" mode's app set: the full XO suite plus
 * (in later sections) the cowork-derived API apps (Sessions, Files,
 * Agents, Channels, Usage). Auth-required: signed-in users see their
 * own workspace data; signed-out swipes here trigger the Clerk gate.
 */
export const agent = defineMode({
  id: "agent",
  label: "Agent",
  description: "Your full XO suite + cowork-derived apps.",
  precedence: 5,
  auth: "required",
  appPaths: [
    "/",
    "/coworker",
    "/swarm",
    "/pricing",
    "/customers",
    "/demo",
    "/docs",
    "/talk-to-a-human",
    "/ask",
    "/about",
    "/changelog",
    "/handbook",
    "/settings",
    "/signup-external",
  ],
  dockPaths: [
    "/ask",
    "/coworker",
    "/settings",
    "/signup-external",
  ],
})
