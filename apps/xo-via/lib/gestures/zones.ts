import {
  EDGE_TOP_PX,
  EDGE_BOTTOM_PX,
  SPOTLIGHT_ZONE_RATIO,
} from "./constants"

/**
 * Reserved gesture zones inside the phone screen.
 *
 *   "top-left"  → notifications panel
 *   "top-right" → control center panel
 *   "bottom"    → home gesture
 *   "spotlight" → conditional, only on home screen
 *   "none"      → not a reserved zone; release to the page
 */
export type ZoneKind =
  | "top-left"
  | "top-right"
  | "bottom"
  | "spotlight"
  | "none"

/**
 * Decide which zone (if any) owns the touch starting at (x, y).
 *
 *   `rect`        bounding rect of `.phone-screen`
 *   `isHomeRoute` true when current === "/", controls Spotlight
 */
export function zoneFor(
  x: number,
  y: number,
  rect: DOMRect,
  isHomeRoute: boolean,
): ZoneKind {
  const localX = x - rect.left
  const localY = y - rect.top

  // Outside the screen entirely.
  if (localX < 0 || localX > rect.width || localY < 0 || localY > rect.height) {
    return "none"
  }

  // Top edge zone: left half → notif, right half → control.
  if (localY <= EDGE_TOP_PX) {
    return localX < rect.width / 2 ? "top-left" : "top-right"
  }

  // Bottom edge zone owns the home gesture.
  if (localY >= rect.height - EDGE_BOTTOM_PX) {
    return "bottom"
  }

  // Spotlight only fires on the home screen, in the top half of the
  // content area (between status bar and dock).
  if (isHomeRoute) {
    const contentTop = EDGE_TOP_PX
    const contentBottom = rect.height - EDGE_BOTTOM_PX
    const spotlightCutoff =
      contentTop + (contentBottom - contentTop) * SPOTLIGHT_ZONE_RATIO
    if (localY < spotlightCutoff) {
      return "spotlight"
    }
  }

  return "none"
}

/**
 * Vertical axis only check. Used by RECOGNIZING → cancel decision
 * when horizontal movement dominates a vertical gesture.
 */
export function isVerticalDrag(dx: number, dy: number): boolean {
  return Math.abs(dy) > Math.abs(dx)
}
