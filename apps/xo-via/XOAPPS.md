# XO Apps

The unit of content in xo-phone-os. This doc is the canonical reference for what an **XO App** is and the **five kinds** it can take. For step-by-step "how do I build one", see `ADDING_APPS.md`. For the full system architecture, see `ARCHITECTURE.md`.

---

## 1. What an XO App is

An **XO App** is one tile on the home screen, plus the experience launched when that tile is tapped.

Every XO App has two parts:

```
app/<route>/
├── app.ts        ← the manifest (always required, pure data)
└── page.tsx      ← the body (required for most kinds, omitted for kind: "external")
```

- **`app.ts`** declares the XO App. It exports a single `xoApp` constant produced by `defineXOApp(...)`. Pure data: no React, no JSX, no fetch, no server-only modules. Safe to bundle in any tree.
- **`page.tsx`** is the route body for kinds that have an in-OS view. It imports `xoApp` from its sibling `./app`, exports `metadata = xoApp.metadata`, and renders the body (usually inside `<XOAppShell app={xoApp}>`).

The OS shell owns the chrome (status bar, dynamic island, NavBar, back chevron, home indicator, swipe-up-to-home, the `layoutId` morph). The XO App owns the content. **An XO App never renders its own status bar or back button.**

```
                          ┌─────────────────────────────┐
                          │   XO Phone OS shell         │
                          │   (always rendered)         │
                          │                             │
                          │   StatusBar                 │
                          │   ┌──────────────────────┐  │
                          │   │ NavBar (title)       │  │
                          │   ├──────────────────────┤  │
                          │   │                      │  │
                          │   │  XO App content      │  │
                          │   │  (the page body)     │  │
                          │   │                      │  │
                          │   └──────────────────────┘  │
                          │   HomeIndicator             │
                          └─────────────────────────────┘
```

The shell reads everything it needs from `xoApp`: tile color, glyph, label, NavBar title, dock pinning, kind-specific rendering. There is exactly **one source of truth per app**.

---

## 2. The XOApp manifest

Every manifest is built with `defineXOApp()` from `lib/xo-app.ts`. The helper types the spec and auto-generates Next `Metadata`:

```ts
// app/coworker/app.ts
import { defineXOApp } from "@/lib/xo-app"

export const xoApp = defineXOApp({
  path: "/coworker",
  label: "Coworker",
  glyph: "Co",
  tile: "bg-gradient-to-br from-purple-500 to-fuchsia-700 text-white",
  dock: true,
  description: "The unit. A portable, containerized agent workspace.",
  featured: true,
  kind: "native",
})
```

### Shared fields (`XOAppBase`)

Every kind has these:

| Field | Type | Purpose |
|---|---|---|
| `path` | `string` | Route path, matches the directory under `app/`. Identifies the tile and powers the `layoutId="app-tile-{path}"` morph. |
| `label` | `string` | Tile label on the home screen. |
| `navTitle` | `string?` | In-app NavBar title. Defaults to `label`. Use when the home-screen tile needs a short label but the in-app title wants more room. |
| `glyph` | `string` | 1 to 2 chars or single emoji rendered inside the tile. |
| `tile` | `string` | Tailwind classes for the home-screen tile background. The same classes appear in the in-app header icon block when `featured: true`. |
| `dock` | `boolean?` | Pin to the dock. Max 4 dock pins app-wide; extras are silently dropped. |
| `description` | `string?` | SEO description and the optional tagline under the in-app header. Drives `<meta name="description">` and the shell header. |
| `featured` | `boolean?` | Render the large icon block in the in-app header. Default `false`. |

### The `kind` discriminator

One of `"native"`, `"external"`, `"iframe"`, `"api"`, or `"mdx"`. The discriminator selects which extra fields the manifest has and which shape the page (if any) takes.

### Auto-generated `metadata`

`defineXOApp(spec)` returns `spec` plus a `metadata` field:

```ts
{
  ...spec,
  metadata: {
    title: `${spec.label}, XO`,
    description: spec.description,   // omitted if undefined
  },
}
```

So pages do not hand-write metadata; they re-export the generated one:

```ts
// app/coworker/page.tsx
import { xoApp } from "./app"
export const metadata = xoApp.metadata
```

Rename "Coworker" -> "Coworkers" by editing `app/coworker/app.ts` exactly once. Tile label, in-app header label, page `<title>`, and meta description all update from that one edit.

---

## 3. The five kinds

### 3.1 `kind: "native"`

In-OS content rendered from the route's `page.tsx`. The most common kind and the default choice.

**When to use**

- Marketing pages (Coworker, Swarm, Pricing)
- Static long-form content
- Forms or interactive UI you fully control
- Settings, About, Changelog, Handbook, any roadmap stub

**Shape**

```ts
type XOAppNative = XOAppBase & { kind: "native" }
```

**Example**

```ts
// app/pricing/app.ts
export const xoApp = defineXOApp({
  path: "/pricing",
  label: "Pricing",
  glyph: "$",
  tile: "bg-gradient-to-br from-emerald-500 to-teal-700 text-white",
  description: "Usage-based. Free tier covers most teams.",
  kind: "native",
})
```

```tsx
// app/pricing/page.tsx
import { xoApp } from "./app"
import { XOAppShell } from "@/components/XOAppShell"

export const metadata = xoApp.metadata

export default function PricingPage() {
  return (
    <XOAppShell app={xoApp}>
      {/* your content here */}
    </XOAppShell>
  )
}
```

**Trade-offs**

- ✅ Zero client JS for the body (Server Component prerenders to HTML)
- ✅ Shell handles header, NavBar, transitions
- ✅ Smallest bundle of any kind
- ❌ Content must be expressible in JSX inside this repo

---

### 3.2 `kind: "external"`

A tile that opens an external URL in a new tab. **No `page.tsx` is needed**; the tile bypasses the in-OS shell entirely.

**When to use**

- Sign-up / login flows that live on a different domain
- Documentation, marketing, or partner sites that should not load inside the phone frame
- Anything that should obviously open a fresh tab

**Shape**

```ts
type XOAppExternal = XOAppBase & { kind: "external"; href: string }
```

**Example**

```ts
// app/signup-external/app.ts
export const xoApp = defineXOApp({
  path: "/signup-external",
  label: "Sign up",
  glyph: "↗",
  tile: "bg-gradient-to-br from-lime-400 to-lime-600 text-ink-900",
  dock: true,
  kind: "external",
  href: "https://app.xo.builders/signup",
})
```

No `page.tsx` exists. Visiting `/signup-external` directly returns a 404 by design. The `AppIcon` reads `kind: "external"`, skips `openApp()`, and calls `window.open(href, "_blank", "noopener,noreferrer")`.

**Trade-offs**

- ✅ Smallest possible app: one manifest, no body
- ✅ External site stays in its own security context
- ❌ No `layoutId` morph (the tile jumps straight to the new tab)
- ❌ Filtered out of the main home-screen grid; only renders in the dock (`HomeScreen` does `apps.filter(a => a.kind !== "external")`)

---

### 3.3 `kind: "iframe"`

The shell renders an `<iframe>` to a URL. The XO App "wraps" another site. **Requires a thin `page.tsx`** that renders `<XOAppShellIframe app={xoApp} />`.

**When to use**

- Embedding xo-swarm (the platform UI) as an in-OS app
- Wrapping any web app XO does not own when an in-frame experience is preferable to "open in new tab"
- Tools that need the phone OS chrome around them (back chevron, swipe-up to home)

**Shape**

```ts
type XOAppIframe = XOAppBase & {
  kind: "iframe"
  src: string                 // absolute URL to embed
  sandbox?: string            // override default iframe sandbox flags
}
```

**Example**

```ts
// app/swarm-app/app.ts
export const xoApp = defineXOApp({
  path: "/swarm-app",
  label: "Swarm",
  navTitle: "Swarm (live)",
  glyph: "Sw",
  tile: "bg-gradient-to-br from-sky-500 to-indigo-700 text-white",
  kind: "iframe",
  src: process.env.NEXT_PUBLIC_SWARM_URL ?? "https://app.xo.builders",
})
```

```tsx
// app/swarm-app/page.tsx
import { xoApp } from "./app"
import { XOAppShellIframe } from "@/components/XOAppShellIframe"

export const metadata = xoApp.metadata

export default function SwarmAppPage() {
  return <XOAppShellIframe app={xoApp} />
}
```

**Trade-offs**

- ✅ Drop an entire product into the phone with two files
- ✅ The OS shell still owns the chrome around the embed
- ❌ The embedded site must allow framing from this origin: it needs `Content-Security-Policy: frame-ancestors` (or no `X-Frame-Options: DENY`). See `ADDING_APPS.md` §4 for the cross-origin handshake.
- ❌ `layoutId` morph stops at the AppView container; the iframe paints over once the morph settles
- ❌ Auth context is whatever the embedded site decides (typically a fresh login)
- ❌ The embedded site may not be designed for a 393px phone viewport

---

### 3.4 `kind: "api"`

A page that fetches from an HTTP endpoint and renders the response natively. **Page is a Server Component**; fetch runs on the server, no API URL or auth token leaks to the client.

**When to use**

- Wrapping xo-cowork-api (list sessions, list channels, agent status)
- Any "show me my X from this backend" surface
- Lightweight dashboards backed by a JSON API
- When you want the phone OS look and feel **and** the `layoutId` morph to work cleanly

**Shape**

```ts
type XOAppApi = XOAppBase & {
  kind: "api"
  endpoint: string              // relative path, joined to your API base
  revalidate?: number | false   // Next data-cache strategy; false disables caching
}
```

**Example**

```ts
// app/channels/app.ts
export const xoApp = defineXOApp({
  path: "/channels",
  label: "Channels",
  glyph: "#",
  tile: "bg-gradient-to-br from-teal-500 to-cyan-700 text-white",
  description: "Live channels from your workspace.",
  kind: "api",
  endpoint: "/channels",
  revalidate: false,
})
```

```tsx
// app/channels/page.tsx
import { xoApp } from "./app"
import { XOAppShell } from "@/components/XOAppShell"
import { coworkApi } from "@/lib/cowork-api"

export const metadata = xoApp.metadata

export default async function ChannelsPage() {
  const channels = await coworkApi.listChannels()  // server fetch, auth applied server-side
  return (
    <XOAppShell app={xoApp}>
      {channels.map(c => (
        <section key={c.id} className="bg-phone-card2 rounded-xl p-4 mb-3">
          <h2 className="text-white font-semibold">#{c.name}</h2>
        </section>
      ))}
    </XOAppShell>
  )
}
```

Pair with `app/channels/loading.tsx` for a streaming skeleton so the `layoutId` morph has something to draw to while the fetch resolves. See `ADDING_APPS.md` §5 for the full pattern (typed client, Server Actions for mutations, auth notes).

**Trade-offs**

- ✅ Full phone OS look and animations
- ✅ Bundle stays tiny (fetch happens on the server)
- ✅ No CORS / CSP coordination required (server-side fetch)
- ✅ Auth tokens stay server-side
- ❌ Live updates require explicit revalidation, polling, or a websocket client (this kind is for "render once" semantics)

---

### 3.5 `kind: "mdx"`

Renders an MDX document from a content collection. **Page is a Server Component** that resolves the collection at build time.

**When to use**

- Pulling in xo-docs content (Handbook, Docs)
- Long-form content you want to author in Markdown alongside the rest of the docs ecosystem
- Static, versioned, build-time-rendered pages

**Shape**

```ts
type XOAppMdx = XOAppBase & {
  kind: "mdx"
  collection: string   // the fumadocs-mdx collection name (e.g. "handbook")
  slug: string         // the slug within that collection
}
```

**Example**

```ts
// app/handbook/app.ts
export const xoApp = defineXOApp({
  path: "/handbook",
  label: "Handbook",
  glyph: "H",
  tile: "bg-gradient-to-br from-blue-500 to-blue-800 text-white",
  description: "The XO operating handbook.",
  kind: "mdx",
  collection: "handbook",
  slug: "index",
})
```

The page resolves the MDX document at build time and renders it inside `<XOAppShell>`. See `ADDING_APPS.md` §6 for the two strategies (runtime fetch versus build-time copy with `fumadocs-mdx`) and which to pick.

**Trade-offs**

- ✅ Author content in Markdown alongside xo-docs
- ✅ Static prerender; near-zero runtime cost
- ✅ Content can be curated (you choose which docs land on the phone)
- ❌ Setup cost: needs `fumadocs-mdx` (or a smaller MDX renderer) and a content sync strategy
- ❌ Updates require a rebuild (this is also what makes it fast)

---

## 4. Choosing a kind

Quick decision guide. Walk top to bottom; first match wins.

| Question | Then |
|---|---|
| Should the tile open a different domain in a new tab? | **external** |
| Is the experience another web app you do not want to re-implement in this repo? | **iframe** |
| Is the experience "render data fetched from an HTTP API"? | **api** |
| Is the experience "render a Markdown document from a content collection"? | **mdx** |
| Otherwise: in-OS content you author here in JSX | **native** |

You can change a tile's kind later by editing only `app.ts` (and adjusting the matching `page.tsx`). The home-screen tile, the route, and the layoutId morph all keep working.

---

## 5. From manifest to home screen

`data/apps.ts` is the registry. It imports each `xoApp` from `app/<route>/app.ts` and exports the home-screen order:

```
app/coworker/app.ts ──┐
app/swarm/app.ts    ──┼──► data/apps.ts ──► HomeScreen renders icons
app/pricing/app.ts  ──┤                     DeviceFrame.findApp(current) → AppView
...                ──┘                     Dock renders dockApps()
app/signup-external/app.ts ──┘
```

**Registry rules**

- Order in the `apps` array is the home-screen order.
- `dockApps()` returns entries with `dock: true`, up to 4 are rendered.
- `HomeScreen` filters `apps.filter(a => a.kind !== "external")` for the main grid, so external tiles only appear in the dock.
- `findApp(path)` is what `DeviceFrame` uses to pick the right `xoApp` for the current route.

**Adding a new XO App** is one import line plus one entry in the `apps` array. Removing one is two deletes. The registry is the choke point for all home-screen behaviour.

---

## 6. Tile design language

Constants worth knowing when authoring a new manifest:

**`glyph`**: 1 to 2 characters or a single emoji. High contrast against the tile background. Existing patterns:

```
"Co", "Sw", "H", "C"     short letter combos
"$", "?", "↗", "Δ", "⚙"  symbols
"i", "▶"                  single ascii
"📖", "💬"                 emoji
"XO"                      brand
```

**`tile`**: any Tailwind background utility, but the established palette is two-stop gradients with the XO color system. Examples in `data/apps.ts`:

```
bg-gradient-to-br from-purple-500 to-fuchsia-700 text-white   Coworker
bg-gradient-to-br from-sky-500    to-indigo-700  text-white   Swarm
bg-gradient-to-br from-emerald-500 to-teal-700   text-white   Pricing
bg-gradient-to-br from-amber-400  to-orange-600  text-white   Customers
bg-gradient-to-br from-rose-500   to-red-700     text-white   Demo
bg-gradient-to-br from-slate-500  to-slate-700   text-white   Docs
bg-gradient-to-br from-zinc-600   to-zinc-800    text-white   About
bg-gradient-to-br from-lime-400   to-lime-600    text-ink-900 Home, Sign up
```

**`featured`**: when `true`, the in-app header includes a large icon block matching the home-screen tile (same gradient, same glyph). When `false`, the in-app header is just title + description. Use `featured: true` for "flagship" apps (Coworker, Swarm); leave `false` for utility apps (Pricing, Settings, stubs).

**`label` vs `navTitle` vs `description`**

- `label` is the tile under the icon. Truncates around 70px. Keep it under ~10 chars.
- `navTitle` is the in-app NavBar title. Use when `label` is too short for the in-app context (Talk -> "Talk to a human").
- `description` is the in-app tagline AND the SEO `<meta name="description">`. Keep it under one sentence.

---

## 7. What an XO App is NOT

- **Not a separate process.** Every XO App runs inside the same Next.js render. The "phone OS" metaphor is purely a UI shape; there is one server, one client bundle, one React tree.
- **Not a service worker or PWA app.** No background lifecycle.
- **Not its own auth context.** The phone OS shares auth across all apps. (Clerk integration is on the roadmap; see `NEXTJS_MIGRATION_PLAN.md` §13.)
- **Not allowed to render its own status bar, back chevron, dock, or home indicator.** Those belong to the OS shell. If you find yourself rendering one, stop and use `<XOAppShell>` (or `<XOAppShellIframe>` for `kind: "iframe"`).
- **Not coupled to a Next routing reserved name**. `app.ts` is a regular module file. Next ignores it. The routing magic is `page.tsx`.

---

## 8. See also

- **`lib/xo-app.ts`**: source of truth for `XOApp`, `XOAppBase`, `ResolvedXOApp`, `defineXOApp()`. Read this when the type system disagrees with you.
- **`components/XOAppShell.tsx`**: Server Component that renders the unified in-app header + children. Used by `native`, `api`, and `mdx` kinds.
- **`components/XOAppShellIframe.tsx`**: `"use client"` variant for `kind: "iframe"`. Manages onLoad state.
- **`data/apps.ts`**: the registry. One import per app, the order is the home-screen order.
- **`ADDING_APPS.md`**: step-by-step, worked examples for each kind. Covers the cross-cutting concerns (prefetch, dock slots, content sync, env vars).
- **`ARCHITECTURE.md`**: the full system, Server/Client boundary, user-journey diagrams, file-by-file reference.
