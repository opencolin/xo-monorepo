import { defineXOApp } from "@/lib/xo-app"

export const xoApp = defineXOApp({
  path: "/setup-workspace",
  label: "Workspace",
  glyph: "Wk",
  tile: "bg-gradient-to-br from-orange-300 to-rose-500 text-ink-900",
  description: "Name your first workspace.",
  kind: "native",
  availableIn: ["setup"],
  requiredRoles: ["signed-in"],
})
