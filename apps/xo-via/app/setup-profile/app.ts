import { defineXOApp } from "@/lib/xo-app"

export const xoApp = defineXOApp({
  path: "/setup-profile",
  label: "Profile",
  glyph: "Pr",
  tile: "bg-gradient-to-br from-rose-400 to-pink-600 text-white",
  description: "Name and handle.",
  kind: "native",
  availableIn: ["setup"],
  requiredRoles: ["signed-in"],
})
