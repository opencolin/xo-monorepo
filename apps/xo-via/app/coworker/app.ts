import { defineXOApp } from "@/lib/xo-app"

export const xoApp = defineXOApp({
  path: "/coworker",
  label: "Coworker",
  glyph: "Co",
  tile: "bg-gradient-to-br from-purple-500 to-fuchsia-700 text-white",
  dock: true,
  description: "The unit. A portable, containerized agent workspace.",
  featured: true,
  kind: "native",
})
