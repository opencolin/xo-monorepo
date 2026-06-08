import { defineXOApp } from "@/lib/xo-app"

export const xoApp = defineXOApp({
  path: "/customers",
  label: "Customers",
  glyph: "C",
  tile: "bg-gradient-to-br from-amber-400 to-orange-600 text-white",
  kind: "native",
})
