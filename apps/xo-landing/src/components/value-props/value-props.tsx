"use client";

import { motion } from "motion/react";
import { SectionHeader } from "@/components/stack/stack-section";

/**
 * ValueProps: three live, customer-facing reasons to choose XO.
 * Replaces the OrbitSection (which featured roadmap deployment targets).
 *
 * Each card has a unique visual primitive. These are not lists,
 * they are tiny scenes per the "experience, don't read" mandate.
 */
export function ValueProps() {
  return (
    <section
      id="why-xo"
      className="relative isolate w-full overflow-hidden py-32"
    >
      <div className="haze pointer-events-none absolute inset-0 -z-10 opacity-50" />

      <div className="mx-auto max-w-7xl px-6">
        <SectionHeader
          align="center"
          eyebrow="Why XO"
          title={
            <>
              Stop wiring infra.
              <br />
              <span className="text-white/55">Start shipping with agents.</span>
            </>
          }
          subtitle="Solo founders and small teams used to spend 100 to 200 hours wiring an agent before it could do real work. XO removes that wall: pre-configured workspaces, isolation by default, every agent productive the moment you click."
        />

        <div className="mt-16 grid gap-5 lg:grid-cols-3">
          <Card
            tag="01"
            title="From 100+ hours to one click"
            body="Wiring an agent yourself runs 100 to 200 hours of DevOps. With XO, the workspace is provisioned, runtime brokered, tools mounted, memory persistent, integrations live, in under a second. Pick an agent and it's working."
            visual={<EasySetupVisual />}
          />
          <Card
            tag="02"
            title="Secure by default"
            body="Every workspace is isolated. Credentials are scoped to the workspace, not your laptop. The agent never touches your local machine; your filesystem stays yours."
            visual={<SecureVisual />}
            accent
          />
          <Card
            tag="03"
            title="Ship from minute one"
            body="Compute, storage, models, integrations, observability: all-inclusive. The agent is productive from the click. You spend time working with it, not setting it up."
            visual={<ShipVisual />}
          />
        </div>
      </div>
    </section>
  );
}

function Card({
  tag,
  title,
  body,
  visual,
  accent,
}: {
  tag: string;
  title: string;
  body: string;
  visual: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <motion.div
      initial={{ y: 32, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4 }}
      className={`group relative flex flex-col overflow-hidden rounded-2xl border p-7 transition ${
        accent
          ? "border-[var(--color-xo-lime)]/30 bg-gradient-to-br from-[var(--color-xo-lime)]/[0.07] to-transparent"
          : "border-white/8 bg-white/[0.02]"
      }`}
    >
      {/* visual stage */}
      <div className="relative mb-6 h-[160px] overflow-hidden rounded-xl border border-white/5 bg-black/30">
        {visual}
      </div>

      <div className="text-[10px] font-semibold tracking-[0.2em] text-white/40">
        {tag}
      </div>
      <div className="mt-2 text-2xl font-semibold tracking-tight text-white">
        {title}
      </div>
      <p className="mt-3 text-[14px] leading-relaxed text-white/55">
        {body}
      </p>
    </motion.div>
  );
}

/* ---------- visuals ---------- */

function EasySetupVisual() {
  /*
   * Two-row time comparison: the DIY path (long, dim) vs the XO path
   * (short, lime). The DIY bar fills slowly across the full width while
   * the XO bar pings in immediately. Anchored captions sell the contrast
   * (~150 hr vs <1s) without copy noise.
   */
  return (
    <div className="absolute inset-0 flex flex-col justify-center gap-4 px-5">
      <div>
        <div className="mb-1.5 flex items-baseline justify-between text-[10px]">
          <span className="text-white/45">DIY DevOps</span>
          <span className="font-mono text-white/55">~150 hr</span>
        </div>
        <div className="h-[3px] overflow-hidden rounded-full bg-white/[0.06]">
          <motion.div
            className="h-full origin-left rounded-full bg-white/30"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{
              duration: 3.4,
              ease: "linear",
              repeat: Infinity,
              repeatDelay: 0.6,
            }}
          />
        </div>
      </div>

      <div>
        <div className="mb-1.5 flex items-baseline justify-between text-[10px]">
          <span className="font-medium text-white">XO</span>
          <span className="font-mono text-[var(--color-xo-lime)]">&lt; 1s</span>
        </div>
        <div className="relative h-[3px] overflow-hidden rounded-full bg-white/[0.06]">
          <motion.div
            className="h-full origin-left rounded-full bg-[var(--color-xo-lime)]"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{
              duration: 0.18,
              ease: "easeOut",
              repeat: Infinity,
              repeatDelay: 3.82,
            }}
          />
        </div>
      </div>

      <div className="mt-1 flex items-center justify-end gap-1.5 text-[10px] text-white/40">
        <span className="size-1 rounded-full bg-[var(--color-xo-lime)]" />
        <span>~9,000× faster to first agent</span>
      </div>
    </div>
  );
}

function SecureVisual() {
  // Outer perimeter, agent locked inside; "your laptop" stays untouched.
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <svg viewBox="0 0 320 160" className="h-full w-full" aria-hidden>
        {/* your laptop */}
        <g opacity="0.6">
          <rect x="20" y="60" width="80" height="50" rx="6" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1" />
          <text x="60" y="135" textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.45)">
            your laptop
          </text>
        </g>

        {/* gap */}
        <motion.line
          x1="100" y1="85" x2="220" y2="85"
          stroke="hsla(92,66%,53%,0.5)" strokeWidth="1" strokeDasharray="3 3"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 1 }}
        />

        {/* workspace box */}
        <g>
          <rect
            x="220" y="40" width="80" height="80" rx="10"
            fill="rgba(131,214,58,0.06)"
            stroke="hsla(92,66%,53%,0.5)"
            strokeWidth="1.2"
          />
          {/* lock */}
          <g transform="translate(260,75)">
            <rect x="-8" y="-2" width="16" height="14" rx="2" fill="none" stroke="hsla(92,66%,53%,0.95)" strokeWidth="1.5" />
            <path d="M -5 -2 V -7 a 5 5 0 0 1 10 0 V -2" fill="none" stroke="hsla(92,66%,53%,0.95)" strokeWidth="1.5" />
          </g>
          <text x="260" y="135" textAnchor="middle" fontSize="9" fill="rgba(131,214,58,0.85)">
            workspace
          </text>
        </g>

        {/* perimeter pulse */}
        <motion.circle
          cx="260" cy="80" r="58"
          fill="none" stroke="hsla(92,66%,53%,0.4)" strokeWidth="1"
          initial={{ scale: 0.8, opacity: 0.7 }}
          animate={{ scale: 1.1, opacity: 0 }}
          transition={{ duration: 2.4, repeat: Infinity }}
          style={{ transformOrigin: "260px 80px" }}
        />
      </svg>
    </div>
  );
}

function ShipVisual() {
  // Animated stack of "all-inclusive" pills sliding into a single workspace
  const items = ["compute", "storage", "models", "MCP", "logs"];
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 px-6">
      {items.map((it, i) => (
        <motion.div
          key={it}
          className="flex w-full items-center justify-between rounded-md border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[10.5px]"
          initial={{ x: i % 2 === 0 ? -40 : 40, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{
            duration: 0.5,
            delay: i * 0.09,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          <span className="text-white/75">{it}</span>
          <span className="flex items-center gap-1 text-[var(--color-xo-lime)]/85">
            <span className="size-1.5 rounded-full bg-[var(--color-xo-lime)]" />
            included
          </span>
        </motion.div>
      ))}
    </div>
  );
}
