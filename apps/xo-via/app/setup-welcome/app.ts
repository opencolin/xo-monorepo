import { defineXOApp } from "@/lib/xo-app"

/**
 * Setup-welcome is the entry point for the onboarding flow.
 * Visible in `landing` (so first-time visitors find it) and in
 * `setup` (so the user can return to step 1 mid-flow). Hidden from
 * `default` once the user is onboarded.
 */
export const xoApp = defineXOApp({
  path: "/setup-welcome",
  label: "Get started",
  glyph: "Go",
  tile: "bg-gradient-to-br from-amber-400 to-orange-600 text-white",
  description: "Begin the XO setup journey.",
  featured: true,
  kind: "native",
  availableIn: ["landing", "setup"],
})
