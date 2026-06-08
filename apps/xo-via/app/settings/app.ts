import { defineXOApp } from "@/lib/xo-app"

export const xoApp = defineXOApp({
  path: "/settings",
  label: "Settings",
  glyph: "⚙",
  tile: "bg-gradient-to-br from-stone-500 to-stone-800 text-white",
  kind: "native",
})
