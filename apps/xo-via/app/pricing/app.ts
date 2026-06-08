import { defineXOApp } from "@/lib/xo-app"

export const xoApp = defineXOApp({
  path: "/pricing",
  label: "Pricing",
  glyph: "$",
  tile: "bg-gradient-to-br from-emerald-500 to-teal-700 text-white",
  description: "Usage-based. Free tier covers most teams.",
  kind: "native",
})
