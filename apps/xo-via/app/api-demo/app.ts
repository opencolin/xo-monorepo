import { defineXOApp } from "@/lib/xo-app"

/**
 * Dummy api app. Server-side fetches a small JSON payload from a
 * public test API (jsonplaceholder.typicode.com) and renders the
 * result inside XOAppShell. Exercises the kind: "api" plumbing
 * without requiring xo-cowork-api or any local backend.
 */
export const xoApp = defineXOApp({
  path: "/api-demo",
  label: "API",
  navTitle: "API demo",
  glyph: "{}",
  tile: "bg-gradient-to-br from-pink-500 to-rose-600 text-white",
  dock: true,
  description: "Server-side fetch from jsonplaceholder.typicode.com.",
  kind: "api",
  endpoint: "/users",
  revalidate: false,
})
