"use client"

import * as React from "react"
import type { ResolvedXOApp } from "@/lib/xo-app"

/**
 * Iframe variant of the XOApp shell. Used by pages with kind: "iframe"
 * (e.g. embedding xo-swarm, the example.com demo). Renders:
 *
 *   [ URL bar       lock + host           ↗ open-in-new-tab ]
 *   [ iframe (fills remaining space, with loading overlay)  ]
 *
 * Client Component because the iframe and the loading state are
 * client-only. The page itself stays a Server Component; only this
 * leaf is client.
 */
export function XOAppShellIframe({
  app,
}: {
  app: ResolvedXOApp & { kind: "iframe" }
}) {
  const [loaded, setLoaded] = React.useState(false)
  const defaultSandbox =
    "allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"

  return (
    <div className="relative flex flex-col w-full h-full bg-black">
      <UrlBar src={app.src} label={app.label} />
      <div className="relative flex-1">
        {!loaded && (
          <div className="absolute inset-0 grid place-items-center text-white/40 text-sm pointer-events-none">
            Loading {app.label}...
          </div>
        )}
        <iframe
          src={app.src}
          title={app.label}
          onLoad={() => setLoaded(true)}
          className="w-full h-full border-0"
          sandbox={app.sandbox ?? defaultSandbox}
          referrerPolicy="no-referrer-when-downgrade"
          allow="clipboard-read; clipboard-write; fullscreen"
        />
      </div>
    </div>
  )
}

/**
 * Browser-style address bar. Shows protocol icon + host. Tap the
 * arrow on the right to open the embedded URL in a new tab.
 */
function UrlBar({ src, label }: { src: string; label: string }) {
  const url = parseUrl(src)
  const host = url?.host ?? src
  const isHttps = url?.protocol === "https:"

  return (
    <div className="flex items-center gap-2 h-9 px-3 bg-phone-card2 border-b border-phone-divider">
      <span
        className={[
          "shrink-0 grid place-items-center",
          isHttps ? "text-white/50" : "text-amber-400",
        ].join(" ")}
        aria-label={isHttps ? "Secure connection" : "Insecure connection"}
        title={isHttps ? "https" : "http"}
      >
        {isHttps ? <LockIcon /> : <InsecureIcon />}
      </span>

      <span
        className="flex-1 text-white/80 text-xs truncate font-mono select-text"
        title={src}
      >
        {host}
      </span>

      <a
        href={src}
        target="_blank"
        rel="noopener noreferrer"
        className="shrink-0 text-lime-300 hover:text-lime-200 p-1 -mr-1 rounded transition-colors"
        aria-label={`Open ${label} in a new tab`}
        title={`Open ${label} in a new tab`}
      >
        <ExternalIcon />
      </a>
    </div>
  )
}

function parseUrl(src: string): URL | null {
  try {
    return new URL(src)
  } catch {
    return null
  }
}

// ────────────────────────────────────────────────────────────────────
// Inline SVG icons. Sized for the 36px bar; stroke-based so they
// pick up `currentColor` from the parent.

function LockIcon() {
  return (
    <svg width="12" height="14" viewBox="0 0 12 14" aria-hidden>
      <path
        d="M3 6V4a3 3 0 0 1 6 0v2"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
      />
      <rect
        x="1.5"
        y="6"
        width="9"
        height="7"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
      />
    </svg>
  )
}

function InsecureIcon() {
  return (
    <svg width="12" height="14" viewBox="0 0 12 14" aria-hidden>
      <path
        d="M3 7V4a3 3 0 0 1 5.5-1.7"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
      />
      <rect
        x="1.5"
        y="6"
        width="9"
        height="7"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
      />
    </svg>
  )
}

function ExternalIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden>
      <path
        d="M5.5 2.5H11v5.5M11 2.5L6 7.5"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9 8.5v3H2.5v-7H6"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
