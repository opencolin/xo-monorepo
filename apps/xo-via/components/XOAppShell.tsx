import * as React from "react"
import type { ResolvedXOApp } from "@/lib/xo-app"
import { ModeMismatchBanner } from "./ModeMismatchBanner"
import { RoleGate } from "./gates/RoleGate"

/**
 * Unified in-app shell. Renders a header derived from the XOApp spec
 * (optional large icon, title, optional tagline) and slots the body
 * underneath. Server Component; safe to use from any page.tsx.
 *
 * For kind: "iframe" pages, use <XOAppShellIframe/> instead.
 *
 * Visual contract:
 *   featured: true  → large icon block + h1 + description (Coworker, Swarm)
 *   featured: false → h1 + description if present                (Pricing, stubs)
 *   no description  → h1 only                                    (Settings)
 *
 * Scroll container + per-app pull-to-refresh are owned by AppView, not
 * this component, so each page renders once with no scroll nesting.
 *
 * Mode awareness: if the user is in a mode that does not include
 * this app, a soft banner appears above the header offering to
 * switch (see MODES_PLAN.md §10).
 *
 * Role awareness: the body is wrapped in <RoleGate/>, which renders
 * a sign-in (or future paywall) overlay when the user lacks the
 * required roles. Discovery surfaces (HomeScreen, dock, Spotlight)
 * stay permissive; the gate fires only inside the app.
 */
export function XOAppShell({
  app,
  children,
  className,
}: {
  app: ResolvedXOApp
  children?: React.ReactNode
  className?: string
}) {
  return (
    <>
      <ModeMismatchBanner app={app} />
      <div className={["p-5 relative", className ?? ""].join(" ").trim()}>
        <header className="mb-6">
          {app.featured && (
            <div
              className={[
                "w-14 h-14 rounded-2xl grid place-items-center font-bold text-lg mb-3",
                app.tile,
              ].join(" ")}
              aria-hidden
            >
              {app.glyph}
            </div>
          )}
          <h1 className="text-2xl font-semibold tracking-tight">{app.label}</h1>
          {app.description && (
            <p className="text-white/60 text-sm mt-1">{app.description}</p>
          )}
        </header>

        <RoleGate app={app}>{children}</RoleGate>
      </div>
    </>
  )
}
