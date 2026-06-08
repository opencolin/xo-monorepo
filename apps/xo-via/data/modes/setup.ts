import { defineMode } from "@/lib/xo-mode"

/**
 * Setup mode: the guided onboarding flow.
 *
 * Surfaces the four step apps + Settings (so user can switch out)
 * + signup-external. The home indicator (/) is kept so the home
 * gesture still works. Setup mode has a distinct theme (warm
 * amber) so the user always knows they are "in setup" at a glance.
 */
export const setup = defineMode({
  id: "setup",
  label: "Setup",
  description: "Guided onboarding flow.",
  precedence: 5,
  appPaths: [
    "/",
    "/setup-welcome",
    "/setup-profile",
    "/setup-workspace",
    "/setup-integrations",
    "/settings",
    "/signup-external",
  ],
  dockPaths: [
    "/setup-welcome",
    "/setup-profile",
    "/setup-workspace",
    "/setup-integrations",
  ],
  theme: {
    accent: "#f5a866",
    wallpaperBase: "#f5a866",
    statusBarTint: "rgba(245, 168, 102, 0.07)",
  },
})
