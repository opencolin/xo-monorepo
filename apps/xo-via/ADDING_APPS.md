# Adding apps to xo-phone-os

How to ship a new tile on the home screen. Covers four shapes of "app", from a five-minute static page to wrapping a whole other product.

If you have not read `ARCHITECTURE.md` yet, do that first. The vocabulary here (Server Component, client boundary, `layoutId` morph, `AppDef`, `PhoneContext.pageElement`) is defined there.

---

## 1. The four kinds of app

| Kind | Examples in this repo | When to use | Effort |
|---|---|---|---|
| **A. Native page** | `/coworker`, `/swarm`, `/pricing`, `/settings`, all the stubs | Long-form content you control, written in JSX. Static text, cards, lists, forms. | minutes |
| **B. Embedded site** (iframe) | not present yet | Loading **xo-swarm** as a full embedded experience, or any external surface XO does not own. | ~1 hour, plus CSP coordination |
| **C. API-backed wrapper** | not present yet | Native UI that talks to **xo-cowork-api** (or any JSON backend). Tiny "show me my last 5 sessions" surface. Maintains the phone OS look and the morph animation. | a few hours per surface |
| **D. Imported content** | not present yet | Rendering **xo-docs** MDX inside the Docs app. Build-time or runtime; either way the content lives somewhere else and you render it on the phone. | half a day for the plumbing, then trivial per page |

Pick the cheapest shape that delivers the experience you want. Mixing is fine: a wrapper app can `iframe` a tool when one screen requires it.

---

## 2. The shared checklist, every kind

No matter which shape, you touch the same three places.

```
┌─────────────────────────────────────────────────────────────┐
│ 1. data/apps.ts                                             │
│      Add a new AppDef entry. path, label, glyph, tileClass. │
│      Add dock: true if it should sit in the dock.           │
│                                                             │
│ 2. app/<route>/page.tsx                                     │
│      Create the directory. Default-export the page body.    │
│      Optionally export `const metadata: Metadata = ...`.    │
│                                                             │
│ 3. (Sometimes) app/<route>/loading.tsx                      │
│      If the page does any async work, add a streaming       │
│      skeleton so the layoutId morph has something to draw   │
│      to while the data arrives.                             │
└─────────────────────────────────────────────────────────────┘
```

That is the entire contract. The OS shell handles the icon morph, the back chevron, the title, the status bar, swipe-up to home, Escape, prefetching. Your page is just content.

A canonical `AppDef`, copied from `data/apps.ts`:

```ts
{
  path: "/sessions",                       // matches app/sessions/page.tsx
  label: "Sessions",                       // tile label
  glyph: "S",                              // 1 to 2 chars; can be emoji
  tileClass: "bg-gradient-to-br from-cyan-500 to-blue-700 text-white",
  navTitle: "Live sessions",               // optional; AppView title
  dock: false,                             // optional; up to 4 dock pins
  href: "https://example.com",             // optional; if set, tile opens
                                           // the URL in a new tab and
                                           // skips the layoutId morph
}
```

`tileClass` is any Tailwind background. The XO palette in `app/globals.css` `@theme` is open to you (`bg-lime-400`, `bg-phone-card2`, etc.); see `ARCHITECTURE.md` §10.

---

## 3. Kind A: a native page

The fastest shape. Server Component, no `"use client"`, pure JSX.

**Step 1**, add the icon:

```ts
// data/apps.ts
{ path: "/glossary", label: "Glossary", glyph: "Az",
  tileClass: "bg-gradient-to-br from-slate-500 to-slate-800 text-white" },
```

**Step 2**, write the page:

```tsx
// app/glossary/page.tsx
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Glossary, XO",
  description: "The vocabulary of XO Workspaces.",
}

export default function GlossaryPage() {
  return (
    <div className="p-5">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Glossary</h1>
        <p className="text-white/60 text-sm mt-1">
          A pocket vocabulary for the XO stack.
        </p>
      </header>

      <Term word="Coworker">
        The unit. A portable, containerized agent workspace that runs the
        same on a laptop, in Coder, in Docker, or in Vercel Sandbox.
      </Term>
      <Term word="Swarm">
        The platform that launches and orchestrates many Coworker
        workspaces across whatever container host you point it at.
      </Term>
    </div>
  )
}

function Term({ word, children }: { word: string; children: React.ReactNode }) {
  return (
    <section className="bg-phone-card2 rounded-xl p-4 mb-3">
      <h2 className="text-white text-base font-semibold mb-1">{word}</h2>
      <p className="text-white/70 text-sm leading-relaxed">{children}</p>
    </section>
  )
}
```

Done. `pnpm dev` picks it up. Tap the new "Glossary" tile on the home screen and watch the morph.

**Style conventions**

- The page body should not render its own status bar, back chevron, or title. The OS shell adds those.
- `p-5` outer padding matches the existing pages.
- Section cards use `bg-phone-card2 rounded-xl p-4 mb-3`. Highlights use `bg-lime-400/10 border-lime-400`.
- Lime is the only accent; `text-lime-300` is the link tone.

---

## 4. Kind B: embed xo-swarm (or any external surface)

When you want to drop an entire product onto the phone instead of re-implementing it. The browser-managed iframe runs inside the AppView's scroll container. The `layoutId` morph still works for the icon, the iframe paints over once the morph settles.

Two URLs to think about:

- Local dev: `http://localhost:3000` (xo-swarm's `pnpm dev`)
- Production: `https://app.xo.builders` (per `CLAUDE.md` workspace map)

**Step 1**, expose the host as an env var so dev and prod swap cleanly:

```bash
# .env.local
NEXT_PUBLIC_SWARM_URL=http://localhost:3000
```

(For production builds, the Dockerfile's `NEXT_PUBLIC_*` placeholder pattern lets you swap this at container start. See `entrypoint.sh`.)

**Step 2**, add the icon:

```ts
// data/apps.ts
{ path: "/swarm-app", label: "Swarm", glyph: "Sw",
  tileClass: "bg-gradient-to-br from-sky-500 to-indigo-700 text-white",
  navTitle: "Swarm (live)" },
```

(The existing `/swarm` route is the marketing pitch. This new `/swarm-app` is the actual product embedded.)

**Step 3**, the route. It needs a tiny client component because iframes manage state:

```tsx
// app/swarm-app/page.tsx
import type { Metadata } from "next"
import { SwarmFrame } from "./swarm-frame"

export const metadata: Metadata = { title: "Swarm (live), XO" }

export default function SwarmAppPage() {
  const url = process.env.NEXT_PUBLIC_SWARM_URL ?? "https://app.xo.builders"
  return <SwarmFrame src={url} />
}
```

```tsx
// app/swarm-app/swarm-frame.tsx
"use client"

import * as React from "react"

export function SwarmFrame({ src }: { src: string }) {
  const [loaded, setLoaded] = React.useState(false)

  return (
    <div className="relative w-full h-full bg-black">
      {!loaded && (
        <div className="absolute inset-0 grid place-items-center text-white/40 text-sm">
          Loading Swarm...
        </div>
      )}
      <iframe
        src={src}
        title="XO Swarm"
        onLoad={() => setLoaded(true)}
        className="w-full h-full border-0"
        // sandbox keeps the embed safe; relax these only as needed
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
        // referrer-policy is good hygiene for cross-origin embeds
        referrerPolicy="no-referrer-when-downgrade"
        allow="clipboard-read; clipboard-write; fullscreen"
      />
    </div>
  )
}
```

**Step 4**, the cross-origin handshake (the part that catches people).

For xo-swarm to render inside the phone, **xo-swarm must allow framing from phone.xo.builders**. Two things to coordinate:

1. **`X-Frame-Options` header**: xo-swarm should NOT send `DENY` or `SAMEORIGIN` for the pages you embed. Remove or relax in its `next.config.ts` headers.
2. **`Content-Security-Policy: frame-ancestors`**: if xo-swarm uses CSP, add `frame-ancestors 'self' https://phone.xo.builders http://localhost:18002` so we can frame it from both dev and prod.

A Next.js example for xo-swarm's `next.config.ts`:

```ts
async headers() {
  return [{
    source: "/:path*",
    headers: [
      {
        key: "Content-Security-Policy",
        value: "frame-ancestors 'self' https://phone.xo.builders http://localhost:18002",
      },
    ],
  }]
}
```

Without that, you will see a blank iframe and a console error: `Refused to display ... in a frame because an ancestor violates the following CSP directive`.

**Gotchas**

- **Auth**. If xo-swarm requires Clerk login, the iframe will show the Clerk sign-in flow first. That is usually what you want. If you have a token already and want SSO, see Kind C below for the cross-app auth pattern.
- **Nested scrolling**. The `phone-screen` container has `overscroll-behavior: contain` (see `app/globals.css`). The iframe inside will scroll independently; that is correct on a phone but can feel odd on desktop. No fix needed unless users complain.
- **Phone viewport**. Even though we are on a 393x852 frame, xo-swarm was designed for full desktop / phone widths. It uses its own responsive logic. Most flows work; some dense pages will look cramped at 393px.
- **No `layoutId` once inside**. The morph happens up to the AppView container, then the iframe takes over. You cannot do a shared-element transition into a page that lives inside an iframe.

---

## 5. Kind C: wrapper UI calling xo-cowork-api

You keep the native phone OS feel and animations. The page is yours; the data comes from `xo-cowork-api` (FastAPI, port 5002 locally). See `xo-cowork-api/docs/frontend-api-index.md` for the full surface.

This is the right shape for "show me my channels", "show me my running sessions", "send a message to the workspace agent".

**Step 1**, env var for the API base:

```bash
# .env.local
NEXT_PUBLIC_COWORK_API_URL=http://localhost:5002
```

**Step 2**, a typed client module. Single source of truth for the API surface; the rest of the app imports from it.

```ts
// lib/cowork-api.ts
const BASE = process.env.NEXT_PUBLIC_COWORK_API_URL ?? "http://localhost:5002"

export type Channel = {
  id: string
  name: string
  created_at: string
  // expand as the API doc dictates
}

export type ApiOptions = { token?: string; signal?: AbortSignal }

async function get<T>(path: string, opts: ApiOptions = {}): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: {
      "content-type": "application/json",
      ...(opts.token ? { authorization: `Bearer ${opts.token}` } : {}),
    },
    // Server-rendered pages: skip the Next data cache. We want live data
    // each request. For background polling on the client, use a cache
    // strategy that fits the surface.
    cache: "no-store",
    signal: opts.signal,
  })
  if (!res.ok) throw new Error(`cowork-api ${path}: ${res.status}`)
  return res.json() as Promise<T>
}

export const coworkApi = {
  listChannels: (opts?: ApiOptions) => get<Channel[]>("/channels", opts),
  // add endpoints here as you wire them
}
```

**Step 3**, the icon:

```ts
// data/apps.ts
{ path: "/channels", label: "Channels", glyph: "#",
  tileClass: "bg-gradient-to-br from-teal-500 to-cyan-700 text-white" },
```

**Step 4**, the page. Stays a Server Component; the fetch runs on the server, which means **no API URL leaks to the client** and we can attach auth tokens server-side.

```tsx
// app/channels/page.tsx
import type { Metadata } from "next"
import { coworkApi, type Channel } from "@/lib/cowork-api"

export const metadata: Metadata = { title: "Channels, XO" }

export default async function ChannelsPage() {
  let channels: Channel[] = []
  let error: string | null = null
  try {
    channels = await coworkApi.listChannels()
  } catch (e) {
    error = e instanceof Error ? e.message : String(e)
  }

  return (
    <div className="p-5">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Channels</h1>
        <p className="text-white/60 text-sm mt-1">
          Live from xo-cowork-api.
        </p>
      </header>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-200 text-sm rounded-xl p-3 mb-3">
          Could not reach cowork-api: {error}
        </div>
      )}

      {channels.length === 0 && !error && (
        <p className="text-white/40 text-sm">No channels yet.</p>
      )}

      {channels.map(c => (
        <section key={c.id} className="bg-phone-card2 rounded-xl p-4 mb-3">
          <div className="flex items-baseline justify-between">
            <h2 className="text-white font-semibold">#{c.name}</h2>
            <span className="text-white/40 text-xs">
              {new Date(c.created_at).toLocaleDateString()}
            </span>
          </div>
        </section>
      ))}
    </div>
  )
}
```

**Step 5**, the loading skeleton (because the page is now async):

```tsx
// app/channels/loading.tsx
export default function Loading() {
  return (
    <div className="p-5">
      <div className="animate-pulse">
        <div className="h-6 w-32 bg-white/10 rounded mb-6" />
        {[0, 1, 2].map(i => (
          <div key={i} className="h-16 bg-phone-card2 rounded-xl mb-3" />
        ))}
      </div>
    </div>
  )
}
```

Now the `layoutId` morph from icon to AppView always has something to draw to; the data swaps in when the fetch resolves.

**Mutations (sending data)**

Use a Server Action. The page stays a Server Component; the form body lives in a small client component that calls the action.

```tsx
// app/channels/actions.ts
"use server"

import { coworkApi } from "@/lib/cowork-api"
import { revalidatePath } from "next/cache"

export async function createChannel(formData: FormData) {
  const name = String(formData.get("name") ?? "")
  if (!name) return
  // wire to the real endpoint per xo-cowork-api/docs
  await fetch(`${process.env.NEXT_PUBLIC_COWORK_API_URL}/channels`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ name }),
  })
  revalidatePath("/channels")
}
```

**Auth, briefly**

If xo-cowork-api expects a Clerk Bearer token (it does, per `xo-cowork-api/auth/clerk.py`), inject it server-side. Two options:

1. **Cookie-forwarding via Clerk session helper**: when you wire `@clerk/nextjs`, you can use `getToken()` inside the page and pass it into `coworkApi.listChannels({ token })`.
2. **Poll-token flow**: xo-cowork-api itself implements a poll-token handshake (see `claude_setup_token.py`). If the phone OS is logged into Swarm and Swarm mints the token, the phone can read it from Swarm via a Server Action.

Clerk is not wired yet in this repo (it is on the roadmap in `NEXTJS_MIGRATION_PLAN.md` §13). Until then, point this app at an unauthenticated dev endpoint or a token you paste into `.env.local`.

**Why this shape works well**

- Animations are perfect; you wrote the React.
- Bundle stays tiny; the heavy lifting is server-side.
- No CSP coordination required.
- You can deeply integrate with the OS shell (e.g. a future Notification Center can show channel activity).

---

## 6. Kind D: render xo-docs content

xo-docs is a Fumadocs site. Its content lives at `xo-docs/content/docs/**/*.mdx`. `source.config.ts` enables `postprocess.includeProcessedMarkdown: true`, which means xo-docs ships a `/docs/<slug>.mdx` data feed alongside the rendered pages.

Two strategies, pick one.

### 6.1 Runtime fetch from the deployed xo-docs site

Cheapest, no build-time coupling.

```ts
// lib/xo-docs.ts
const DOCS_BASE = process.env.NEXT_PUBLIC_XO_DOCS_URL ?? "https://docs.xo.builders"

export type DocPage = { slug: string; title: string; body: string }

export async function fetchDocPage(slug: string): Promise<DocPage | null> {
  // Adjust the path to whichever Fumadocs export shape xo-docs serves.
  // includeProcessedMarkdown ships processed markdown next to the rendered HTML.
  const res = await fetch(`${DOCS_BASE}/api/docs/${slug}`, { cache: "no-store" })
  if (!res.ok) return null
  return res.json()
}
```

```tsx
// app/docs/page.tsx (server)
import type { Metadata } from "next"
import { fetchDocPage } from "@/lib/xo-docs"
import { Markdown } from "@/components/Markdown"

export const metadata: Metadata = { title: "Docs, XO" }

export default async function DocsPage() {
  const page = await fetchDocPage("getting-started")
  if (!page) {
    return <div className="p-5 text-white/60 text-sm">Docs unavailable.</div>
  }
  return (
    <div className="p-5">
      <h1 className="text-2xl font-semibold tracking-tight mb-4">{page.title}</h1>
      <Markdown source={page.body} />
    </div>
  )
}
```

Pick a small Markdown component (we do not need full MDX). `react-markdown` + `remark-gfm` is fine; or a tiny purpose-built renderer if you want zero deps.

**Gotchas**

- xo-docs needs an endpoint that returns the processed Markdown JSON. Fumadocs supports this but you may need to expose it explicitly in `xo-docs/proxy.ts` or as a route handler.
- Styling: xo-docs uses Fumadocs CSS for code blocks, callouts, etc. You will not get those for free. Either re-create the styles you want (probably 80 lines of CSS) or import a subset of Fumadocs's CSS.

### 6.2 Build-time copy (recommended for handbook content)

Pull the MDX into this repo at build time and render with our own MDX pipeline. Stays decoupled (xo-docs remains the source of truth) but renders natively without any runtime fetch.

**Setup**

```bash
pnpm add fumadocs-mdx fumadocs-core
```

```ts
// source.config.ts (new, in xo-phone-os root)
import { defineDocs } from "fumadocs-mdx/config"

export const handbook = defineDocs({
  dir: "content/handbook",
})
```

```ts
// next.config.ts
import { createMDX } from "fumadocs-mdx/next"
const withMDX = createMDX()
export default withMDX(nextConfig)
```

**Sync the content** (manual or scripted):

```bash
# scripts/sync-docs.sh
rsync -a --delete \
  ../xo-docs/content/docs/getting-started/ \
  ./content/handbook/
```

Run before each release, or wire as a `prebuild` script.

**Render the handbook app**:

```tsx
// app/handbook/page.tsx (now a real Handbook, not a stub)
import type { Metadata } from "next"
import { handbook } from "@/source"  // generated by fumadocs-mdx
import Link from "next/link"

export const metadata: Metadata = { title: "Handbook, XO" }

export default function HandbookPage() {
  const pages = handbook.getPages()
  return (
    <div className="p-5">
      <h1 className="text-2xl font-semibold tracking-tight mb-4">Handbook</h1>
      <nav className="space-y-2">
        {pages.map(p => (
          <Link
            key={p.url}
            href={`/handbook${p.url}`}
            className="block bg-phone-card2 rounded-xl px-4 py-3 hover:bg-phone-card2/80"
          >
            {p.data.title}
          </Link>
        ))}
      </nav>
    </div>
  )
}
```

And a dynamic `app/handbook/[...slug]/page.tsx` that renders an individual MDX page using `handbook.getPage(slug)?.data.body`.

**Why this is the better long-term shape**

- No runtime dependency on xo-docs being reachable.
- Renders with the phone's own dark theme and typography; no Fumadocs CSS to wrestle with.
- Works in the Docker / k8s deploy without any cross-origin coordination.
- You can curate which docs end up on the phone (handbook subset versus full docs site).

### 6.3 Which to pick

| Question | Runtime fetch (6.1) | Build-time copy (6.2) |
|---|---|---|
| Are docs updated more often than this app is redeployed? | yes -> good | no -> good |
| Do you want to render only a curated subset? | hard | easy |
| Is the network reliability across phone -> docs.xo.builders solid? | required | not required |
| Do you want feature parity with the Fumadocs site (search, callouts, code blocks)? | hard | doable |
| Time to first working page | ~1 hour | ~half a day |

If unsure, start with 6.1 to validate the layout, then move to 6.2 when the handbook content becomes a real first-class app.

---

## 7. Cross-cutting tips

### Prefetching

`components/AppIcon.tsx` already calls `router.prefetch(app.path)` in its mount effect. Any internal route you add gets prefetched automatically. **No action needed** unless your page is huge; in that case consider splitting client-only parts behind dynamic imports.

External tiles (`href` set) skip prefetch and open in a new tab. That includes Kind B's iframe wrapper if you decide to make the tile open the external URL directly instead of embedding (set `href` and remove the `app/<route>/page.tsx`).

### The "external link" tile

If you do not want an in-OS app at all and just want a tile that launches the user out:

```ts
// data/apps.ts
{
  path: "/signup-external",
  label: "Sign up",
  glyph: "↗",
  tileClass: "...",
  href: "https://app.xo.builders/signup",
  dock: true,
}
```

The existing Sign up tile does this. `path` is still required (it identifies the tile and the `layoutId`), but `href` short-circuits the navigation and no `app/<route>/page.tsx` is needed.

### Dock slots

The dock holds 4 tiles. Today: Home, Coworker, Swarm, Sign up. Adding `dock: true` to a 5th `AppDef` will be silently dropped by `Dock.tsx` (it slices to 4). If you want to swap a dock app, remove `dock: true` from one of the current four first.

### Title vs label

- `label` is the tile label under the icon. Short; truncates at ~70px width.
- `navTitle` is the centered title in the AppView NavBar. Defaults to `label`. Use this when you want a longer title in-app but a short one on the home screen.

### Page bundle hygiene

Each Server Component page that fetches data adds zero client JS. Each `"use client"` component you add is shipped to the browser. Keep client components small and leaf-shaped where possible. Pattern: page is Server, page renders `<MyInteractiveBit />` which is the only client island.

### Working offline / no API

When `xo-cowork-api` is not running locally, your wrapper apps should fail soft: render an "Unavailable" panel instead of a stack trace. The pattern in §5 step 4 (`try/catch`, render `error`) is the baseline; copy it.

### Brand glyphs

Glyphs are 1 to 2 characters. Existing options seen in `data/apps.ts`: short letter combos ("Co", "Sw"), symbols ("$", "?", "↗", "Δ", "⚙", "i", "▶", "H"), emoji ("📖", "💬"). Stick with high-contrast against the tile background.

---

## 8. Worked summary: three new apps

By the end of doing all three:

```
data/apps.ts  +3 entries:
  /swarm-app       embeds xo-swarm via iframe        Kind B
  /channels        wraps xo-cowork-api list channels Kind C
  /handbook        renders xo-docs MDX               Kind D (already exists as stub)

new files:
  app/swarm-app/page.tsx                              minimal server
  app/swarm-app/swarm-frame.tsx                       "use client" iframe wrapper
  app/channels/page.tsx                               server, async, fetches
  app/channels/loading.tsx                            skeleton
  app/channels/actions.ts                             "use server" mutations
  lib/cowork-api.ts                                   typed API client
  lib/xo-docs.ts                                      fetch helper
  components/Markdown.tsx                             small md renderer
  content/handbook/**.mdx                             synced from xo-docs
  scripts/sync-docs.sh                                rsync glue
  source.config.ts                                    fumadocs-mdx wiring

env vars (added to .env.local and Dockerfile/entrypoint.sh):
  NEXT_PUBLIC_SWARM_URL
  NEXT_PUBLIC_COWORK_API_URL
  NEXT_PUBLIC_XO_DOCS_URL    (only if doing 6.1)

cross-repo coordination:
  xo-swarm next.config.ts          add CSP frame-ancestors for phone.xo.builders
  xo-cowork-api CORS               whitelist http://localhost:18002 and phone host
  xo-docs (only for 6.1)           expose processed markdown endpoint
```

---

## 9. What NOT to do

- **Do not render the status bar, dynamic island, home indicator, or back chevron from inside a page.** The shell owns those. If you find yourself adding a back button inside a `page.tsx`, stop, you already have one in `NavBar`.
- **Do not call `useRouter()` or `usePathname()` from a page that does not need them.** The OS shell already syncs route to context; pages that just render content do not need to know the route.
- **Do not store app state in a page.** State that should survive navigation lives in `PhoneContext`. State that should survive a reload lives somewhere persistent (cowork-api, Clerk session, localStorage). Page-level `useState` is fine for ephemeral UI but disappears on every `openApp`.
- **Do not change the `layoutId` format.** `app-tile-{path}` in both `AppIcon` and `AppView` is what powers the morph. Anything that breaks the pair breaks the animation.
- **Do not write into `.xo/`.** That directory is owned by the watcher service.

---

## 10. Where to read more

- `ARCHITECTURE.md`: full diagram of the Server/Client boundary, state model, and every existing file.
- `NEXTJS_MIGRATION_PLAN.md`: the locked-decision record for why Next 16 + Tailwind 4 + pnpm; useful when you need to argue about a stack tweak.
- `PLAN.md`: forward-looking phases (notifications, control center, switcher, themes).
- `../xo-cowork-api/docs/frontend-*.md`: the canonical xo-cowork-api endpoint surface.
- `../xo-docs/source.config.ts`: how the docs content collection is shaped, useful for Kind D.
- `CLAUDE.md` (workspace root): the canonical product story; helpful when a tile's copy needs the right framing.
