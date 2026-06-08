import { defineMode } from "@/lib/xo-mode"

/**
 * Public mode (v.Next placeholder).
 *
 * Page 3 in the Pager. Reserved for the agent-folders-as-public-loop
 * concept that ships in its own dedicated planning session. For now
 * it holds the swipe target with a minimal app set so the visitor
 * sees something coherent on Page 3.
 *
 * v.Next: auth "public" placeholder. Actual access policy decided in
 * the dedicated session.
 */
export const publicMode = defineMode({
  id: "public",
  label: "Public",
  description: "Public agent folders, coming soon.",
  precedence: -10,
  auth: "public",
  appPaths: [
    "/",
    "/ask",
    "/about",
    "/signup-external",
  ],
  dockPaths: [
    "/ask",
    "/about",
    "/signup-external",
  ],
})
