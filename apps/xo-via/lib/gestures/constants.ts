/**
 * Tunable gesture thresholds and physics. Keep all magic numbers in
 * this file so the v1 polish pass can tune in one place.
 *
 * See GESTURE_PLAN.md §6 (thresholds) and §14 (animation choreography).
 */

/** Top edge zone height (px). Notification + control center start here. */
export const EDGE_TOP_PX = 24

/** Bottom edge zone height (px). Home gesture starts here. */
export const EDGE_BOTTOM_PX = 30

/**
 * Spotlight zone occupies the top portion of the home grid (the area
 * between the status bar and the dock). Value is the fraction of the
 * content area (after subtracting edge zones) measured from the top.
 */
export const SPOTLIGHT_ZONE_RATIO = 0.5

/** Movement (px) before a gesture commits from RECOGNIZING to TRACKING. */
export const RECOGNITION_PX = 8

/** Movement on the wrong axis (px) that cancels recognition and releases. */
export const OFF_AXIS_CANCEL_PX = 12

/** Fraction of panel travel that must be covered to commit on release. */
export const COMMIT_DISTANCE_RATIO = 0.3

/** Velocity (px/ms) that commits regardless of distance covered. */
export const COMMIT_VELOCITY = 0.5

/** Fixed PTR commit threshold (px). PTR has no full-travel concept. */
export const PTR_COMMIT_PX = 70

/** PTR rest position after refresh starts. */
export const PTR_REFRESHING_PX = 48

/**
 * Single canonical spring used by every animated panel + PTR reveal.
 * Matches the icon-to-app morph in AppView so the OS feels coherent.
 */
export const PANEL_SPRING = {
  type: "spring" as const,
  stiffness: 280,
  damping: 28,
}

/** Block new gestures for this long after a route morph kicks off. */
export const POST_NAV_GESTURE_LOCKOUT_MS = 280

/** ms between rapid open/close attempts; debounces sloppy taps. */
export const SETTLE_DEBOUNCE_MS = 120
