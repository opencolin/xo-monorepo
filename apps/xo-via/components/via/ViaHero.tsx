import * as React from "react"
import { Via } from "./Via"

/**
 * Phone-scaled adaptation of the "Meet Via" hero (from the design
 * archive's Meet Via.html / via-showcase.jsx). Rendered as the empty
 * state inside the Ask app, above the chat composer.
 *
 * Desktop original is a 1280px 2-column billboard; the phone is
 * 393px so the layout reflows to a single centered column with the
 * mascot above the headline. Visual elements (chevron watermark,
 * mono-caps top strip, big rounded headline with green "Via.", glow
 * behind the mascot, dual CTAs, footer ticker) are preserved.
 *
 * Server Component. The mascot itself is the same <Via/> used in
 * bubble avatars, just sized up.
 */
export function ViaHero() {
  return (
    <div
      className="relative w-full overflow-hidden"
      style={{
        background: "#070907",
        color: "#fff",
        minHeight: "100%",
      }}
    >
      {/* Chevron motif watermark */}
      <svg
        viewBox="0 0 800 600"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ opacity: 0.08 }}
        aria-hidden
      >
        <g
          stroke="#83d63a"
          strokeWidth="22"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="100 180 240 320 100 460" />
          <polyline points="220 180 360 320 220 460" />
          <polyline points="500 180 640 320 500 460" />
          <polyline points="620 180 760 320 620 460" />
        </g>
      </svg>

      {/* Top strip */}
      <div
        className="absolute top-2.5 left-4 right-4 flex items-center justify-between"
        style={{
          fontFamily: 'ui-monospace, "SF Mono", Menlo, monospace',
          fontSize: 9,
          letterSpacing: 1.6,
          opacity: 0.55,
          textTransform: "uppercase",
        }}
      >
        <div className="flex items-center gap-1.5">
          <svg width="14" height="14" viewBox="0 0 100 100" aria-hidden>
            <path
              d="M 24 32 L 38 50 L 24 68"
              fill="none"
              stroke="#fff"
              strokeWidth="9"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M 76 32 L 62 50 L 76 68"
              fill="none"
              stroke="#83d63a"
              strokeWidth="9"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span>XO · Via</span>
        </div>
        <div>Brand · v1</div>
      </div>

      {/* Main column, vertically centered between strip and ticker */}
      <div className="relative flex flex-col items-center text-center px-5 pt-12 pb-10">
        {/* Mascot inside green glow */}
        <div className="relative flex items-center justify-center" style={{ height: 180 }}>
          <div
            aria-hidden
            className="absolute"
            style={{
              width: 240,
              height: 240,
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(131,214,58,0.22) 0%, transparent 65%)",
              filter: "blur(14px)",
            }}
          />
          <Via expression="happy" animation="bob" size={170} />
        </div>

        {/* Small label */}
        <div
          className="mt-4"
          style={{
            fontFamily: 'ui-monospace, "SF Mono", Menlo, monospace',
            fontSize: 10,
            letterSpacing: 2,
            color: "#83d63a",
            textTransform: "uppercase",
          }}
        >
          The XO mascot
        </div>

        {/* Headline */}
        <h1
          className="mt-2"
          style={{
            fontFamily: 'ui-rounded, "SF Pro Rounded", system-ui',
            fontSize: 44,
            fontWeight: 900,
            letterSpacing: -1.4,
            margin: 0,
            lineHeight: 0.92,
          }}
        >
          Hello,
          <br />
          I&apos;m <span style={{ color: "#83d63a" }}>Via.</span>
        </h1>

        {/* Subtitle */}
        <p
          className="mt-4"
          style={{
            fontFamily: 'ui-rounded, system-ui',
            fontSize: 14,
            lineHeight: 1.45,
            opacity: 0.7,
            maxWidth: 280,
            margin: "16px auto 0",
          }}
        >
          The pup who lives inside XO. I&apos;ll be there when you ship,
          when you stall, and when you forget to take breaks.
        </p>

        {/* CTAs */}
        <div
          className="mt-5 flex items-center justify-center gap-2"
          style={{ fontFamily: 'ui-rounded, system-ui' }}
        >
          <a
            href="https://app.xo.builders/signup"
            className="rounded-full font-bold"
            style={{
              background: "#83d63a",
              color: "#0a1306",
              padding: "10px 18px",
              fontSize: 13,
            }}
          >
            Try XO →
          </a>
          <a
            href="/docs"
            className="rounded-full font-semibold"
            style={{
              padding: "10px 18px",
              fontSize: 13,
              border: "1.5px solid rgba(255,255,255,0.2)",
              opacity: 0.85,
              color: "#fff",
            }}
          >
            Read the docs
          </a>
        </div>
      </div>

      {/* Footer ticker */}
      <div
        className="absolute bottom-2 left-4 right-4 flex justify-between"
        style={{
          fontFamily: 'ui-monospace, Menlo, monospace',
          fontSize: 8,
          letterSpacing: 1.4,
          opacity: 0.45,
          textTransform: "uppercase",
        }}
      >
        <span>16 expressions · 9 tail states</span>
        <span>↓ ask anything</span>
      </div>
    </div>
  )
}
