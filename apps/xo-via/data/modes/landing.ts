import { defineMode } from "@/lib/xo-mode"

/**
 * Landing mode: first-time visitor. Marketing-focused subset of
 * apps. Fewer icons, all of them about explaining what XO is.
 */
export const landing = defineMode({
  id: "landing",
  label: "Landing",
  description: "First impression. Marketing-focused subset of apps.",
  precedence: 10,
  auth: "public",
  appPaths: [
    "/",
    "/coworker",
    "/swarm",
    "/pricing",
    "/ask",
    "/demo",
    "/setup-welcome",
    "/settings",
    "/signup-external",
  ],
  dockPaths: [
    "/coworker",
    "/swarm",
    "/setup-welcome",
    "/signup-external",
  ],
})
