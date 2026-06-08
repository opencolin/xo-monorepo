import { defineXOApp } from "@/lib/xo-app"

export const xoApp = defineXOApp({
  path: "/changelog",
  label: "Changelog",
  glyph: "Δ",
  tile: "bg-gradient-to-br from-yellow-400 to-amber-600 text-ink-900",
  kind: "native",
})
