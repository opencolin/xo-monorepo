import * as React from "react"
import type { ViaProps, ViaExpression, ViaAnimation } from "@/lib/via"
import { VIA_PALETTE } from "@/lib/via"

/**
 * Via — XO's digital alter-ego, Stage-2 implementation.
 *
 * This is the swap target described in VIA.md §8: same public API as
 * the Stage-1 chevron Via, but a much cuter and more expressive
 * dog-mascot body (the "Chevi" illustration from the design tool).
 *
 * - Server Component compatible. Only `React.useId()` is used.
 * - One inline <style> per instance, keyframe names scoped by id so
 *   two Via on screen do not stomp each other's animations.
 * - Pure SVG, no external assets, ~6 KB gzipped.
 *
 * The five public expressions each map to a cute dog state:
 *
 *   idle     →  chevron `> <` eyes, soft smile, tail wags slow
 *   thinking →  eyes glance up + small brow, "?" bubble, tail twitches
 *   speaking →  chevron eyes, mouth animates open/closed, tail wags
 *   happy    →  closed `^ ^` smile-eyes, big tongue smile, blush, sparkle, tail wags fast
 *   error    →  red XX eyes, flat mouth, tail tucked, body flashes
 *
 * Animations (`bob` | `pulse` | `flash` | `none`) compose on top of
 * whatever expression-driven motion is happening (e.g. the mouth and
 * tail animations are expression-driven; the whole-body bob/pulse/
 * flash applies on top).
 */
export function Via({
  expression = "idle",
  animation = "bob",
  size = 64,
  className,
  label = "Via",
}: ViaProps) {
  const id = React.useId().replace(/[:]/g, "")
  const errored = expression === "error"

  // ── Palette ────────────────────────────────────────────────────
  const body      = errored ? "#9aa0a6" : VIA_PALETTE.inner        // lime, gray when KO'd
  const bodyDark  = errored ? "#5f6368" : "#549721"                // ear interior / shading
  const belly     = errored ? "#dadce0" : "#cbe9a8"                // snout / belly highlight
  const ink       = VIA_PALETTE.ink                                // outline / mouth ink
  const eyeInk    = errored ? VIA_PALETTE.errorInner : ink         // eyes flip red on error
  const tongue    = "#ff7da8"
  const blush     = "#ffb6c1"

  return (
    <svg
      role="img"
      aria-label={label}
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      style={{ display: "inline-block", flexShrink: 0, overflow: "visible" }}
    >
      <style>{viaStyles(id, expression, animation)}</style>

      <g className={`via-root via-${id}`}>
        {/* ── Tail (behind body) ─────────────────────────────── */}
        <g
          className={`via-tail via-${id}-tail`}
          style={{ transformOrigin: "82px 60px", transformBox: "fill-box" }}
        >
          <path
            d="M 82 60 Q 96 50, 92 36 Q 90 30, 86 30"
            stroke={body}
            strokeWidth={6}
            fill="none"
            strokeLinecap="round"
          />
        </g>

        {/* ── Ears (drawn before head so head overlaps the base) ─ */}
        <g className="via-ears">
          <path d="M 22 36 L 18 12 L 40 30 Z" fill={body} />
          <path d="M 78 36 L 82 12 L 60 30 Z" fill={body} />
          {/* Inner ear, slightly darker for depth */}
          <path d="M 24 32 L 22 18 L 34 28 Z" fill={bodyDark} opacity="0.85" />
          <path d="M 76 32 L 78 18 L 66 28 Z" fill={bodyDark} opacity="0.85" />
        </g>

        {/* ── Head + snout/belly patch ────────────────────────── */}
        <g className={`via-body via-${id}-body`}>
          <ellipse cx="50" cy="55" rx="32" ry="29" fill={body} />
          {/* Snout / belly patch — gives muzzle definition */}
          <ellipse cx="50" cy="67" rx="20" ry="13" fill={belly} />
        </g>

        {/* ── Blush cheeks (happy only) ───────────────────────── */}
        {expression === "happy" && (
          <g opacity="0.85">
            <ellipse cx="26" cy="63" rx="4.5" ry="2.6" fill={blush} />
            <ellipse cx="74" cy="63" rx="4.5" ry="2.6" fill={blush} />
          </g>
        )}

        {/* ── Face: eyes + nose + mouth ───────────────────────── */}
        <g className={`via-face via-${id}-face`}>
          <FaceEyes id={id} expression={expression} eyeColor={eyeInk} />

          {/* Nose — small ink bean; hidden on error to leave the X eyes alone */}
          {!errored && (
            <ellipse cx="50" cy="63" rx="2.6" ry="2" fill={ink} />
          )}

          <FaceMouth id={id} expression={expression} ink={ink} tongue={tongue} />
        </g>

        {/* ── Decorations (sparkle, ?-bubble, etc.) ───────────── */}
        {expression === "happy" && (
          <g className={`via-sparkle via-${id}-sparkle`} fill={VIA_PALETTE.outer}>
            <path d="M 84 18 L 86 22 L 90 24 L 86 26 L 84 30 L 82 26 L 78 24 L 82 22 Z" />
          </g>
        )}
        {expression === "thinking" && (
          <g className={`via-think via-${id}-think`} fill={ink} opacity="0.6">
            <circle cx="84" cy="22" r="2.5" />
            <circle cx="78" cy="29" r="1.6" />
            <text
              x="83"
              y="18"
              fontSize="6"
              textAnchor="middle"
              fontFamily="system-ui, sans-serif"
              fontWeight="700"
            >
              ?
            </text>
          </g>
        )}
      </g>
    </svg>
  )
}

// ─────────────────────────────────────────────────────────────────
// FaceEyes — switches eye SHAPE based on expression. All anchored
// to (35, 50) for left eye, (65, 50) for right eye.
// ─────────────────────────────────────────────────────────────────
function FaceEyes({
  id,
  expression,
  eyeColor,
}: {
  id: string
  expression: ViaExpression
  eyeColor: string
}) {
  if (expression === "error") {
    // Red XX eyes
    return (
      <g stroke={eyeColor} strokeWidth="2.8" strokeLinecap="round">
        <line x1="30" y1="46" x2="40" y2="54" />
        <line x1="40" y1="46" x2="30" y2="54" />
        <line x1="60" y1="46" x2="70" y2="54" />
        <line x1="70" y1="46" x2="60" y2="54" />
      </g>
    )
  }

  if (expression === "happy") {
    // ^ ^ closed-arc smile-eyes — euphoric
    return (
      <g
        stroke={eyeColor}
        strokeWidth="2.8"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M 30 52 L 35 46 L 40 52" />
        <path d="M 60 52 L 65 46 L 70 52" />
      </g>
    )
  }

  if (expression === "thinking") {
    // Chevron eyes glance up, with brow strokes for "puzzled"
    return (
      <g className={`via-${id}-eyesup`}>
        <ChevronEye cx={35} cy={48} color={eyeColor} side="L" />
        <ChevronEye cx={65} cy={48} color={eyeColor} side="R" />
        <g stroke={eyeColor} strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.65">
          <path d="M 28 39 L 40 37" />
          <path d="M 60 37 L 72 39" />
        </g>
      </g>
    )
  }

  // idle + speaking: the canonical XO chevron eyes
  return (
    <g>
      <ChevronEye cx={35} cy={50} color={eyeColor} side="L" />
      <ChevronEye cx={65} cy={50} color={eyeColor} side="R" />
    </g>
  )
}

// One chevron eye. Both eyes point INWARD (`> <`) — that's the
// XO logo embedded in the face.
function ChevronEye({
  cx,
  cy,
  color,
  side,
}: {
  cx: number
  cy: number
  color: string
  side: "L" | "R"
}) {
  const flip = side === "L" ? 1 : -1
  return (
    <path
      d={`M ${cx - 5 * flip} ${cy - 5}
          L ${cx + 5 * flip} ${cy}
          L ${cx - 5 * flip} ${cy + 5}`}
      stroke={color}
      strokeWidth="2.8"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  )
}

// ─────────────────────────────────────────────────────────────────
// FaceMouth — different mouth per expression. Centered near (50, 73).
// ─────────────────────────────────────────────────────────────────
function FaceMouth({
  id,
  expression,
  ink,
  tongue,
}: {
  id: string
  expression: ViaExpression
  ink: string
  tongue: string
}) {
  if (expression === "happy") {
    // Big open smile with a lolling tongue sticking out — dramatic happy
    return (
      <g>
        <path
          d="M 39 70 Q 50 82, 61 70 Q 56 76, 50 76 Q 44 76, 39 70 Z"
          fill={ink}
        />
        {/* lolling tongue extending below the mouth */}
        <path
          d="M 43 75
             Q 42 85, 50 86
             Q 58 85, 57 75
             Q 54 78, 50 78
             Q 46 78, 43 75 Z"
          fill={tongue}
        />
        <line
          x1="50"
          y1="79"
          x2="50"
          y2="84"
          stroke="#e85f8a"
          strokeWidth="0.8"
          strokeLinecap="round"
        />
      </g>
    )
  }

  if (expression === "speaking") {
    // Animated mouth — scales vertically via CSS
    return (
      <g className={`via-${id}-mouth`} style={{ transformOrigin: "50px 73px" }}>
        <ellipse cx="50" cy="73" rx="6" ry="3" fill={ink} />
      </g>
    )
  }

  if (expression === "thinking") {
    // Small puzzled "o"
    return <ellipse cx="50" cy="73" rx="2.4" ry="2.6" fill={ink} />
  }

  if (expression === "error") {
    // Flat resigned line
    return (
      <line
        x1="44"
        y1="73"
        x2="56"
        y2="73"
        stroke={ink}
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    )
  }

  // idle: cute "o" bork + tiny tongue tip peek
  return (
    <g>
      <ellipse cx="50" cy="72.5" rx="3" ry="3.4" fill={ink} />
      <circle cx="50" cy="74.5" r="1.2" fill={tongue} />
    </g>
  )
}

// ─────────────────────────────────────────────────────────────────
// viaStyles — per-instance scoped CSS.
// Public animation `bob | pulse | flash` applies to the whole body.
// Expression-driven motion (tail wag speed, mouth animation, brow
// peek, sparkle) is layered on top.
// ─────────────────────────────────────────────────────────────────
function viaStyles(
  id: string,
  expression: ViaExpression,
  animation: ViaAnimation,
): string {
  const root = `.via-${id}`
  const tail = `.via-${id}-tail`
  const face = `.via-${id}-face`
  const mouth = `.via-${id}-mouth`
  const eyesup = `.via-${id}-eyesup`
  const sparkle = `.via-${id}-sparkle`
  const think = `.via-${id}-think`

  const rules: string[] = []

  // ── whole-body animation (public API: bob | pulse | flash | none) ─
  if (animation === "bob") {
    rules.push(`
      ${root} {
        animation: viaBob_${id} 2.6s ease-in-out infinite;
        transform-origin: 50% 80%;
        transform-box: fill-box;
      }
      @keyframes viaBob_${id} {
        0%, 100% { transform: translateY(0); }
        50%      { transform: translateY(-3%); }
      }
    `)
  }
  if (animation === "pulse") {
    rules.push(`
      ${root} {
        animation: viaPulse_${id} 1.2s ease-in-out infinite;
        transform-origin: 50% 60%;
        transform-box: fill-box;
      }
      @keyframes viaPulse_${id} {
        0%, 100% { transform: scale(1);    opacity: 1; }
        50%      { transform: scale(1.04); opacity: 0.85; }
      }
    `)
  }
  if (animation === "flash") {
    rules.push(`
      ${root} {
        animation: viaFlash_${id} 0.6s ease-in-out 3;
        transform-origin: 50% 60%;
        transform-box: fill-box;
      }
      @keyframes viaFlash_${id} {
        0%, 100% { opacity: 1;   }
        50%      { opacity: 0.55; }
      }
    `)
  }

  // ── tail behavior — speed maps from expression ─────────────────
  // happy = fast wag, error = tucked still, idle/speaking = medium,
  // thinking = slow uncertain twitch.
  if (expression === "error") {
    rules.push(`${tail} { transform: rotate(35deg); }`)
  } else {
    const tailSpeed =
      expression === "happy" ? "0.45s"
      : expression === "speaking" ? "0.7s"
      : expression === "thinking" ? "1.8s"
      : "1.1s" // idle default
    rules.push(`
      ${tail} {
        animation: viaWag_${id} ${tailSpeed} ease-in-out infinite;
      }
      @keyframes viaWag_${id} {
        0%, 100% { transform: rotate(-14deg); }
        50%      { transform: rotate(20deg);  }
      }
    `)
  }

  // ── expression-driven face motion ──────────────────────────────
  if (expression === "happy") {
    // Subtle face wiggle for joy
    rules.push(`
      ${face} {
        animation: viaJoy_${id} 0.6s ease-in-out infinite;
        transform-origin: 50% 65%;
        transform-box: fill-box;
      }
      ${sparkle} {
        animation: viaTwinkle_${id} 1.2s ease-in-out infinite;
        transform-origin: 84px 24px;
        transform-box: fill-box;
      }
      @keyframes viaJoy_${id} {
        0%, 100% { transform: rotate(-1.2deg); }
        50%      { transform: rotate(1.8deg);  }
      }
      @keyframes viaTwinkle_${id} {
        0%, 100% { transform: scale(0.7) rotate(0deg);   opacity: 0.4; }
        50%      { transform: scale(1.2) rotate(20deg);  opacity: 1;   }
      }
    `)
  }

  if (expression === "speaking") {
    rules.push(`
      ${mouth} {
        animation: viaTalk_${id} 0.32s ease-in-out infinite;
      }
      @keyframes viaTalk_${id} {
        0%, 100% { transform: scaleY(1);    }
        50%      { transform: scaleY(0.35); }
      }
    `)
  }

  if (expression === "thinking") {
    rules.push(`
      ${eyesup} {
        animation: viaPeek_${id} 2.4s ease-in-out infinite;
        transform-origin: 50px 50px;
        transform-box: fill-box;
      }
      ${think} {
        animation: viaFloat_${id} 2.4s ease-in-out infinite;
        transform-origin: 82px 24px;
        transform-box: fill-box;
      }
      @keyframes viaPeek_${id} {
        0%, 60%, 100% { transform: translateY(0); }
        80%           { transform: translateY(-1.5px); }
      }
      @keyframes viaFloat_${id} {
        0%, 100% { transform: translateY(0);  opacity: 0.4; }
        50%      { transform: translateY(-2px); opacity: 1; }
      }
    `)
  }

  // ── reduced motion fallback ────────────────────────────────────
  rules.push(`
    @media (prefers-reduced-motion: reduce) {
      ${root}, ${tail}, ${face}, ${mouth}, ${eyesup}, ${sparkle}, ${think} {
        animation: none !important;
      }
    }
  `)

  return rules.join("\n")
}
