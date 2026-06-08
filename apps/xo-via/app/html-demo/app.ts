import type { Metadata } from "next"
import { defineXOApp, type XOAppHtml } from "@/lib/xo-app"

/**
 * Canonical kind: "html" demo. Source lives at
 * `content/html/index.html` and renders inside a sandboxed iframe via
 * <XOAppShellHtml>. To embed inline HTML instead, set `html: "<...>"`
 * directly on the manifest and drop `collection` + `slug`.
 *
 * The explicit `XOAppHtml & { metadata }` annotation keeps the
 * optional fields (`html`, `collection`, `slug`) reachable for the
 * page-level branching even when this manifest only sets some of them.
 */
export const xoApp: XOAppHtml & { metadata: Metadata } = defineXOApp({
  path: "/html-demo",
  label: "HTML",
  navTitle: "HTML demo",
  glyph: "</>",
  tile: "bg-gradient-to-br from-orange-500 to-orange-700 text-white",
  description: "Raw HTML rendered in a sandboxed iframe.",
  kind: "html",
  collection: "html",
  slug: "index",
})
