import type { Metadata } from "next"

/**
 * Unified XO app definition.
 *
 * One app = one `app/<route>/app.ts` file exporting `xoApp`. The
 * sibling `page.tsx` imports it for metadata and for the shell.
 *
 * IMPORTANT: this module is consumed by both Server Components (pages,
 * XOAppShell) and Client Components (HomeScreen, DeviceFrame, AppIcon)
 * via `data/apps.ts`. Keep it pure: no React, no JSX, no fetch, no
 * server-only modules.
 */

/**
 * Per-app gesture opt-ins. See GESTURE_PLAN.md §5.
 *
 * v1 ships pull-to-refresh only; future gestures (per-app back
 * override, custom long-press, etc.) extend this object.
 */
export interface XOGestureSpec {
  pullToRefresh?: PullToRefreshSpec
}

/**
 * Pull-to-refresh declaration. The `intent` defaults from `kind`
 * (see PullToRefresh.tsx) but apps can override or pass a custom
 * client callback name.
 */
export interface PullToRefreshSpec {
  enabled: true
  /**
   * What "refresh" means for this app. If omitted, derived from the
   * app's `kind`:
   *   native | mdx | html → "refresh-route"
   *   iframe              → "reload-iframe"
   *   api                 → "refetch-api"
   *
   * Note: for kind: "html" with inline `html`, "refresh-route" is a
   * visual no-op (the source does not change). File-backed html
   * (collection + slug) does re-read on refresh.
   */
  intent?: "refresh-route" | "reload-iframe" | "refetch-api" | "custom"
  /**
   * Resolved client-side when `intent === "custom"`. Looked up by
   * name in components/gestures/PullToRefresh.tsx's handler registry
   * so xoApp data stays serializable.
   */
  onTrigger?: string
}

/** Fields every app shares. */
export interface XOAppBase {
  /** Route path, matching the directory under `app/`. The home screen uses this. */
  path: string
  /** Tile label under the icon on the home screen. */
  label: string
  /** In-app NavBar title. Defaults to `label`. */
  navTitle?: string
  /** 1 to 2 chars or single emoji rendered inside the tile. */
  glyph: string
  /** Tailwind classes for the home-screen tile background. */
  tile: string
  /** Show the tile in the dock (max 4 dock pins app-wide). */
  dock?: boolean
  /**
   * SEO description and the optional tagline under the in-app header.
   * Drives both `<meta name="description">` and the shell header.
   */
  description?: string
  /** Render the large icon block in the in-app header. Defaults to false. */
  featured?: boolean
  /** Optional gesture opt-ins (pull-to-refresh, future overrides). */
  gesture?: XOGestureSpec
  /**
   * Mode opt-out. If set, the app refuses to render in modes not in
   * this list, even when a registered mode's `appPaths` includes
   * the app. Use sparingly: most apps should rely on mode-side
   * inclusion. See MODES_PLAN.md §5.3.
   */
  availableIn?: readonly string[]
  /**
   * RBAC stub. v1 ignores this field; v1.5+ hides apps whose
   * required roles the current user lacks. See MODES_PLAN.md §16
   * decision 6.
   */
  requiredRoles?: readonly string[]
}

/** Variant: in-OS content rendered from the route's page.tsx body. */
export interface XOAppNative extends XOAppBase {
  kind: "native"
}

/** Variant: tile opens a URL in a new tab. No page.tsx needed. */
export interface XOAppExternal extends XOAppBase {
  kind: "external"
  href: string
}

/** Variant: shell renders an <iframe> to `src`. The route's page is a thin wrapper. */
export interface XOAppIframe extends XOAppBase {
  kind: "iframe"
  src: string
  /** Override the default iframe sandbox flags. */
  sandbox?: string
}

/** Variant: page fetches from an HTTP endpoint and renders the result. */
export interface XOAppApi extends XOAppBase {
  kind: "api"
  /** Relative path appended to NEXT_PUBLIC_COWORK_API_URL (or similar). */
  endpoint: string
  /** Next data-cache strategy. `false` disables caching. */
  revalidate?: number | false
}

/** Variant: page renders an MDX document from a content collection. */
export interface XOAppMdx extends XOAppBase {
  kind: "mdx"
  collection: string
  slug: string
}

/**
 * Variant: page renders raw HTML inside a sandboxed iframe.
 *
 * Source is either inline (`html`) or read from disk at
 * `content/<collection>/<slug>.html`. Inline wins if both are set.
 *
 * The iframe sandbox defaults to a permissive-but-safe set; override
 * via `sandbox` if you need to lock it down (e.g. trusted-only static
 * pages can drop `allow-scripts`).
 */
export interface XOAppHtml extends XOAppBase {
  kind: "html"
  /** Inline HTML source. Wins over collection/slug when both set. */
  html?: string
  /** File path: content/<collection>/<slug>.html */
  collection?: string
  slug?: string
  /** Override the default iframe sandbox flags. */
  sandbox?: string
}

/** Discriminated union over all app kinds. */
export type XOApp =
  | XOAppNative
  | XOAppExternal
  | XOAppIframe
  | XOAppApi
  | XOAppMdx
  | XOAppHtml

/** The fully resolved app, with auto-generated `metadata` attached. */
export type ResolvedXOApp = XOApp & { metadata: Metadata }

/**
 * Type the spec, auto-generate Next `Metadata` from label + description.
 *
 * Usage:
 *
 *   // app/coworker/app.ts
 *   export const xoApp = defineXOApp({
 *     path: "/coworker",
 *     label: "Coworker",
 *     glyph: "Co",
 *     tile: "bg-gradient-to-br from-purple-500 to-fuchsia-700 text-white",
 *     dock: true,
 *     description: "The unit. A portable, containerized agent workspace.",
 *     featured: true,
 *     kind: "native",
 *   })
 */
export function defineXOApp<T extends XOApp>(
  spec: T,
): Extract<XOApp, { kind: T["kind"] }> & { metadata: Metadata } {
  // Widening to the full variant (rather than the literal `T`) keeps
  // optional fields on each kind reachable on the returned manifest.
  // Example: XOAppHtml.html is optional; without this widening, a
  // manifest that omits `html` would lose access to the field even
  // when reading `xoApp.html` elsewhere.
  const resolved = {
    ...spec,
    metadata: {
      title: `${spec.label}, XO`,
      ...(spec.description ? { description: spec.description } : {}),
    },
  }
  return resolved as unknown as Extract<XOApp, { kind: T["kind"] }> & {
    metadata: Metadata
  }
}
