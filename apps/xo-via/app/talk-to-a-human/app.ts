import { defineXOApp } from "@/lib/xo-app"

export const xoApp = defineXOApp({
  path: "/talk-to-a-human",
  label: "Talk",
  navTitle: "Talk to a human",
  glyph: "💬",
  tile: "bg-gradient-to-br from-teal-400 to-cyan-700 text-white",
  kind: "native",
})
