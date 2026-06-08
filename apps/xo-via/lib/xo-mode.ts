/**
 * Unified XO mode definition.
 *
 * A mode is the set of apps + dock pins that the home screen shows
 * at a given point in the user journey. v1 ships `landing` and
 * `default`; `setup` and any third-party / A/B-test modes register
 * via the same `defineMode()` factory.
 *
 * IMPORTANT: this module is consumed by both Server Components and
 * Client Components (via `data/modes.ts`). Keep it pure: no React,
 * no JSX, no fetch, no server-only modules.
 *
 * See MODES_PLAN.md §5 for the data model and §16 for resolved
 * decisions (notably: dynamic registration, RBAC stub, no per-mode
 * theming in v1).
 */

export type ModeId = string

export interface ModeBase {
  /** Stable identifier, used in URLs (`?mode=<id>`) and storage. */
  id: ModeId
  /** Short title for the Settings switcher. */
  label: string
  /** One-line user-facing description (optional). */
  description?: string
  /**
   * Per-mode auth gating, Section G.
   *
   *   "public"   — anyone may enter. Default if omitted.
   *   "required" — Pager fires the Clerk sign-in surface when an
   *                outer swipe targets this mode while signed out.
   *                On successful sign-in the queued swipe completes.
   *
   * Pages within a mode inherit this default; per-page override is a
   * future addition (out of scope for v.Next).
   */
  auth?: "public" | "required"
  /**
   * Routes that appear in this mode's HomeScreen grid + Spotlight.
   * Each entry must match a route path under `app/<route>/page.tsx`
   * or `app/<route>/app.ts`. The `/` (home) path is conventionally
   * included so the home indicator still works.
   */
  appPaths: readonly string[]
  /**
   * Up to 4 paths that appear in the dock. Must be a subset of
   * `appPaths`. Order is the dock order, left to right.
   */
  dockPaths: readonly string[]
  /**
   * RBAC stub. v1 ignores this; v1.5+ will hide the mode from users
   * who lack any of the listed roles. Empty / undefined means
   * universally accessible.
   */
  requiredRoles?: readonly string[]
  /**
   * Sort hint for the Settings switcher list. Higher precedence
   * appears first. Default 0.
   */
  precedence?: number
  /**
   * Optional visual theme for the mode. Plumbed into the home
   * Wallpaper, the mode banner pill, and the status bar tint.
   * Defaults to the XO lime palette when omitted.
   *
   * See MODES_PLAN.md §12 (the deferred-then-shipped per-mode
   * theming work).
   */
  theme?: ModeTheme
}

/**
 * Per-mode theme. Every field optional; consumers fall back to the
 * XO lime default when a field is missing.
 */
export interface ModeTheme {
  /** Primary accent color (hex). Drives banner pill, glow tint, CTA highlights. */
  accent?: string
  /** Wallpaper base color (hex). If omitted, falls back to `accent`. */
  wallpaperBase?: string
  /** Status bar background tint (CSS color/rgba). If omitted, status bar stays transparent. */
  statusBarTint?: string
}

/** Currently identical to ModeBase; alias kept for forward-compat. */
export type Mode = ModeBase

/** ResolvedMode is what the registry stores. Equal to Mode for v1. */
export type ResolvedMode = Mode

/**
 * Factory + validator. Throws on invalid specs so a misconfiguration
 * surfaces at module-init time rather than at first render.
 *
 * Usage:
 *
 *   // data/modes/landing.ts
 *   export const landing = defineMode({
 *     id: "landing",
 *     label: "Landing",
 *     appPaths: ["/", "/coworker", "/swarm", "/pricing", "/ask"],
 *     dockPaths: ["/coworker", "/swarm", "/pricing", "/signup-external"],
 *   })
 */
export function defineMode<T extends ModeBase>(spec: T): T {
  if (!spec.id) {
    throw new Error("defineMode: `id` is required")
  }
  if (!spec.label) {
    throw new Error(`defineMode(${spec.id}): \`label\` is required`)
  }
  if (spec.dockPaths.length > 4) {
    throw new Error(
      `defineMode(${spec.id}): dockPaths has ${spec.dockPaths.length} entries, max is 4`,
    )
  }
  const appSet = new Set(spec.appPaths)
  for (const p of spec.dockPaths) {
    if (!appSet.has(p)) {
      throw new Error(
        `defineMode(${spec.id}): dock path "${p}" is not in appPaths`,
      )
    }
  }
  return spec
}
