# Via — Stage 2 swap target for `components/via/Via.tsx`

Drop-in replacement for the chevron-based Stage 1 Via in `xo-phone-os`.
Same public API as `lib/via.ts` (`ViaProps`, `ViaExpression`, `ViaAnimation`),
much cuter and more expressive body.

## Install

Replace the contents of `components/via/Via.tsx` with `Via.tsx` from this folder.

No other files need to change. The component imports:

```ts
import type { ViaProps, ViaExpression, ViaAnimation } from "@/lib/via"
import { VIA_PALETTE } from "@/lib/via"
```

These already exist in your repo. Consumer files (`AgentSurface`, Spotlight,
future surfaces) are not touched.

## What changes vs. Stage 1

| | Stage 1 (chevron) | Stage 2 (Via dog) |
|---|---|---|
| Body | XO chevron logo with eyes | Round-headed pup with ears, snout, tail |
| Expressions | Same 5 | Same 5 |
| Animations | Same 4 | Same 4 |
| Per-expression motion | Mostly static | Tail wag speed varies, mouth animates while speaking, face bounces when happy, sparkle on happy, "?" bubble on thinking |
| File size | ~5 KB inline SVG | ~6 KB inline SVG |
| Server Component | yes | yes |
| Per-instance keyframes scoped by `useId()` | yes | yes |

The five-state vocabulary is unchanged. Anything binding `viaStateFromAgent`
to `<Via />` keeps working with no edits.

## Expression matrix

| `expression` | Eyes | Mouth | Tail | Extras |
|---|---|---|---|---|
| `idle`     | chevron `> <` (XO logo) | tiny "o" bork + tongue dot | medium wag (1.1s) | — |
| `thinking` | chevron, glance up + brows | small "o" | slow twitch (1.8s) | floating `?` bubble |
| `speaking` | chevron `> <`        | animated ellipse (scaleY loop) | medium wag (0.7s) | — |
| `happy`    | closed `^ ^` smile arcs | big open smile + lolling pink tongue (dramatic) | fast wag (0.45s) | blush cheeks + animated sparkle |
| `error`    | red `X X` crosses     | flat line              | tucked, no wag    | body flashes 3x |

## Animation matrix

| `animation` | Effect | Use |
|---|---|---|
| `none`  | static | screenshots, print |
| `bob`   | gentle vertical bob (translateY 3%) | default; idle / speaking / happy |
| `pulse` | scale 1 → 1.04 + opacity breath  | thinking |
| `flash` | 3× opacity blink                 | error (one-shot) |

These compose on top of the expression-driven motion (tail, mouth, etc.).

## Accessibility

- `role="img"` + `aria-label={label || "Via"}` on the root `<svg>`.
- All animation runs through CSS keyframes, so `prefers-reduced-motion: reduce`
  is honored automatically inside the inlined `<style>` block — no global rule needed.
- Stroke widths are tuned to stay readable down to 16 px (notification badge size).

## Sizing

- 16 px — notification badge / status bar
- 28 px — avatar in a chat bubble
- 32 px — toast or inline accent
- 64 px — default
- 96 px — greeting (`/ask` empty state)
- 200+ — splash / hero / marketing

Tail and sparkle extend slightly past the 100×100 viewBox via
`overflow: visible`; wrap in a container with `overflow: hidden`
if you need a hard bounding box.

## Sanity check after swap

1. `pnpm dev` → open `/ask` → empty state shows Via 96px greeting.
2. Send a message → Via avatar in the assistant bubble cycles through
   `thinking` (with `?` bubble) → `speaking` (mouth animating) →
   `happy` for ~1 s → `idle`.
3. Force an error path → red `XX` eyes, body flashes 3×, tail tucked.
4. Toggle `prefers-reduced-motion` in DevTools → all animation stops.
5. Render two `<Via />` side by side → they animate independently
   (keyframe names are id-scoped).

## File locations once installed

```
xo-phone-os/
  components/
    via/
      Via.tsx        ← replace
      index.ts       ← no change
  lib/
    via.ts           ← no change
```

## Open questions deferred (per VIA.md §10)

- Dark-mode variant lives here when we ship a light theme.
- Per-app tint (e.g. Coworker-purple Via) — not implemented; the brand
  wants one Via.
- Sound — out of scope.
