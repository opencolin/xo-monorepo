import { defineXOApp } from "@/lib/xo-app"

export const xoApp = defineXOApp({
  path: "/demo",
  label: "Demo",
  glyph: "▶",
  tile: "bg-gradient-to-br from-rose-500 to-red-700 text-white",
  kind: "native",
})
