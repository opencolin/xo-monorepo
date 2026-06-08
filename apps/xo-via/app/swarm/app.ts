import { defineXOApp } from "@/lib/xo-app"

export const xoApp = defineXOApp({
  path: "/swarm",
  label: "Swarm",
  glyph: "Sw",
  tile: "bg-gradient-to-br from-sky-500 to-indigo-700 text-white",
  // dock slot freed for the one-app-per-kind test dock.
  dock: false,
  description: "The platform. Launch and orchestrate many workspaces.",
  featured: true,
  kind: "native",
})
