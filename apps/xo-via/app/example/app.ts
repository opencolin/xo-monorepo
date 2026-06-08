import { defineXOApp } from "@/lib/xo-app"

/**
 * Dummy iframe app. Loads example.com inside the phone OS shell.
 *
 * Note on framing: example.com (run by IANA) may set
 * `Content-Security-Policy: frame-ancestors 'none'` or
 * `X-Frame-Options: deny`, in which case the iframe will render
 * blank and the browser console will show a CSP refusal. That is
 * the embedded site's call, not a bug here. The XO App plumbing
 * itself is exercised either way.
 */
export const xoApp = defineXOApp({
  path: "/example",
  label: "Example",
  glyph: "Ex",
  tile: "bg-gradient-to-br from-neutral-500 to-neutral-800 text-white",
  dock: true,
  description: "Iframe demo, loads example.com inside the phone.",
  kind: "iframe",
  src: "https://example.com",
})
