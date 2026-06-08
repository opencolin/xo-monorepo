import { defineXOApp } from "@/lib/xo-app"

export const xoApp = defineXOApp({
  path: "/setup-integrations",
  label: "Integrations",
  glyph: "In",
  tile: "bg-gradient-to-br from-orange-500 to-red-600 text-white",
  description: "Connect Linear, GitHub, Slack.",
  kind: "native",
  availableIn: ["setup"],
  requiredRoles: ["signed-in"],
})
