import { defineXOApp } from "@/lib/xo-app"

/**
 * Second mdx-kind app. Content at `content/handbook/index.mdx`.
 * Shares the renderer + component map with /docs.
 */
export const xoApp = defineXOApp({
  path: "/handbook",
  label: "Handbook",
  glyph: "H",
  tile: "bg-gradient-to-br from-blue-500 to-blue-800 text-white",
  description: "The XO operating handbook, pocket edition.",
  kind: "mdx",
  collection: "handbook",
  slug: "index",
})
