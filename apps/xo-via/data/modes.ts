import { modeRegistry } from "@/lib/xo-mode-registry"
import { landing } from "./modes/landing"
import { agent } from "./modes/agent"
import { publicMode } from "./modes/public"

/**
 * Built-in mode registration.
 *
 * Per MODES_PLAN.md §5.2: this file is intentionally thin. New
 * built-in modes register here; third-party / plugin modes call
 * `modeRegistry.register()` from their own bundles without editing
 * this file.
 *
 * Section C (v.Next): the three top-level pages of the Pager are
 * Landing (public, Page 1), Agent (required, Page 2), and Public
 * (placeholder, Page 3). The v0 `default` mode has been renamed to
 * `agent`; the `setup` mode is intentionally not registered for
 * v.Next (kept in tree behind a future ?mode=setup if needed).
 *
 * Pager order is driven by `precedence` (descending): Landing (10),
 * Agent (5), Public (-10).
 */
modeRegistry.register(landing)
modeRegistry.register(agent)
modeRegistry.register(publicMode)

export { modeRegistry }

/**
 * First-load default mode id. Public visitors land here; the Pager
 * swipe right (or sign-in success) lifts them into Agent.
 */
export const DEFAULT_MODE_ID = "landing"
