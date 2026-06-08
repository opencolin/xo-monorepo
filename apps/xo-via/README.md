# xo-phone-os

XO's marketing surface as an iPhone-style phone OS.

- On a phone: full-bleed OS, viewport IS the device
- On desktop / tablet: an iPhone-sized frame centered on a dark XO backdrop, with the OS running inside it

Architecturally similar to `xo-os` (the desktop OS variant), but the
model is one app at a time, app grid home screen, status bar, dock.
Clean-room implementation; iOS is referenced conceptually only, no
Apple code or assets are used.

## Stack

- Next.js 16 (App Router, Turbopack)
- React 19
- Tailwind 4 (CSS-driven `@theme`, no `tailwind.config.ts`)
- Framer Motion 11 (shared-layout transitions: icon to app)
- TypeScript 5
- pnpm

Production: `output: "standalone"`, multi-stage Dockerfile, runtime
env-var injection via `entrypoint.sh`. K8s-ready.

## Layout

```
xo-phone-os/
├── app/                      # App Router
│   ├── layout.tsx            # Root layout: fonts, metadata, Providers
│   ├── providers.tsx         # Client boundary: PhoneProvider + DeviceFrame
│   ├── page.tsx              # Home route (rendered as HomeScreen via context)
│   ├── globals.css           # Tailwind 4 + @theme + phone-screen CSS
│   ├── loading.tsx           # Streaming skeleton for route transitions
│   ├── api/healthz/route.ts  # k8s liveness
│   ├── coworker/page.tsx     # All routes below are Server Components
│   ├── swarm/page.tsx
│   ├── pricing/page.tsx
│   ├── settings/page.tsx
│   ├── about/page.tsx
│   ├── ask/page.tsx
│   ├── changelog/page.tsx
│   ├── customers/page.tsx
│   ├── demo/page.tsx
│   ├── docs/page.tsx
│   ├── handbook/page.tsx
│   └── talk-to-a-human/page.tsx
├── components/               # Client components ("use client")
│   ├── DeviceFrame.tsx       iPhone chrome (desktop) / full bleed (phone)
│   ├── StatusBar.tsx         time + signal/wifi/battery
│   ├── HomeScreen.tsx        icon grid + wallpaper + dock
│   ├── AppIcon.tsx           tile with shared layoutId for transitions
│   ├── Dock.tsx              pinned apps row
│   ├── AppView.tsx           full-screen app container
│   ├── NavBar.tsx            in-app top bar (back chevron + title)
│   └── HomeIndicator.tsx     bottom pill, tap or swipe up to home
├── context/
│   └── PhoneContext.tsx      current app, back stack, overlay state
├── data/
│   └── apps.ts               icon list, dock pins, paths
├── types/
│   └── index.ts
├── public/                   static assets
├── next.config.ts
├── postcss.config.mjs        @tailwindcss/postcss
├── eslint.config.mjs
├── tsconfig.json
├── Dockerfile                3-stage, pnpm-first
└── entrypoint.sh             runtime NEXT_PUBLIC_* placeholder swap
```

## Run

```bash
pnpm install
pnpm dev
# open http://localhost:18002
```

Production build + serve:

```bash
pnpm build
pnpm start
# also on http://localhost:18002 by default
```

Docker:

```bash
docker build -t xo-phone-os:dev .
docker run -p 3000:3000 -e NEXT_PUBLIC_ENVIRONMENT=dev xo-phone-os:dev
# container internal port is 3000
```

## Notes

- **Animations.** Tapping an icon morphs it into the AppView via Framer
  Motion's `layoutId`. The icon's `layoutId` matches `AppView`'s, so the
  framework interpolates between them.
- **Routing.** Each route is an App Router page. `PhoneProvider`
  listens to `usePathname()` and updates the current app accordingly.
  `AppIcon` prefetches its route so the morph does not stall on RSC
  fetch.
- **Server vs Client.** Page bodies are Server Components, rendered as
  HTML at build time. The OS shell (DeviceFrame, HomeScreen, AppView,
  AppIcon, NavBar, HomeIndicator, StatusBar) is a single client
  boundary above `children` in `app/providers.tsx`.
- **Responsive.** Below 600px the device frame collapses (border /
  shadow / radius zeroed out) so the OS fills the phone viewport.
- **Keyboard.** `Esc` closes overlays or returns to the home screen.
- **Swipe up** on the home indicator returns to the home screen.

## Reference

Phone OS pattern is widely understood from iOS. No Apple source or
assets are copied; this is a from-scratch interpretation of the
pattern, themed for XO.
