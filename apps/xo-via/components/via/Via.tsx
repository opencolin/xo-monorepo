import * as React from "react"
import type { ViaProps, ViaExpression } from "@/lib/via"
import { VIA_PALETTE } from "@/lib/via"

/**
 * Via, Stage 2 body.
 *
 * Drawing adapted from the user-provided `chev-mascot.jsx` (the
 * `ChevTail` component that renders in the Meet Via hero). Our public
 * `ViaProps` API is preserved; internally the five ViaExpression
 * values map to the design's richer expression vocabulary, per the
 * via-showcase Public API matrix:
 *
 *   idle      →  wink   (one chevron eye + one curved wink, soft wag)
 *   thinking  →  curious (asymmetric eyes + raised brow + "?" bubble)
 *   speaking  →  o       (round eyes + animated mouth)
 *   happy     →  oo      (big sparkly eyes + lolling tongue + sparkle)
 *   error     →  xx      (red X eyes + tucked tail + body flash)
 *
 * Server Component. All animation is scoped CSS keyframes; per-instance
 * IDs from React.useId() prevent collisions between multiple Via on
 * screen.
 */

type DesignExpression =
  | "wink"
  | "curious"
  | "o"
  | "oo"
  | "xx"

function designExprFor(public_: ViaExpression): DesignExpression {
  switch (public_) {
    case "idle":     return "wink"
    case "thinking": return "curious"
    case "speaking": return "o"
    case "happy":    return "oo"
    case "error":    return "xx"
  }
}

type TailState =
  | "still"
  | "wag"
  | "wagFast"
  | "twitch"
  | "alert"
  | "tucked"

function tailFor(expr: DesignExpression): TailState {
  switch (expr) {
    case "wink":    return "alert"
    case "curious": return "twitch"
    case "o":       return "wag"
    case "oo":      return "wagFast"
    case "xx":      return "tucked"
  }
}

export function Via({
  expression = "idle",
  animation = "bob",
  size = 64,
  className,
  label = "Via",
}: ViaProps) {
  const id = React.useId().replace(/[:]/g, "")
  const expr = designExprFor(expression)
  const errored = expr === "xx"

  // Palette
  const body  = errored ? "#9aa0a6" : VIA_PALETTE.inner   // lime, gray when KO'd
  const ink   = "#0a1306"
  const snoutFill = errored ? "#dadce0" : "#fbf6ea"
  const blush = "#ffb6c1"
  const tongue = "#ff7da8"

  return (
    <svg
      role="img"
      aria-label={label}
      width={size}
      height={(size * 100) / 120}
      viewBox="0 0 120 100"
      className={className}
      style={{ display: "inline-block", flexShrink: 0, overflow: "visible" }}
    >
      <style>{viaStyles(id, expr, animation)}</style>

      <g className={`via-root via-${id}`}>
        {/* Tail (drawn first, behind body) */}
        <g
          className={`via-tail via-${id}-tail`}
          style={{ transformOrigin: "82px 66px", transformBox: "fill-box" }}
        >
          <path
            d="M 82 66 C 96 56, 112 60, 110 76 C 108 86, 96 86, 92 78"
            fill="none"
            stroke={body}
            strokeWidth={11}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M 86 66 C 96 60, 106 64, 105 74"
            fill="none"
            stroke="#fff"
            strokeOpacity={0.18}
            strokeWidth={3}
            strokeLinecap="round"
          />
        </g>

        {/* Ears (curved organic shapes; drawn before body so the body
            overlaps the ear bases) */}
        <g className="via-ears">
          <path
            d="M 22 18 C 16 18, 12 26, 16 38 C 20 48, 28 50, 32 44 C 34 38, 32 26, 28 20 C 26 18, 24 18, 22 18 Z"
            fill={body}
          />
          <path
            d="M 68 18 C 74 18, 78 26, 74 38 C 70 48, 62 50, 58 44 C 56 38, 58 26, 62 20 C 64 18, 66 18, 68 18 Z"
            fill={body}
          />
          {/* Inner ear shading */}
          <path
            d="M 22 24 C 20 30, 22 38, 26 40 C 28 36, 28 28, 26 22 Z"
            fill={ink}
            opacity={0.18}
          />
          <path
            d="M 68 24 C 70 30, 68 38, 64 40 C 62 36, 62 28, 64 22 Z"
            fill={ink}
            opacity={0.18}
          />
        </g>

        {/* Body, pill-shape, shifted slightly left to leave room for tail */}
        <g className={`via-body via-${id}-body`} style={{ transformOrigin: "46px 60px" }}>
          <rect x={10} y={28} width={72} height={64} rx={32} fill={body} />
        </g>

        {/* Face */}
        <g className={`via-face via-${id}-face`} style={{ transformOrigin: "46px 55px" }}>
          {/* Snout / belly patch */}
          <ellipse cx={46} cy={72} rx={16} ry={11} fill={snoutFill} />

          {/* Blush (only on cute/happy expressions) */}
          {expr === "oo" && (
            <g opacity={0.85}>
              <ellipse cx={22} cy={68} rx={4.5} ry={2.6} fill={blush} />
              <ellipse cx={70} cy={68} rx={4.5} ry={2.6} fill={blush} />
            </g>
          )}

          {/* Eyes */}
          <g className={`via-${id}-eyes`}>
            <Eye expr={expr} cx={32} side="L" ink={ink} />
            <Eye expr={expr} cx={60} side="R" ink={ink} />
          </g>

          {/* Nose (skipped on extreme states) */}
          {expr !== "xx" && (
            <ellipse cx={46} cy={65} rx={2.8} ry={2.2} fill={ink} />
          )}

          {/* Curious eyebrow */}
          {expr === "curious" && (
            <g stroke={ink} strokeWidth={2} strokeLinecap="round" fill="none">
              <path d="M 24 40 Q 30 35, 38 39" />
            </g>
          )}

          {/* Mouth */}
          <Mouth id={id} expr={expr} ink={ink} tongue={tongue} />
        </g>

        {/* Sparkle decoration (happy/oo only) */}
        {expr === "oo" && (
          <g
            className={`via-sparkle via-${id}-sparkle`}
            style={{ transformOrigin: "90px 18px", transformBox: "fill-box" }}
          >
            <path
              d="M 90 8 L 92 14 L 98 16 L 92 18 L 90 24 L 88 18 L 82 16 L 88 14 Z"
              fill="#fff"
              opacity={0.9}
            />
            <circle cx={76} cy={26} r={1.8} fill="#fff" opacity={0.7} />
            <circle cx={100} cy={28} r={1.2} fill="#fff" opacity={0.5} />
          </g>
        )}

        {/* "?" thought bubble (curious only) */}
        {expr === "curious" && (
          <g
            className={`via-think via-${id}-think`}
            style={{ transformOrigin: "94px 16px", transformBox: "fill-box" }}
            fill={ink}
          >
            <circle cx={100} cy={14} r={6} opacity={0.85} />
            <circle cx={92} cy={22} r={2.5} opacity={0.6} />
            <text
              x={100}
              y={17}
              fontSize={8}
              fontFamily="ui-rounded, system-ui"
              fontWeight={800}
              textAnchor="middle"
              fill="#fff"
            >?</text>
          </g>
        )}
      </g>
    </svg>
  )
}

// ─────────────────────────────────────────────────────────────────
// Eye renderer. Anchored at cy=48. Left eye cx=32, right eye cx=60.
// ─────────────────────────────────────────────────────────────────

function Eye({
  expr,
  cx,
  side,
  ink,
}: {
  expr: DesignExpression
  cx: number
  side: "L" | "R"
  ink: string
}) {
  const eyeY = 48
  const eyeW = 6.5
  const eyeH = 7
  const sw = 4.5

  if (expr === "xx") {
    // Red X marks (KO)
    const red = VIA_PALETTE.errorInner
    return (
      <g stroke={red} strokeWidth={sw} strokeLinecap="round">
        <line x1={cx - eyeW} y1={eyeY - eyeH} x2={cx + eyeW} y2={eyeY + eyeH} />
        <line x1={cx + eyeW} y1={eyeY - eyeH} x2={cx - eyeW} y2={eyeY + eyeH} />
      </g>
    )
  }

  if (expr === "oo") {
    // Big sparkly round eyes (the hero look)
    return (
      <g>
        <circle cx={cx} cy={eyeY} r={eyeH * 1.05} fill={ink} />
        <circle cx={cx - 2} cy={eyeY - 2.5} r={2.2} fill="#fff" />
        <circle cx={cx + 2} cy={eyeY + 2} r={1} fill="#fff" opacity={0.8} />
      </g>
    )
  }

  if (expr === "o") {
    // Simple round content eyes
    return <circle cx={cx} cy={eyeY} r={eyeH * 0.65} fill={ink} />
  }

  if (expr === "wink") {
    // Asymmetric: L = inward chevron, R = curved wink (upturned smile arc)
    if (side === "R") {
      return (
        <path
          d={`M ${cx - eyeW} ${eyeY + 1} Q ${cx} ${eyeY - 5}, ${cx + eyeW} ${eyeY + 1}`}
          fill="none"
          stroke={ink}
          strokeWidth={sw}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )
    }
    return (
      <path
        d={`M ${cx - eyeW} ${eyeY - eyeH} L ${cx + eyeW} ${eyeY} L ${cx - eyeW} ${eyeY + eyeH}`}
        fill="none"
        stroke={ink}
        strokeWidth={sw}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    )
  }

  if (expr === "curious") {
    // Asymmetric: L = inward chevron, R = flat dash
    if (side === "L") {
      return (
        <path
          d={`M ${cx - eyeW} ${eyeY - eyeH} L ${cx + eyeW} ${eyeY} L ${cx - eyeW} ${eyeY + eyeH}`}
          fill="none"
          stroke={ink}
          strokeWidth={sw}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )
    }
    return (
      <line
        x1={cx - eyeW}
        y1={eyeY}
        x2={cx + eyeW}
        y2={eyeY}
        stroke={ink}
        strokeWidth={sw}
        strokeLinecap="round"
      />
    )
  }

  // Fallback (should not hit): inward chevron
  const path =
    side === "L"
      ? `M ${cx - eyeW} ${eyeY - eyeH} L ${cx + eyeW} ${eyeY} L ${cx - eyeW} ${eyeY + eyeH}`
      : `M ${cx + eyeW} ${eyeY - eyeH} L ${cx - eyeW} ${eyeY} L ${cx + eyeW} ${eyeY + eyeH}`
  return (
    <path
      d={path}
      fill="none"
      stroke={ink}
      strokeWidth={sw}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  )
}

// ─────────────────────────────────────────────────────────────────
// Mouth renderer.
// ─────────────────────────────────────────────────────────────────

function Mouth({
  id,
  expr,
  ink,
  tongue,
}: {
  id: string
  expr: DesignExpression
  ink: string
  tongue: string
}) {
  if (expr === "oo") {
    // Big delighted smile with lolling tongue
    return (
      <g className={`via-${id}-mouth`}>
        <path
          d="M 39 73 Q 46 82, 53 73 Q 50 78, 46 78 Q 42 78, 39 73 Z"
          fill={ink}
        />
        <path
          d="M 42 77 Q 41 87, 46 88 Q 51 87, 50 77 Q 48 79, 46 79 Q 44 79, 42 77 Z"
          fill={tongue}
        />
        <line x1={46} y1={80} x2={46} y2={86} stroke="#e85f8a" strokeWidth={0.7} strokeLinecap="round" />
      </g>
    )
  }
  if (expr === "o") {
    return (
      <g className={`via-${id}-mouth`}>
        <ellipse cx={46} cy={75} rx={3.4} ry={3.8} fill={ink} />
        <circle cx={46} cy={77} r={1.4} fill={tongue} />
      </g>
    )
  }
  if (expr === "wink") {
    return (
      <path
        d="M 42 74 Q 46 78, 50 74"
        fill="none"
        stroke={ink}
        strokeWidth={2.8}
        strokeLinecap="round"
      />
    )
  }
  if (expr === "curious") {
    return <ellipse cx={46} cy={75} rx={2.5} ry={2.5} fill={ink} />
  }
  if (expr === "xx") {
    return (
      <line
        x1={42}
        y1={76}
        x2={50}
        y2={76}
        stroke={ink}
        strokeWidth={2.4}
        strokeLinecap="round"
      />
    )
  }
  // default fallback
  return (
    <g>
      <ellipse cx={46} cy={75} rx={3.4} ry={3.8} fill={ink} />
      <circle cx={46} cy={77} r={1.4} fill={tongue} />
    </g>
  )
}

// ─────────────────────────────────────────────────────────────────
// Scoped CSS. Per-instance keyframe names so multiple Via on screen
// do not stomp each other.
// ─────────────────────────────────────────────────────────────────

function viaStyles(id: string, expr: DesignExpression, animation: string): string {
  const root = `.via-${id}`
  const tail = `.via-${id}-tail`
  const body = `.via-${id}-body`
  const face = `.via-${id}-face`
  const mouth = `.via-${id}-mouth`
  const sparkle = `.via-${id}-sparkle`
  const think = `.via-${id}-think`
  const rules: string[] = []

  // Whole-body animation
  if (animation === "bob") {
    rules.push(`
      ${body}, ${face} { animation: viaBob_${id} 2.4s ease-in-out infinite; transform-origin: 46px 55px; }
      @keyframes viaBob_${id} {
        0%, 100% { transform: translateY(0); }
        50%      { transform: translateY(-3px); }
      }
    `)
  }
  if (animation === "pulse") {
    rules.push(`
      ${root} { animation: viaPulse_${id} 1.6s ease-in-out infinite; transform-origin: 46px 60px; }
      @keyframes viaPulse_${id} {
        0%, 100% { transform: scale(1);    opacity: 1; }
        50%      { transform: scale(1.04); opacity: 0.85; }
      }
    `)
  }
  if (animation === "flash") {
    rules.push(`
      ${root} { animation: viaFlash_${id} 0.6s ease-in-out 3; transform-origin: 46px 60px; }
      @keyframes viaFlash_${id} {
        0%, 100% { opacity: 1; }
        50%      { opacity: 0.5; }
      }
    `)
  }

  // Tail behavior
  const t = tailFor(expr)
  if (t === "tucked") {
    rules.push(`${tail} { transform: rotate(78deg); }`)
  } else if (t === "still") {
    /* no transform */
  } else if (t === "alert") {
    rules.push(`
      ${tail} { animation: viaTailAlert_${id} 1.6s ease-in-out infinite; }
      @keyframes viaTailAlert_${id} {
        0%, 100% { transform: rotate(-38deg); }
        50%      { transform: rotate(-30deg); }
      }
    `)
  } else if (t === "twitch") {
    rules.push(`
      ${tail} { animation: viaTailTwitch_${id} 0.22s ease-in-out infinite; }
      @keyframes viaTailTwitch_${id} {
        0%, 100% { transform: rotate(-4deg); }
        50%      { transform: rotate(4deg); }
      }
    `)
  } else if (t === "wag") {
    rules.push(`
      ${tail} { animation: viaTailWag_${id} 0.55s ease-in-out infinite; }
      @keyframes viaTailWag_${id} {
        0%, 100% { transform: rotate(-16deg); }
        50%      { transform: rotate(16deg); }
      }
    `)
  } else if (t === "wagFast") {
    rules.push(`
      ${tail} { animation: viaTailFast_${id} 0.3s ease-in-out infinite; }
      @keyframes viaTailFast_${id} {
        0%, 100% { transform: rotate(-26deg); }
        50%      { transform: rotate(26deg); }
      }
    `)
  }

  // Sparkle + think bubble float
  if (expr === "oo") {
    rules.push(`
      ${sparkle} { animation: viaTwinkle_${id} 2.4s ease-in-out infinite; }
      @keyframes viaTwinkle_${id} {
        0%, 100% { opacity: 0.95; transform: scale(1);   }
        50%      { opacity: 0.4;  transform: scale(0.85);}
      }
    `)
  }
  if (expr === "curious") {
    rules.push(`
      ${think} { animation: viaFloat_${id} 2.2s ease-in-out infinite; }
      @keyframes viaFloat_${id} {
        0%, 100% { transform: translateY(0);   }
        50%      { transform: translateY(-2px);}
      }
    `)
  }

  // Speaking mouth pulse
  if (expr === "o") {
    rules.push(`
      ${mouth} { animation: viaTalk_${id} 0.35s ease-in-out infinite; transform-origin: 46px 75px; transform-box: fill-box; }
      @keyframes viaTalk_${id} {
        0%, 100% { transform: scaleY(1);    }
        50%      { transform: scaleY(0.35); }
      }
    `)
  }

  return rules.join("\n")
}
