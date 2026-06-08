import { defineXOApp } from "@/lib/xo-app"

/**
 * External tile. No sibling page.tsx — Next gives /signup-external
 * a 404 by design. AppIcon sees `kind: "external"` + `href` and opens
 * the URL in a new tab instead of navigating in-OS.
 */
export const xoApp = defineXOApp({
  path: "/signup-external",
  label: "Sign up",
  glyph: "↗",
  tile: "bg-gradient-to-br from-lime-400 to-lime-600 text-ink-900",
  // The 4th dock slot now holds Chat (Ask XO) per AGENT_PLAN.md §13 #5.
  // Sign-up is reachable via the agent ("how do I sign up?") and via
  // direct URL (https://app.xo.builders/signup). Re-enable dock + drop
  // a different tile if you want it back on the home screen.
  dock: false,
  kind: "external",
  href: "https://app.xo.builders/signup",
})
