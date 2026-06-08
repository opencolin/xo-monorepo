import { defineXOApp } from "@/lib/xo-app"

/**
 * Docs is the canonical kind: "mdx" example. Content lives at
 * `content/docs/<slug>.mdx`. Rendered by app/docs/page.tsx via
 * `next-mdx-remote/rsc` with the phone-themed component map from
 * `components/mdx-components.tsx`.
 *
 * PTR intent for mdx defaults to "refresh-route" (router.refresh()),
 * which re-reads the MDX file from disk on every refresh.
 */
export const xoApp = defineXOApp({
  path: "/docs",
  label: "Docs",
  glyph: "📖",
  tile: "bg-gradient-to-br from-slate-500 to-slate-700 text-white",
  description: "XO documentation, rendered from MDX.",
  kind: "mdx",
  collection: "docs",
  slug: "index",
  gesture: {
    pullToRefresh: { enabled: true },
  },
})
