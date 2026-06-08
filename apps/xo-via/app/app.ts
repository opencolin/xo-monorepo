import { defineXOApp } from "@/lib/xo-app"

/**
 * The "Home" tile that lives in the dock. Tapping it from any other
 * app returns to the home screen via the existing OS shell behaviour
 * (current === "/" → DeviceFrame renders <HomeScreen/>).
 *
 * Lives at app/app.ts as the sibling manifest to app/page.tsx,
 * matching the per-route convention (every app's manifest lives at
 * <route>/app.ts next to its page.tsx). `app.ts` is not a reserved
 * Next routing filename, so Next ignores it and treats it as a
 * regular module.
 */
export const xoApp = defineXOApp({
  path: "/",
  label: "Home",
  glyph: "XO",
  tile: "bg-gradient-to-br from-lime-400 to-lime-600 text-ink-900",
  // dock pin freed: bottom dock now showcases one app of each kind
  // (native, iframe, api, external) for testing. Home stays reachable
  // via the home indicator, the back chevron, and Esc.
  dock: false,
  kind: "native",
})
