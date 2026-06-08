"use client"

import * as React from "react"
import type { ResolvedXOApp } from "@/lib/xo-app"

/**
 * HTML variant of the XOApp shell. Used by pages with kind: "html".
 *
 * Renders the source HTML inside a sandboxed iframe via `srcDoc`. The
 * iframe boundary keeps the embedded HTML's scripts and styles from
 * leaking into the phone OS shell. The sandbox attribute (override
 * via `app.sandbox`) controls what the embedded document can do.
 *
 *   [ Source bar         file path or "inline"               ]
 *   [ iframe (sandboxed srcDoc, fills the remaining height)  ]
 *
 * Client Component because the iframe needs onLoad state. The page
 * itself stays a Server Component; only this leaf is client.
 */
export function XOAppShellHtml({
  app,
  html,
}: {
  app: ResolvedXOApp & { kind: "html" }
  html: string
}) {
  const [loaded, setLoaded] = React.useState(false)

  // Default sandbox: allow the HTML to run its own scripts and open
  // popups, but block top-level navigation, forms, modals, and
  // same-origin access. Tighten per app via `app.sandbox`.
  const defaultSandbox =
    "allow-scripts allow-popups allow-popups-to-escape-sandbox"

  const sourceLabel = app.html
    ? "inline"
    : app.collection && app.slug
      ? `content/${app.collection}/${app.slug}.html`
      : "unknown"

  return (
    <div className="relative flex flex-col w-full h-full bg-black">
      <SourceBar label={sourceLabel} />
      <div className="relative flex-1">
        {!loaded && (
          <div className="absolute inset-0 grid place-items-center text-white/40 text-sm pointer-events-none">
            Loading {app.label}...
          </div>
        )}
        <iframe
          srcDoc={html}
          title={app.label}
          onLoad={() => setLoaded(true)}
          className="w-full h-full border-0 bg-white"
          sandbox={app.sandbox ?? defaultSandbox}
          referrerPolicy="no-referrer"
        />
      </div>
    </div>
  )
}

/**
 * Address-bar equivalent for the html kind. No URL to open, so it
 * shows the source label only (inline or content path) and a small
 * "sandboxed" badge for transparency.
 */
function SourceBar({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 h-9 px-3 bg-phone-card2 border-b border-phone-divider">
      <span
        className="shrink-0 text-white/40"
        aria-label="HTML source"
        title="HTML source"
      >
        <CodeIcon />
      </span>

      <span
        className="flex-1 text-white/80 text-xs truncate font-mono select-text"
        title={label}
      >
        {label}
      </span>

      <span
        className="shrink-0 text-[10px] uppercase tracking-wider text-white/40 font-medium"
        title="Rendered inside a sandboxed iframe"
      >
        sandboxed
      </span>
    </div>
  )
}

function CodeIcon() {
  return (
    <svg width="16" height="14" viewBox="0 0 16 14" aria-hidden>
      <path
        d="M5 3.5L1.5 7L5 10.5"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M11 3.5L14.5 7L11 10.5"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
