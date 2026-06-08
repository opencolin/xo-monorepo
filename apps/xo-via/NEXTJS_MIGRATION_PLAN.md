# xo-phone-os Next.js migration plan

Detailed plan for porting the current Gatsby 5 scaffold to Next.js,
mirroring `xo-swarm`'s stack for consistency. Migration runs on a
git branch, in-place, no new folder. The XO desktop OS variant
(`xo-os`) is intentionally untouched.

## 1. Locked decisions

| Topic | Decision |
|---|---|
| Approach | In-place migration on a `nextjs-migration` branch off `main`. No new folder. Merge to `main` after parity verification. |
| Reference repo | `xo-swarm`. Stack and layout follow it exactly. |
| Next.js version | **16.2.6** (same as xo-swarm) |
| React | **19.2.6** (same as xo-swarm) |
| Router | App Router |
| Folder | `app/` at repo root, not `src/app/` (same as xo-swarm) |
| Package manager | **pnpm** (`pnpm-lock.yaml`). Diverges from xo-swarm on purpose. xo-phone-os already uses pnpm. Keeps the lockfile we have. |
| Tailwind | **v4** (upgrading from xo-swarm's v3). Faster Oxide engine, CSS-driven `@theme` config, no `tailwind.config.ts` needed. |
| Path alias | `@/*` → `./*` (same as xo-swarm) |
| Output mode | `output: "standalone"` (k8s-efficient; same as xo-swarm) |
| RSC strategy | Server components by default; client boundary only inside the OS shell |
| Target host | Same Dockerfile pattern as xo-swarm; deployable on k8s |
| Storybook | Out of scope here. Wire after migration. |
| `xo-os` | **No changes.** Stays on Gatsby. |

## 2. Branch strategy

```
main
  │
  ├── (current Gatsby state lives here)
  │
  └─► nextjs-migration         <─ all migration work happens here
       │
       ├── checkpoints / squash commits
       │   - chore: scaffold next.js skeleton
       │   - feat: port PhoneContext to App Router
       │   - feat: migrate pages
       │   - chore: standalone output + Dockerfile
       │   - test: parity smoke test
       │
       └─► merged back to main once parity is verified
```

Concrete:

```bash
cd xo-phone-os
git checkout -b nextjs-migration
# do the work in commits
# tag the pre-migration state on main: git tag gatsby-final HEAD~ before branching
```

If we ever need to revert, `git checkout main` returns to Gatsby
state instantly. If we want to compare the two at a point in time,
`git diff main..nextjs-migration -- src/components/` shows
component-level diffs.

## 3. xo-swarm patterns we copy verbatim

Reference snapshot of xo-swarm as of this writing:

**Stack**

```
next            16.2.6
react           19.2.6
react-dom       19.2.6
typescript      5.x
eslint          9.x   (flat config: eslint.config.mjs)
eslint-config-next  16.2.6
@clerk/nextjs   7.3.0
tailwindcss     via postcss.config.mjs
```

**Folder shape**

```
xo-swarm/
├── app/                  # App Router, NOT under src/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── globals.css
│   ├── loading.tsx
│   ├── (templates)/      # route groups
│   ├── api/
│   ├── actions/          # server actions
│   ├── db/
│   ├── launchpad/
│   ├── projects/
│   └── pricing/
├── components/           # flat, no src/
│   ├── conditional-layout.tsx
│   ├── theme-provider.tsx
│   ├── clerk-theme-provider.tsx
│   └── ui/               # shadcn primitives
├── hooks/
├── lib/
├── types/
├── public/
├── next.config.ts
├── next-env.d.ts
├── tsconfig.json         # paths: { "@/*": ["./*"] }
├── postcss.config.mjs
├── eslint.config.mjs
├── components.json       # shadcn
├── Dockerfile            # 3-stage multi-stage
├── entrypoint.sh         # runtime env-var swap
└── package.json
```

**next.config.ts (verbatim, applies to us)**

```ts
import type { NextConfig } from "next"
const nextConfig: NextConfig = {
  cacheComponents: true,
  output: "standalone",
  reactCompiler: false,
  devIndicators: { position: "bottom-right" },
  images: { remotePatterns: [/* add what we need */] },
  experimental: { serverActions: { bodySizeLimit: "100mb" } },
}
export default nextConfig
```

**tsconfig.json highlights**

- `target: ES2017`
- `module: esnext`, `moduleResolution: bundler`
- `jsx: react-jsx`
- `plugins: [{ name: "next" }]`
- `paths: { "@/*": ["./*"] }`
- includes `.next/types/**/*.ts` and `.next/dev/types/**/*.ts`

**Dockerfile**

Three stages: `deps`, `builder`, `runner`. Lockfile-aware
(pnpm/yarn/npm). Node 24-slim. Builds with placeholder
`NEXT_PUBLIC_*` values. Runtime entrypoint.sh swaps the placeholders
with real env vars. Lets one image run in any environment.

We will copy this Dockerfile + entrypoint.sh almost verbatim, with
one adjustment: reorder the lockfile detection to try
`pnpm-lock.yaml` first.

### Where we deviate from xo-swarm (intentionally)

| Decision | xo-swarm | xo-phone-os | Why |
|---|---|---|---|
| Package manager | Yarn 1 (yarn.lock) | **pnpm** (pnpm-lock.yaml) | xo-phone-os already uses pnpm; no reason to switch lockfiles for one project |
| Tailwind | v3 | **v4** | New scaffold should ship on the current major. v4's Oxide engine is faster, CSS-driven config is cleaner |

Everything else copies xo-swarm exactly.

## 4. Target stack for xo-phone-os

Keep everything xo-phone-os already has that is not Gatsby-specific:

- Framer Motion 11 (animations)
- **Tailwind 4** (upgrade from the v3 we scaffolded with). Uses the
  new Oxide engine. Brand tokens move from `tailwind.config.ts` into
  a CSS `@theme` block inside `app/globals.css`. PostCSS plugin
  becomes `@tailwindcss/postcss` instead of plain `tailwindcss`.
  Content paths auto-detected; no `content[]` config needed.
- TypeScript 5
- Inter font (now loaded via `next/font/google` instead of a CDN)
- Lucide icons (same as xo-swarm)
- Clerk Phase 5: install `@clerk/nextjs@7.3.0` when we wire auth

Drop what is Gatsby-only:

- `gatsby`, `gatsby-*` plugins
- `react-helmet` and `@types/react-helmet` (replaced by Next Metadata API)
- `gatsby-browser.tsx`, `gatsby-ssr.tsx`, `gatsby-config.ts`
- The `wrapPageElement` plumbing
- The old `tailwindcss@3` + `autoprefixer` pair (Tailwind 4's PostCSS
  plugin includes vendor prefixing)

## 5. Server vs Client component plan

### 5.1 Boundary

```
                                          ┌────────────────────────┐
                                          │  Server boundary       │
                                          │  (RSC, no JS shipped)  │
                                          └────────────────────────┘
                                                       │
   app/layout.tsx                        SERVER ───────┤
     │  <html>, <body>, fonts, metadata               │
     │  imports <Providers>                           │
     ▼                                                │
   app/providers.tsx ("use client") <─── CLIENT ─────┤
     │                                                │
     │  <PhoneProvider>                               │
     │    <DeviceFrame pageElement={children} />      │
     │  </PhoneProvider>                              │
     │                                                │
     │  (DeviceFrame, StatusBar, HomeScreen,          │
     │   AppIcon, Dock, AppView, NavBar,              │
     │   HomeIndicator are all CLIENT because         │
     │   they use Framer Motion / hooks)              │
     ▼                                                │
   children = the route's page.tsx, passed as React  │
   children from layout.tsx                          │
                                                     │
   app/(routes)/<route>/page.tsx       SERVER ───────┘
     - These are Server Components by default
     - Static markup, no hydration cost
     - When the user opens an app, the route's page
       renders as HTML and gets handed to the client
       DeviceFrame via React `children`
```

Rule of thumb:

- Anything with `useState`, `useEffect`, `useRef`, event handlers,
  Framer Motion, `next/navigation` hooks: **client**.
- Anything that is pure markup of strings, lists, tables, headings,
  even with `<a>` and `<Link>`: **server**.

### 5.2 Which xo-phone-os components are which

| Component | Boundary | Why |
|---|---|---|
| `app/layout.tsx` | Server | Fonts, metadata, providers tree root |
| `app/providers.tsx` | Client | Hosts `PhoneProvider` + `DeviceFrame` |
| `PhoneContext.tsx` | Client | useState/useEffect/usePathname |
| `DeviceFrame.tsx` | Client | useState through usePhone() |
| `StatusBar.tsx` | Client | live clock |
| `HomeScreen.tsx` | Client | wraps motion.div, AnimatePresence |
| `Dock.tsx` | Client | uses AppIcon |
| `AppIcon.tsx` | Client | motion.button, useRouter, usePhone |
| `AppView.tsx` | Client | motion.div with layoutId |
| `NavBar.tsx` | Client | useRouter |
| `HomeIndicator.tsx` | Client | drag handler |
| `app/page.tsx` (home) | Server | static stub (home screen renders from DeviceFrame anyway) |
| `app/coworker/page.tsx` | Server | static long-form |
| `app/swarm/page.tsx` | Server | static long-form |
| `app/pricing/page.tsx` | Server | static cards |
| `app/settings/page.tsx` | Client (mixed) | will eventually call Clerk; ship as Server for v1, swap when wiring auth |
| Stub pages | Server | trivial markup |

### 5.3 Perf impact of this split

**Good**

- Initial JS bundle ~10 to 20% smaller because page bodies are
  server-rendered, not shipped as JS modules.
- Cold load TTI ~5 to 15% faster on a representative profile.
- HTML for each route is fully prerendered at build time, then the
  client takes over for the shell.

**Neutral**

- Once interactive, behavior is identical. Animations, state,
  routing run in client React just like before.

**The one thing to watch**

When the user taps an app icon, the layoutId transition starts
client-side, but Next has to fetch the new route's RSC payload to
render its body inside `AppView`. If that fetch is slow, the
transition hitches.

Mitigations (in order of cost):

1. **Default prefetch on Links**. `next/link` prefetches visible
   links automatically in production. Our AppIcon should render a
   `<Link prefetch>` underneath, not just a button.
2. **Loading boundaries**. Add `app/<route>/loading.tsx` files so
   Next streams a skeleton while the RSC payload arrives. The
   layoutId transition can finish on the skeleton, then the real
   content swaps in.
3. **Keep page bodies small.** ~5 to 30 KB of RSC per page is fine.
   If a page balloons (long handbook, real demos), code-split into
   client components or use streaming.
4. **Fallback**: if a specific app's animation is visibly stuttering,
   convert just that page to a Client Component with a fixed import.

Net: server-first is a clear win for our case. The transition risk
is small and well-understood.

## 6. K8s-efficient build

Three things make this work on k8s the way xo-swarm does:

### 6.1 `output: "standalone"`

In `next.config.ts`. Next builds `.next/standalone/` containing only
the files needed to run the app. Combined with a multi-stage
Docker build, the runtime image stays ~150 MB or smaller.

### 6.2 Multi-stage Dockerfile (adapted from xo-swarm, pnpm-first)

```dockerfile
# syntax=docker.io/docker/dockerfile:1
ARG NODE_VERSION=24.13.0-slim

FROM node:${NODE_VERSION} AS deps
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends git ca-certificates \
    && rm -rf /var/lib/apt/lists/*
COPY package.json pnpm-lock.yaml* yarn.lock* package-lock.json* .npmrc* ./
RUN --mount=type=cache,target=/root/.local/share/pnpm/store \
    --mount=type=cache,target=/usr/local/share/.cache/yarn \
    if [ -f pnpm-lock.yaml ]; then \
      corepack enable pnpm && pnpm install --frozen-lockfile; \
    elif [ -f yarn.lock ]; then \
      corepack enable yarn && yarn install --frozen-lockfile --production=false; \
    elif [ -f package-lock.json ]; then \
      npm ci --no-audit --no-fund; \
    else \
      echo "No lockfile found." && exit 1; \
    fi

FROM node:${NODE_VERSION} AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NODE_ENV=production
# Placeholders: entrypoint.sh substitutes at runtime
ENV NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_ZXhhbXBsZS5jb20k
ENV NEXT_PUBLIC_API_BASE_URL=__NEXT_PUBLIC_API_BASE_URL__
ENV NEXT_PUBLIC_ENVIRONMENT=__NEXT_PUBLIC_ENVIRONMENT__
RUN if [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm build; \
    elif [ -f yarn.lock ]; then corepack enable yarn && yarn build; \
    else npm run build; fi

FROM node:${NODE_VERSION} AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
COPY --from=builder --chown=node:node /app/public ./public
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static
COPY --chmod=755 entrypoint.sh /usr/local/bin/entrypoint.sh
USER node
EXPOSE 3000
ENTRYPOINT ["entrypoint.sh"]
CMD ["node", "server.js"]
```

### 6.3 entrypoint.sh (copied + trimmed from xo-swarm)

```sh
#!/bin/sh
set -e
replace_placeholder() {
  local placeholder="$1"
  local value="$2"
  if [ -n "$value" ]; then
    find /app/.next -type f \( -name "*.js" -o -name "*.html" \) \
      -exec sed -i "s|${placeholder}|${value}|g" {} +
    find /app -maxdepth 1 -name "server.js" \
      -exec sed -i "s|${placeholder}|${value}|g" {} +
  fi
}
replace_placeholder "pk_test_ZXhhbXBsZS5jb20k" "$NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY"
replace_placeholder "__NEXT_PUBLIC_API_BASE_URL__" "$NEXT_PUBLIC_API_BASE_URL"
replace_placeholder "__NEXT_PUBLIC_ENVIRONMENT__" "$NEXT_PUBLIC_ENVIRONMENT"
echo "Runtime env injected successfully"
exec "$@"
```

Result: one image, runs anywhere we set env vars. Perfect for k8s
ConfigMap / Secret-driven deploys across staging and prod.

### 6.4 Container sizing on k8s

Estimated for a marketing-traffic load (low):

| Resource | Sizing |
|---|---|
| CPU request | 100m |
| CPU limit | 500m |
| Memory request | 128Mi |
| Memory limit | 512Mi |
| Replicas | 2 for HA |
| Readiness | GET / returns 200 |
| Liveness | GET /api/healthz returns 200 (add a tiny route handler) |

## 7. Step-by-step migration

Estimated 2 to 3 engineering days. Order matters; each step keeps
the branch buildable.

### Phase A: scaffold (half day)

1. `git checkout -b nextjs-migration`
2. `git tag gatsby-final` on the last Gatsby commit so we can diff
   forever.
3. Create `next.config.ts`, `tsconfig.json`, `eslint.config.mjs`,
   `postcss.config.mjs` mirroring xo-swarm's. Path alias `@/*`.
4. Update `package.json`:
   - Remove all `gatsby*` deps, `react-helmet`, the old
     `tailwindcss@3` + `autoprefixer` pair, and `gatsby-plugin-postcss`.
   - Remove the `pnpm.onlyBuiltDependencies` Gatsby entries
     (`gatsby`, `gatsby-cli`, `core-js`, `core-js-pure`, `es5-ext`).
     Keep `sharp`, `@parcel/watcher`, `lmdb`, `msgpackr-extract` if
     anything still depends on them; otherwise drop the whole pnpm
     section.
   - Add: `next@16.2.6`, `react@19.2.6`, `react-dom@19.2.6`,
     `eslint@9`, `eslint-config-next@16.2.6`,
     `tailwindcss@^4`, `@tailwindcss/postcss@^4`.
   - Scripts: `dev`, `build`, `start`, `lint`.
   - **Keep the existing `pnpm-lock.yaml`.** Run `pnpm install` to
     resolve the new deps. Do not switch package managers.
5. Replace `postcss.config.js` with `postcss.config.mjs`:

   ```js
   export default {
     plugins: { "@tailwindcss/postcss": {} },
   }
   ```

6. Move `src/styles/global.css` → `app/globals.css` and rewrite the
   top of the file for Tailwind 4:

   ```css
   @import "tailwindcss";

   @theme {
     --color-lime-50:  #f4faec;
     --color-lime-400: #83d63a;
     --color-lime-500: #6cbd2c;
     --color-ink-900:  #08090A;
     --color-phone-bezel:   #1c1c1e;
     --color-phone-metal:   #2c2c2e;
     --color-phone-screen:  #000000;
     --color-phone-card:    #1c1c1e;
     --color-phone-card2:   #2c2c2e;
     --color-phone-divider: rgba(255,255,255,0.08);
     --font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;
     --radius-device: 52px;
     --radius-screen: 44px;
     --shadow-device: 0 50px 120px -30px rgba(0,0,0,0.7), 0 25px 60px -15px rgba(0,0,0,0.5);
   }

   /* keep the rest of the existing CSS (wallpaper, media queries,
      app-icon-tile, etc.) as-is, it's regular CSS and still works */
   ```

7. Delete `tailwind.config.ts` entirely. Tailwind 4 auto-detects
   class usage; no `content[]` config needed. (Keep a minimal one
   only if you want plugin support later.)
8. Delete `gatsby-browser.tsx`, `gatsby-ssr.tsx`, `gatsby-config.ts`,
   `.cache/`, `public/` (Gatsby builds into `public/`; Next uses
   `public/` for static assets; verify before deleting).

### Phase B: app root (half day)

9. Create `app/layout.tsx`:

```tsx
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Providers } from "./providers"
import "./globals.css"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })

export const metadata: Metadata = {
  title: "XO, Workspaces for AI agents",
  description: "XO is workspaces for AI agents.",
  themeColor: "#08090A",
  viewport: { width: "device-width", initialScale: 1, viewportFit: "cover" },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <body className="bg-ink-900 text-white">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
```

10. Create `app/providers.tsx`:

```tsx
"use client"
import { PhoneProvider } from "@/context/PhoneContext"
import { DeviceFrame } from "@/components/DeviceFrame"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PhoneProvider pageElement={children}>
      <DeviceFrame />
    </PhoneProvider>
  )
}
```

### Phase C: port the OS shell (half day)

11. Move `src/components/*` → `components/*` (drop `src/`).
12. Add `"use client"` to the top of every shell file (DeviceFrame,
    StatusBar, HomeScreen, AppIcon, Dock, AppView, NavBar,
    HomeIndicator).
13. Move `src/context/PhoneContext.tsx` → `context/PhoneContext.tsx`,
    add `"use client"` at top, swap:
    - `location` prop → `usePathname()` from `next/navigation`
    - any `navigate()` calls → `useRouter().push()`
    - The `element` prop becomes `pageElement` prop, sourced from
      `Providers`.
14. Move `src/data/apps.ts` → `data/apps.ts`. Update all `import`
    paths from `../` to `@/`.
15. Move `src/types/index.ts` → `types/index.ts`.

### Phase D: port pages (half day)

16. For each `src/pages/<route>.tsx` create `app/<route>/page.tsx`:
    - `src/pages/index.tsx` → `app/page.tsx`
    - `src/pages/coworker.tsx` → `app/coworker/page.tsx`
    - `src/pages/swarm.tsx` → `app/swarm/page.tsx`
    - `src/pages/pricing.tsx` → `app/pricing/page.tsx`
    - `src/pages/settings.tsx` → `app/settings/page.tsx`
    - All stub pages similarly: `app/customers/page.tsx`,
      `app/demo/page.tsx`, etc.
17. Each becomes a default-export React function (no PageProps; use
    Next 16 segment params if needed). Server Components, no
    `"use client"`.
18. Replace `Head` exports with `export const metadata: Metadata = {...}`.
19. Add a top-level `app/loading.tsx` and per-route
    `app/<route>/loading.tsx` for smooth transitions.

### Phase E: k8s build path (half day)

20. Copy the Dockerfile + entrypoint.sh from section 6 into the repo
    (pnpm-first lockfile detection). Swap project names and env vars.
21. Add `output: "standalone"` to `next.config.ts`.
22. Add an `app/api/healthz/route.ts` returning 200 for k8s liveness.
23. Build the image locally: `docker build -t xo-phone-os:dev .`
24. Run it: `docker run -p 3000:3000 -e NEXT_PUBLIC_ENVIRONMENT=dev xo-phone-os:dev`
25. Verify the home screen + a navigation cycle works.

### Phase F: parity verification (~2 hours)

26. Smoke test in dev:
    - `pnpm dev` boots without errors
    - Home screen renders with all icons
    - Tap Coworker, AppView opens with layoutId animation
    - NavBar back returns to home
    - Swipe up on HomeIndicator returns to home
    - Esc closes overlays / returns home
    - Phone viewport (<600px) renders full-bleed without device frame
    - Desktop viewport renders the phone in the center
27. Lighthouse / build size check: compare bundle of `.next/static`
    JS chunks against a baseline.
28. `pnpm build && pnpm start` works for production preview.

### Phase G: cleanup + merge (1 hour)

29. Remove anything Gatsby-residual: `_reference` symlink, etc.
30. Update `README.md`: install via `pnpm install`, run via
    `pnpm dev`, port `:3000` instead of `:18002` (xo-swarm uses
    `:3000`; switch for consistency).
31. Update `PLAN.md` to note the stack swap.
32. Squash commits to a clean history if desired.
33. PR to `main`. Once approved, merge.

## 8. File-by-file mapping

```
GATSBY                                            NEXT.JS

src/styles/global.css                       →    app/globals.css  (rewrite top: @import "tailwindcss"; + @theme block)
tailwind.config.ts                          →    DELETE (Tailwind 4 needs no content config)
postcss.config.js                           →    postcss.config.mjs  (plugin: @tailwindcss/postcss)
src/context/PhoneContext.tsx                →    context/PhoneContext.tsx  + "use client"
src/components/DeviceFrame.tsx              →    components/DeviceFrame.tsx + "use client"
src/components/StatusBar.tsx                →    components/StatusBar.tsx + "use client"
src/components/HomeScreen.tsx               →    components/HomeScreen.tsx + "use client"
src/components/Dock.tsx                     →    components/Dock.tsx + "use client"
src/components/AppIcon.tsx                  →    components/AppIcon.tsx + "use client"
src/components/AppView.tsx                  →    components/AppView.tsx + "use client"
src/components/NavBar.tsx                   →    components/NavBar.tsx + "use client"
src/components/HomeIndicator.tsx            →    components/HomeIndicator.tsx + "use client"
src/data/apps.ts                            →    data/apps.ts
src/types/index.ts                          →    types/index.ts

src/pages/index.tsx                         →    app/page.tsx                       (server)
src/pages/coworker.tsx                      →    app/coworker/page.tsx              (server)
src/pages/swarm.tsx                         →    app/swarm/page.tsx                 (server)
src/pages/pricing.tsx                       →    app/pricing/page.tsx               (server)
src/pages/customers.tsx                     →    app/customers/page.tsx             (server)
src/pages/demo.tsx                          →    app/demo/page.tsx                  (server)
src/pages/docs.tsx                          →    app/docs/page.tsx                  (server)
src/pages/about.tsx                         →    app/about/page.tsx                 (server)
src/pages/changelog.tsx                     →    app/changelog/page.tsx             (server)
src/pages/handbook.tsx                      →    app/handbook/page.tsx              (server)
src/pages/ask.tsx                           →    app/ask/page.tsx                   (server)
src/pages/talk-to-a-human.tsx               →    app/talk-to-a-human/page.tsx       (server)
src/pages/settings.tsx                      →    app/settings/page.tsx              (server v1)

gatsby-browser.tsx                          →    DELETE (replaced by app/layout.tsx + app/providers.tsx)
gatsby-ssr.tsx                              →    DELETE
gatsby-config.ts                            →    DELETE (replaced by next.config.ts)
                                            →    NEW: app/layout.tsx
                                            →    NEW: app/providers.tsx
                                            →    NEW: app/loading.tsx
                                            →    NEW: app/api/healthz/route.ts
                                            →    NEW: next.config.ts
                                            →    NEW: next-env.d.ts (auto)
                                            →    NEW: Dockerfile
                                            →    NEW: entrypoint.sh
                                            →    NEW: eslint.config.mjs
                                            →    NEW: postcss.config.mjs (matching xo-swarm format)
```

## 9. Verification checklist

Before merging the branch:

- [ ] `pnpm dev` boots without warnings
- [ ] `pnpm lint` clean
- [ ] `pnpm build` produces `.next/standalone/`
- [ ] `pnpm start` serves the built app on `:3000`
- [ ] `pnpm-lock.yaml` still resolves cleanly; no spurious yarn.lock created
- [ ] All 13 routes render: `/`, `/coworker`, `/swarm`, `/pricing`,
      `/customers`, `/demo`, `/docs`, `/about`, `/changelog`,
      `/handbook`, `/ask`, `/talk-to-a-human`, `/settings`
- [ ] Icon-to-app transitions animate without visible hitch
- [ ] HomeIndicator swipe-up returns to home
- [ ] Browser back navigates correctly
- [ ] Esc closes app / overlays
- [ ] Status bar clock updates
- [ ] Phone viewport (< 600px) collapses device frame
- [ ] Lighthouse: Performance >= 95, Accessibility >= 95
- [ ] Initial JS bundle <= 100 KB gzipped (target; baseline today is ~80 to 110 KB on Gatsby)
- [ ] Docker image builds: `docker build -t xo-phone-os:test .`
- [ ] Docker image runs: `docker run -p 3000:3000 xo-phone-os:test` and `/` responds 200
- [ ] entrypoint.sh placeholder swap works: run with explicit env vars and confirm they appear in HTML

## 10. Rollback plan

If migration breaks in a way we cannot recover from:

```bash
git checkout main   # back to Gatsby instantly
# or
git checkout gatsby-final
```

We do not delete the Gatsby code until the migration is merged AND
the production deploy is stable for at least a week. Even after,
keep the `gatsby-final` tag forever for reference.

## 11. Risks

| Risk | Likelihood | Mitigation |
|---|---|---|
| layoutId transition hitches due to RSC fetch | Medium | `next/link` prefetch + loading.tsx skeletons |
| `"use client"` forgotten on a hook-using component | Medium | TS will not catch it; the dev server will. Lint rule `react-hooks/rules-of-hooks` flags some cases. Code review is the actual safety net. |
| Tailwind 4 upgrade surprises (utility class semantics, plugin API) | Medium | Walk the Tailwind 4 migration notes once; arbitrary values, default ring color, and `space-x-*` reset semantics changed. We have <50 classes total, so the audit is short |
| Tailwind 4 PostCSS plugin version skew | Low | Pin `tailwindcss` and `@tailwindcss/postcss` to the same minor in package.json |
| pnpm strictness reveals an unmet peer dep | Low | Use `pnpm install` (not `--shamefully-hoist`); resolve any peer issues at the top level |
| Stack divergence from xo-swarm (pnpm vs yarn, Tailwind 4 vs 3) | Low | Both stacks Just Work on Next 16; consistency cost is documentation, not runtime |
| `next/font` Inter doesn't match the previous CDN Inter weights | Low | `next/font/google` supports all weights; specify explicitly |
| `next/image` warnings on existing img tags | Low | Replace any `<img>` we add with `<Image>` later; not urgent for v1 |
| App Router cache-components causing stale renders during dev | Low | Same setting xo-swarm uses successfully |
| Standalone output missing public/ files at runtime | Low | Dockerfile copies public/ explicitly; verified during phase E |

## 12. Open questions resolved

From `../XO_PHONE_NEXTJS.md` section 11:

1. **App Router vs Pages Router?** App Router. Matches xo-swarm.
2. **Server Components for any of our content?** Yes, for everything
   under `app/<route>/page.tsx`. The shell is client; pages are
   server.
3. **Bundle target: edge vs node runtime?** Node. Matches xo-swarm
   and is required for `output: "standalone"`.
4. **Turbopack vs Webpack?** Turbopack (Next 16 dev default).
5. **Migrate xo-os too?** No. Confirmed by user. xo-os stays on
   Gatsby intentionally.

## 13. Out of scope (intentionally)

- Storybook setup. Land it after migration. See
  `../STORYBOOK.md` for the integration plan.
- Clerk auth. Phase 5 per `PLAN.md`. After migration, install
  `@clerk/nextjs@7.3.0` (matching xo-swarm) and wrap providers.
- Real handbook content. Comes from `xo-docs` in a later phase.
- Visual regression / Chromatic. Tie to Storybook landing.
- A multi-tenant or per-user-themed wallpaper system.

## 14. Estimated effort

| Phase | Effort |
|---|---|
| A: Scaffold | ~3 to 4 hours |
| B: app root | ~2 to 3 hours |
| C: OS shell port | ~3 to 4 hours |
| D: pages port | ~3 to 4 hours |
| E: Docker + k8s build path | ~3 hours |
| F: parity verification | ~2 hours |
| G: cleanup + merge | ~1 hour |
| **Total** | **~17 to 21 hours** (2.5 engineering days) |

Add a half day buffer for context switching. Plan: 3 days from
branch creation to merged-to-main.

## 15. Branch creation script

When ready to begin, run from inside `xo-phone-os/`:

```bash
# 0. confirm clean tree on main
git status

# 1. tag the current Gatsby state for forever-reference
git tag -a gatsby-final -m "Final Gatsby state before Next.js migration"

# 2. branch
git checkout -b nextjs-migration

# 3. begin Phase A
```
