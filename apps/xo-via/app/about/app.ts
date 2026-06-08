import { defineXOApp } from "@/lib/xo-app"

export const xoApp = defineXOApp({
  path: "/about",
  label: "Why XO?",
  glyph: "i",
  tile: "bg-gradient-to-br from-zinc-600 to-zinc-800 text-white",
  kind: "native",
})
