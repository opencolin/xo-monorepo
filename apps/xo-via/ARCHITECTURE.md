# xo-phone-os, Architecture

XO's marketing surface rendered as an iPhone-style phone OS, on Next.js 16 (App Router) with Turbopack and Tailwind 4. The viewport is the device on phones (full bleed) and the OS sits inside a phone-shaped frame on tablets and desktops. One app at a time, home grid, status bar, dock, home indicator. Clean-room implementation; iOS is referenced conceptually only.

This document describes what is **actually built today**. Forward-looking goals (paging, app switcher, notifications, control center, themes, Storybook, Clerk) live in `PLAN.md` and `NEXTJS_MIGRATION_PLAN.md`.

---

## 1. Stack

| Layer                | Choice                                                          | Notes |
|----------------------|-----------------------------------------------------------------|-------|
| Build / runtime      | Next.js 16.2.6 (App Router, Turbopack dev, `output: "standalone"`) | All routes prerender as static at `next build`. |
| Language             | TypeScript 5                                                    | `tsconfig.json` extends Next's defaults; `paths: { "@/*": ["./*"] }`. |
| UI                   | React 19.2.6                                                    | Server Components by default; one client boundary at `app/providers.tsx`. |
| Styles               | Tailwind 4 + PostCSS (`@tailwindcss/postcss`)                   | Brand tokens declared as CSS variables inside `app/globals.css` `@theme` block. No `tailwind.config.ts` needed. |
| Animation            | Framer Motion 11                                                | Shared-layout transitions (`layoutId`) morph an icon into its app view. Drag gestures power the home indicator. |
| Image pipeline       | `next/image` (sharp native, allowed via `pnpm.onlyBuiltDependencies`) | `public/` for static assets; no images shipped yet. |
| Fonts                | `next/font/google` (Inter, weights 400 to 900)                  | Loaded as `--font-inter` CSS variable, fed into Tailwind's `--font-sans`. |
| Routing              | App Router (`app/<route>/page.tsx`)                             | 13 user-facing routes + `/api/healthz`. |
| Linting              | ESLint 9 flat config (`eslint-config-next/core-web-vitals` + `/typescript`) | `eslint.config.mjs` |
| Package manager      | pnpm 10                                                         | `pnpm.onlyBuiltDependencies` allowlists sharp + unrs-resolver. |
| Deploy target        | Multi-stage Dockerfile, 3-stage (`deps` -> `builder` -> `runner`), Node 24-slim, runtime `entrypoint.sh` placeholder swap | k8s-ready. Container internal port 3000. |
| Dev port             | **18002** (`pnpm dev`, `pnpm start`)                            | Configured in `package.json` and `.claude/launch.json`. |

No data layer, no API beyond `/api/healthz`, no auth. Everything is static content.

`cacheComponents` is intentionally off (default) for Storybook 9 compatibility. When we adopt PPR / streaming we'll flip it explicitly and audit pages for `"use cache"` placement.

---

## 2. Repository layout

```
xo-phone-os/
├── next.config.ts              output: standalone, turbopack.root pin, no cacheComponents
├── postcss.config.mjs          plugin: @tailwindcss/postcss
├── eslint.config.mjs           flat config extending eslint-config-next
├── tsconfig.json               jsx: react-jsx, paths @/*: ./*, next plugin
├── package.json                pnpm scripts; pnpm.onlyBuiltDependencies allowlist
├── pnpm-lock.yaml
├── Dockerfile                  3-stage, pnpm-first, runtime env injection
├── entrypoint.sh               sed-swap NEXT_PUBLIC_* placeholders at container start
├── .nvmrc                      node 20
├── .gitignore                  excludes .next/, .xo/, node_modules, etc.
├── .claude/
│   ├── launch.json             next-dev / next-start, pinned to 18002 (autoPort: false)
│   └── settings.local.json
├── .xo/                        watcher service owns this; never write here
├── README.md
├── PLAN.md                     forward-looking design notes
├── NEXTJS_MIGRATION_PLAN.md    archived: how we got here from Gatsby
├── ARCHITECTURE.md             this file
├── LICENSE
├── public/                     static assets (empty today)
├── app/                        App Router
│   ├── layout.tsx              Server root: fonts, metadata, viewport, body
│   ├── providers.tsx           Client boundary, wraps PhoneProvider + DeviceFrame
│   ├── page.tsx                "/" route (Server) - HomeScreen renders from shell
│   ├── globals.css             @import "tailwindcss" + @theme + phone CSS
│   ├── loading.tsx             streaming skeleton
│   ├── api/healthz/route.ts    k8s liveness
│   ├── coworker/page.tsx       /coworker (Server, static long-form)
│   ├── swarm/page.tsx          /swarm
│   ├── pricing/page.tsx        /pricing
│   ├── settings/page.tsx       /settings
│   ├── about/page.tsx          /about (labelled "Why XO?")
│   ├── ask/page.tsx            /ask
│   ├── changelog/page.tsx
│   ├── customers/page.tsx
│   ├── demo/page.tsx
│   ├── docs/page.tsx
│   ├── handbook/page.tsx
│   └── talk-to-a-human/page.tsx
├── components/                 Client components ("use client")
│   ├── DeviceFrame.tsx         phone chrome (bezel, dynamic island, side buttons)
│   ├── StatusBar.tsx           live clock + decorative signal/wifi/battery
│   ├── HomeScreen.tsx          4-col grid, wallpaper, page dots, dock
│   ├── AppIcon.tsx             tile button + router.prefetch + "app-tile-{path}" layoutId
│   ├── Dock.tsx                up to 4 pinned apps
│   ├── AppView.tsx             full-bleed container matching AppIcon's layoutId
│   ├── NavBar.tsx              in-app top bar with back chevron
│   └── HomeIndicator.tsx       draggable bottom pill, swipe-up returns home
├── context/
│   └── PhoneContext.tsx        state, usePathname() sync, keyboard, clock
├── data/
│   └── apps.ts                 AppDef[] list, findApp(), dockApps()
└── types/
    └── index.ts                AppDef, PhoneStatus, AppViewProps
```

`.next/` (build artifacts) is gitignored. `.xo/` (watcher state) is gitignored. `node_modules/` is gitignored.

---

## 3. Server / Client boundary

The whole OS shell sits inside **one** `"use client"` island; every route body is a **Server Component** passed to the shell via React `children`.

```
                       ┌──────────────────────────────────────────┐
                       │            Next.js 16 build              │
                       │   prerenders one HTML page per route     │
                       │   under app/<route>/page.tsx             │
                       └──────────────────────────────────────────┘
                                          │
                                          ▼
        app/layout.tsx                       (SERVER)
          │  <html>, <body>, fonts, metadata, viewport
          │  imports <Providers>{children}</Providers>
          │
          ▼
        app/providers.tsx              ("use client") ◀── single client island
          │
          │  <PhoneProvider pageElement={children}>
          │    <DeviceFrame />
          │  </PhoneProvider>
          │
          ▼  context.pageElement = children
                                    │
        DeviceFrame                 │     (CLIENT)
          ├ StatusBar               │
          ├ if current==="/"        │
          │   → HomeScreen          │
          │       ├ Wallpaper       │
          │       ├ grid<AppIcon/>  │       (each AppIcon prefetches its route)
          │       └ Dock            │
          │ else                    │
          │   → AppView             │
          │       ├ NavBar          │
          │       └ {pageElement}◀──┘     ← page body inserted here
          └ HomeIndicator
```

Why it matters:

- Page bodies render as plain HTML at build time, ship as part of the document, and have **zero** hydration JS cost on their own.
- The OS shell hydrates once and lives across navigations; tapping an icon never tears down the shell.
- The `layoutId` morph transitions across that route swap because Framer Motion is in the shell, not in the page body.

---

## 4. State model

Single React context: `PhoneContext` in `context/PhoneContext.tsx`. Marked `"use client"` because it uses `usePathname()` / `useRouter()` from `next/navigation` and several React hooks.

```
PhoneContextValue
├── current: string                  "/" means home, otherwise the active app path
├── pageElement: ReactNode           the page element the Server route produced
├── backStack: string[]              in-app navigation history
├── switcherOpen: boolean            (overlay flag, no UI yet)
├── notificationsOpen: boolean       (overlay flag, no UI yet)
├── controlCenterOpen: boolean       (overlay flag, no UI yet)
├── status: { time, charge, wifi }   status bar payload (charge/wifi decorative)
└── actions
    ├── openApp(path)                push current onto backStack if it was an app, set current=path
    ├── goHome()                     current="/", clear backStack
    ├── pushBack(path)               in-app: push current, set current=path
    ├── pop()                        in-app: pop backStack into current, or goHome if empty
    ├── toggleSwitcher(v?)
    ├── toggleNotifications(v?)
    ├── toggleControlCenter(v?)
    └── closeAllOverlays()
```

Effects inside the provider:

1. **Location sync.** A `useEffect` watches `usePathname()` and writes the normalized path into `current`. Direct visits to `/pricing` boot the OS with the Pricing app already open.
2. **Clock tick.** A 15s `setInterval` updates `status.time` for `<StatusBar>`. Browser-only (guarded by `typeof window`).
3. **Keyboard.** `Escape` closes any open overlay; if none, goes home (and calls `router.push("/")` to keep URL in sync).

The provider takes a `pageElement` prop (not a `location` prop, unlike the Gatsby version). `app/providers.tsx` passes the layout's `children` as `pageElement`.

---

## 5. User journey, cold load

```
  User types https://phone.xo.builders/pricing
                  │
                  ▼
  ┌────────────────────────────────────────────────────────────┐
  │ Next.js serves the prebuilt /pricing HTML                  │
  │  ├ <html lang="en">                                        │
  │  │   <head>                                                │
  │  │     <title>Pricing, XO</title>                          │
  │  │     <meta name="theme-color" content="#08090A" />       │
  │  │   <body class="bg-ink-900 text-white">                  │
  │  │     <Providers>                                         │
  │  │       <PhoneProvider pageElement={<PricingPage/>}>      │
  │  │         <DeviceFrame/>                                  │
  │  │       </PhoneProvider>                                  │
  │  │     </Providers>                                        │
  │  └ <script src="/_next/static/chunks/..." />               │
  └────────────────────────────────────────────────────────────┘
                  │
                  ▼
  ┌────────────────────────────────────────────────────────────┐
  │ React hydrates the client island                           │
  │   usePathname() → "/pricing"                               │
  │   PhoneProvider: current = "/pricing", backStack = []      │
  │   pageElement = <PricingPage/> (already-rendered RSC)      │
  └────────────────────────────────────────────────────────────┘
                  │
                  ▼
  ┌────────────────────────────────────────────────────────────┐
  │ DeviceFrame mounts                                         │
  │   current !== "/" → <AppView app={findApp("/pricing")}/>   │
  │     reads { pageElement } from context                     │
  │     mounts <PricingPage/> inside NavBar + scroll container │
  └────────────────────────────────────────────────────────────┘
```

The user lands directly inside an app, framed by the phone shell. Hit the back chevron or the home indicator and `goHome()` runs alongside `router.push("/")`, swapping the AppView back to the HomeScreen.

---

## 6. User journey, tapping an app icon

This is where the shared-layout animation lives, and where the RSC fetch happens.

```
  Home screen visible. AppIcon for "/coworker":
  ┌─────────────────────────────────────┐
  │  <motion.span                       │
  │    layoutId="app-tile-/coworker"    │
  │    className="...purple tile..."    │
  │    >Co</motion.span>                │
  └─────────────────────────────────────┘

  AppIcon mount effect: router.prefetch("/coworker")
  → Next fetches /coworker RSC payload in the background
                  │
                  ▼  user taps
  ┌─────────────────────────────────────────────────────────────┐
  │ AppIcon.onActivate()                                        │
  │   if app.href → window.open(href)  and return               │
  │   else:                                                     │
  │     openApp("/coworker")     # context: current="/coworker" │
  │     router.push("/coworker") # next pushes the URL          │
  └─────────────────────────────────────────────────────────────┘
                  │
                  ├──► Next swaps in the prefetched RSC payload
                  │    for /coworker. layout.tsx re-renders with
                  │    children = <CoworkerPage/> (already a
                  │    rendered Server Component).
                  │
                  ▼
  ┌─────────────────────────────────────────────────────────────┐
  │ PhoneProvider                                               │
  │   usePathname() now "/coworker"                             │
  │   effect: lastSyncedPath was "/", normalize, setCurrent     │
  │   pageElement = <CoworkerPage/>                             │
  └─────────────────────────────────────────────────────────────┘
                  │
                  ▼
  ┌─────────────────────────────────────────────────────────────┐
  │ DeviceFrame re-renders                                      │
  │   current === "/coworker" → <AppView app={...}/>            │
  │     <motion.div                                             │
  │        layoutId="app-tile-/coworker"  ◀── same id as icon   │
  │        ...full bleed...                                     │
  │     >                                                       │
  │       <NavBar title="Coworker"/>                            │
  │       <div>{pageElement /* <CoworkerPage/> */}</div>        │
  │     </motion.div>                                           │
  └─────────────────────────────────────────────────────────────┘
                  │
                  ▼
  Framer Motion sees the same layoutId disappear (icon) and
  appear (AppView). It interpolates position, size, and border-
  radius between the two with a spring (stiffness 280, damping
  28), morphing the icon into the app. Reverse on back / home.
```

The prefetch in `AppIcon`'s mount effect is what keeps the morph smooth: without it, the layoutId interpolation could outpace the RSC fetch and visibly hitch. `app/loading.tsx` is the streaming fallback if the RSC payload still hasn't arrived when the morph wants something to draw into.

External tiles (only `Sign up` today, `href: https://app.xo.builders/signup`) bypass `openApp` and just call `window.open(href, "_blank")`.

---

## 7. User journey, leaving an app

Three paths back to home, plus an in-app back stack:

```
  In an app (e.g. /coworker)
  │
  ├── tap NavBar back chevron ──► NavBar.onBack()
  │       if backStack.length > 0 → pop() + router.back()
  │       else                    → goHome() + router.push("/")
  │
  ├── tap home indicator pill ──► HomeIndicator onClick
  │       if !isHome → goHome() + router.push("/")
  │
  ├── drag home indicator up ──► HomeIndicator onDragEnd
  │       if offset.y < -40 and !isHome → goHome() + router.push("/")
  │
  └── press Escape  ──► PhoneProvider keydown handler
          if any overlay open → closeAllOverlays()
          else if current !== "/" → goHome() + router.push("/")
```

After `goHome` + URL change, `current === "/"` and `<DeviceFrame>` swaps the `<AppView>` back out for `<HomeScreen>`. The reverse shared-layout animation snaps the app rectangle back into the icon tile.

In-app navigation (`pushBack`) is wired in `PhoneContext` but is not used by any page yet; pages today are flat single-screen views.

---

## 8. Responsive model

Two visual modes, switched purely with CSS:

```
  viewport width
  ─────────────
   < 600px               >= 600px (tablet / desktop)
  ─────────────         ──────────────────────────────────────────────
  full bleed            phone-shaped frame, centered on dark backdrop

  globals.css media     DeviceFrame inline + Tailwind:
  (max-width: 599px):   width  = min(393px, 92vw)
    .device-frame       height = min(852px, 90dvh)
      radius: 0         radius: 52px (frame) / 44px (screen)
      border: 0         border: 3px solid phone-metal
      shadow: none      shadow-device (large drop)
      w: 100vw          padding: 6px
      h: 100dvh         cosmetic side buttons + Dynamic Island shown
    .phone-backdrop     .phone-backdrop with radial XO glows
      bg: ink
```

No JS branching on viewport. React tree is identical in both modes; CSS decides what to show.

---

## 9. Routing model

Pure App Router file-based routing.

```
  app/coworker/page.tsx  →  /coworker
  app/page.tsx            →  /
  app/api/healthz/route.ts → GET /api/healthz (route handler)
```

Every page route exports:
- a default React function (the app body, a Server Component)
- `export const metadata: Metadata` (per-page title / description)

Tying routes to icons:

- `data/apps.ts` exports `apps: AppDef[]`. Each entry has a `path` that matches an `app/<route>/page.tsx` directory.
- `findApp(path)` looks up an `AppDef` by path; `dockApps()` filters by `dock: true`.
- `<DeviceFrame>` uses `findApp(current)` to pick the active app's nav title and tile id. If no app matches, it falls through to `<HomeScreen>`.

There is no central route table; adding an app is "new file at `app/<route>/page.tsx`, new entry in `data/apps.ts`".

---

## 10. Theming and brand

Tailwind 4 `@theme` block inside `app/globals.css` declares every brand token as a real CSS variable. Tailwind utilities (`bg-lime-400`, `text-ink-900`, `rounded-device`, `shadow-device`, `border-phone-divider`, etc.) are generated from these tokens automatically; no `tailwind.config.ts`.

```
  XO lime          #83d63a           (--color-lime-400, exposed in :root)
  Ink              #08090A           (--color-ink, --color-ink-900)
  Device bezel     #1c1c1e           (--color-phone-bezel)
  Device metal     #2c2c2e           (--color-phone-metal)
  Card / surface   #1c1c1e / #2c2c2e (--color-phone-card / --color-phone-card2)
  Divider          rgba(255,255,255,0.08) (--color-phone-divider)
  Device shadow    --shadow-device   (deep, layered drops)
  Frame radius     52px              (--radius-device)
  Screen radius    44px              (--radius-screen)
```

Fonts: Inter loaded via `next/font/google` (weights 400 to 900), exposed to CSS as `--font-inter` and used inside `--font-sans`. SF Pro Display and JetBrains Mono are declared as fallbacks for `--font-display` / `--font-mono`.

The XO chevron mark is drawn inline as SVG inside `HomeScreen` (wallpaper watermark) and `DeviceFrame` (desktop backdrop watermark) at 5 to 6 percent opacity.

---

## 11. Build, dev, and k8s pipeline

```
  pnpm install                              with pnpm.onlyBuiltDependencies allowlist
        │
        ▼
  ┌─────────────────────────────────────────────────────────────┐
  │ Native deps compiled: sharp (next/image), unrs-resolver.    │
  └─────────────────────────────────────────────────────────────┘
        │
        ├──► pnpm dev (port 18002)
        │       next dev --turbopack -p 18002
        │       HMR + RSC streaming + sub-second cold start
        │
        ├──► pnpm build
        │       next build → optimized production bundle
        │       All 13 routes + /api/healthz prerender as static
        │       .next/standalone/ is the self-contained server
        │
        ├──► pnpm start (port 18002)
        │       next start -p 18002 (local production preview)
        │
        ├──► pnpm lint
        │       eslint via eslint-config-next flat config
        │
        ├──► pnpm typecheck
        │       tsc --noEmit
        │
        └──► docker build -t xo-phone-os:dev .
                3 stages: deps, builder, runner (Node 24-slim)
                runner image ~150 MB, port 3000 inside container
                ENTRYPOINT ./entrypoint.sh swaps placeholders
                  __NEXT_PUBLIC_ENVIRONMENT__  → $NEXT_PUBLIC_ENVIRONMENT
                CMD node server.js
```

`.claude/launch.json` mirrors the two server entries (`next-dev` and `next-start`, both pinned to port 18002 with `autoPort: false`) so they are discoverable to preview tooling without drifting to a different port if 18002 is briefly busy. Free 18002 explicitly before starting.

K8s sizing (per `NEXTJS_MIGRATION_PLAN.md` §6.4):

```
  CPU request 100m / CPU limit 500m
  Memory request 128Mi / Memory limit 512Mi
  Replicas 2 for HA
  Readiness: GET /     returns 200
  Liveness:  GET /api/healthz returns 200 {"status":"ok"}
```

---

## 12. File-by-file reference

App Router glue:

- **`app/layout.tsx`** is the Server root. Loads Inter via `next/font/google`, exports `metadata` (title, description) and a separate `viewport` (theme color, viewport-fit). Mounts `<Providers>{children}</Providers>` inside the body. Adds `suppressHydrationWarning` because the font CSS variable is computed.
- **`app/providers.tsx`** is the lone `"use client"` boundary above the OS shell. Wraps `<PhoneProvider pageElement={children}><DeviceFrame/></PhoneProvider>`.
- **`app/globals.css`** imports Tailwind 4 and declares the `@theme` block (every brand token as a CSS variable), plus the phone shell rules (`phone-backdrop`, `phone-screen`, `app-icon-tile`, the `< 600px` full-bleed media query, focus ring).
- **`app/page.tsx`** is the "/" route. It is intentionally minimal because `DeviceFrame` renders `<HomeScreen/>` whenever `current === "/"`, so this body is mostly skipped. It exists so Next can prerender an HTML page for "/" (SEO + direct loads).
- **`app/<route>/page.tsx`** for each of the 12 other routes: a default-exported Server Component plus `export const metadata`. Renders the route body. No hooks, no Framer Motion, no `"use client"`.
- **`app/loading.tsx`** is the streaming skeleton. Next shows it while the RSC payload arrives during navigation, so the layoutId morph has something to draw into if prefetch missed.
- **`app/api/healthz/route.ts`** is a route handler that returns `{"status":"ok"}` with `force-static` so k8s liveness probes get a near-zero-latency 200.

Shell (all `"use client"`):

- **`context/PhoneContext.tsx`** owns all OS state and the `usePathname()` sync + keyboard + clock effects. Throws if `usePhone()` is called outside the provider. Uses `useRouter()` for programmatic navigation in keyboard/back/home handlers.
- **`components/DeviceFrame.tsx`** is the "is this a phone or a desktop view" boundary. It composes `StatusBar`, the main area (HomeScreen or AppView), and `HomeIndicator`. The desktop backdrop and the XO chevron watermark live here.
- **`components/StatusBar.tsx`** reads `status` from context, draws the time on the left and signal/wifi/battery icons on the right. All icons are inline SVG.
- **`components/HomeScreen.tsx`** renders the wallpaper (radial XO glow + chevron watermark), a 4-column icon grid (first 24 entries from `data/apps.ts`, filtering out `href` tiles), page dots placeholder, and the dock.
- **`components/AppIcon.tsx`** is the tappable tile. Owns the `layoutId="app-tile-{path}"` that pairs with `AppView`. Mounts a `router.prefetch(app.path)` effect so the route's RSC payload is already in the client cache by the time the user taps. External (`href`) tiles open a new tab; internal tiles call `openApp(path)` + `router.push(path)`.
- **`components/Dock.tsx`** lays out up to 4 pinned `AppIcon`s in a frosted bar.
- **`components/AppView.tsx`** is the full-bleed app container. The matching `layoutId` is what powers the shared-element morph. Reads the active route's React element from `usePhone().pageElement`.
- **`components/NavBar.tsx`** is the in-app top bar. Back chevron pops `backStack` (and calls `router.back()`) or, if empty, returns home.
- **`components/HomeIndicator.tsx`** is the draggable bottom pill. Tap or drag-up beyond 40px returns home.

Data:

- **`data/apps.ts`** is the source of truth for the icon grid: label, glyph, Tailwind tile classes, dock flag, optional external href.
- **`types/index.ts`** defines `AppDef`, `PhoneStatus`, `AppViewProps`.

Config:

- **`next.config.ts`** sets `output: "standalone"`, pins `turbopack.root` to this directory, declares `images.remotePatterns` (empty for now), opts out of React Compiler, and leaves `cacheComponents` off for Storybook compatibility.
- **`postcss.config.mjs`** wires `@tailwindcss/postcss` as the single PostCSS plugin.
- **`eslint.config.mjs`** is a flat ESLint 9 config spreading `eslint-config-next/core-web-vitals` and `/typescript`.
- **`tsconfig.json`** sets `jsx: "react-jsx"` (Next reconfigures this automatically), enables the `next` TypeScript plugin, and declares the `@/*` path alias.
- **`Dockerfile`** is a 3-stage Node 24-slim multi-stage build: `deps` (pnpm-first lockfile detection, cached pnpm store), `builder` (next build with `NEXT_PUBLIC_*` placeholders), `runner` (copies `.next/standalone` + `.next/static`, runs as `node`, exposes 3000).
- **`entrypoint.sh`** sed-swaps `__NEXT_PUBLIC_ENVIRONMENT__` (and any future placeholders) inside `.next/**/*.{js,html}` and `server.js` at container start, then execs the CMD.

---

## 13. Conventions worth knowing

1. **Pages are content, not chrome.** A page component renders only its inner UI. The status bar, nav bar, back chevron, and home indicator are added by the OS shell. Pages never render their own header.
2. **One app at a time.** The state model has no concept of "two apps open." Anything resembling multitasking belongs in a future overlay (switcher, control center) or a future second page in the home grid.
3. **`layoutId` discipline.** The format is exactly `app-tile-{path}`. Both `AppIcon` and `AppView` must use this format or the morph animation breaks.
4. **`data/apps.ts` is canonical.** A page directory with no entry in `apps.ts` will be reachable by URL but invisible from the home screen and rendered without a recognized `navTitle`.
5. **Dock + external apps.** Tiles with `href` are filtered out of the home grid and only show in the dock or other curated surfaces.
6. **Server vs Client.** Anything with hooks, event handlers, Framer Motion, or `next/navigation` is a `"use client"` component and lives under `components/` or `context/`. Anything in `app/<route>/page.tsx` is a Server Component by default; only add `"use client"` to a page if it genuinely needs to be interactive on its own (e.g. future Settings with Clerk).
7. **Prefetching.** `AppIcon` already calls `router.prefetch`. Any new icon-equivalent surface that triggers navigation should do the same to keep the `layoutId` morph smooth.
8. **No writes to `.xo/`.** The watcher service owns that directory; agent writes will conflict.
9. **Cache Components stays off** for now (Storybook compatibility). When flipping it on, every page needs an explicit `'use cache'` or dynamic marker pass.

---

## 14. Out of scope today

These are designed in `PLAN.md` and `NEXTJS_MIGRATION_PLAN.md` §13 but not built:

- Storybook 9 + `@storybook/nextjs-vite` integration
- App switcher overlay (`switcherOpen` state exists, no UI yet)
- Notification center pull-down (`notificationsOpen` state exists, no UI yet)
- Control center pull-up (`controlCenterOpen` state exists, no UI yet)
- Multiple home screen pages and page dot navigation
- Wallpaper / theme switching from Settings
- Clerk auth (`@clerk/nextjs`) on the Settings app
- Real handbook content (will come from `xo-docs`)
- MDX-backed long-form content
- Real device images and avatars (the `public/` directory is empty today)

When picking up any of these, the seam to extend is `PhoneContext` for state, `DeviceFrame` for layering above the screen, `data/apps.ts` for new icons, and (for content) a new directory under `app/<route>/`.
