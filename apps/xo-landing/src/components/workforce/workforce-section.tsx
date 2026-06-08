"use client";

import { motion } from "motion/react";
import { BrandIcon, type IconName } from "@/components/brand/brand-icon";
import { SectionHeader } from "@/components/stack/stack-section";

/**
 * WorkforceSection: "Hire the team you couldn't afford."
 *
 * Speaks directly to the solo-founder + small-team ICP that lives in
 * xo-room/content/docs/solopreneur-market.mdx. Each role card maps the
 * old human-hire to the live agent runtime that replaces it, with a
 * substitution price line copied from the canonical document:
 *
 *   - Virtual assistant       $3 - 5K / mo   ->  OpenClaw + skills
 *   - Junior engineer         $4 - 8K / mo   ->  Claude Code or Codex
 *   - Researcher / analyst    $2 - 4K / mo   ->  Hermes (long-context)
 *   - Marketing manager       $5 - 8K / mo   ->  OpenClaw with channels
 *
 * Source: xo-room/content/docs/solopreneur-market.mdx,
 * "What an AI Employee line item replaces" table.
 */

type Role = {
  title: string;
  oldHire: string;
  oldCost: string;
  agentName: string;
  agentIcon: IconName;
  bullets: string[];
  accent?: boolean;
};

const ROLES: Role[] = [
  {
    title: "Engineer",
    oldHire: "Junior engineer",
    oldCost: "$4 - 8K / mo",
    agentName: "Claude Code",
    agentIcon: "claude-code",
    bullets: [
      "Drops into a clean repo room",
      "Reads issues, opens PRs, runs reviews",
      "OAuth-bundled inference, no API key",
    ],
    accent: true,
  },
  {
    title: "Marketer",
    oldHire: "Marketing manager",
    oldCost: "$5 - 8K / mo",
    agentName: "OpenClaw",
    agentIcon: "openclaw",
    bullets: [
      "Posts to Slack, Telegram, Discord",
      "Syncs to Linear, GitHub, ClickUp",
      "Channels and skills built in",
    ],
  },
  {
    title: "Researcher",
    oldHire: "Analyst / researcher",
    oldCost: "$2 - 4K / mo",
    agentName: "Hermes",
    agentIcon: "hermes",
    bullets: [
      "Long-context synthesis at scale",
      "Multi-model: Kimi, GLM, OpenRouter",
      "Memory persistent across sessions",
    ],
  },
  {
    title: "Operations",
    oldHire: "Virtual assistant",
    oldCost: "$3 - 5K / mo",
    agentName: "OpenClaw",
    agentIcon: "openclaw",
    bullets: [
      "Reachable on WhatsApp, Slack, email",
      "Custom skills for any workflow",
      "70 - 85% of admin runs autonomously",
    ],
    accent: true,
  },
];

export function WorkforceSection() {
  return (
    <section
      id="workforce"
      className="relative isolate w-full overflow-hidden py-32"
    >
      <div className="haze pointer-events-none absolute inset-0 -z-10 opacity-40" />

      <div className="mx-auto max-w-7xl px-6">
        <SectionHeader
          align="center"
          eyebrow="Your AI workforce"
          title={
            <>
              Hire the team you{" "}
              <span className="text-[var(--color-xo-lime)]">couldn&apos;t</span>{" "}
              afford.
              <br />
              <span className="text-white/55">One click each.</span>
            </>
          }
          subtitle="Founders used to pay $3 to 8K a month per role and still spend weeks wiring tools. With XO, every agent is an AI employee: always on, fully wired, ten times cheaper than a hire."
        />

        <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {ROLES.map((role, i) => (
            <RoleCard key={role.title} {...role} index={i} />
          ))}
        </div>

        {/* Closing line */}
        <div className="mx-auto mt-12 flex max-w-3xl flex-col items-center gap-4 text-center sm:flex-row sm:justify-center sm:gap-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-[var(--color-xo-lime)]/30 bg-[var(--color-xo-lime)]/10 px-3 py-1 text-[12px] text-[var(--color-xo-lime)]">
            <span className="size-1 rounded-full bg-[var(--color-xo-lime)]" />
            Run your whole fleet from $50 / mo
          </span>
          <span className="text-[12px] text-white/45">
            10 workspaces. Always on. No setup. No DevOps.
          </span>
        </div>
      </div>
    </section>
  );
}

function RoleCard({
  title,
  oldHire,
  oldCost,
  agentName,
  agentIcon,
  bullets,
  accent,
  index,
}: Role & { index: number }) {
  return (
    <motion.div
      initial={{ y: 32, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.55, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4 }}
      className={`group relative flex flex-col overflow-hidden rounded-2xl border p-5 transition ${
        accent
          ? "border-[var(--color-xo-lime)]/30 bg-gradient-to-br from-[var(--color-xo-lime)]/[0.07] to-transparent"
          : "border-white/8 bg-white/[0.02]"
      }`}
    >
      {/* glow on accent cards */}
      {accent && (
        <div
          aria-hidden
          className="absolute -right-12 -top-12 size-40 rounded-full opacity-40 blur-3xl transition group-hover:opacity-70"
          style={{
            background:
              "radial-gradient(closest-side, hsla(92,66%,53%,0.6), transparent 70%)",
          }}
        />
      )}

      {/* role header */}
      <div className="relative flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/45">
          Role
        </span>
        <span className="flex size-2 items-center justify-center">
          <span className="size-1.5 animate-pulse rounded-full bg-[var(--color-xo-lime)]" />
        </span>
      </div>
      <div className="relative mt-1 text-2xl font-semibold tracking-tight text-white">
        {title}
      </div>

      {/* substitution math */}
      <div className="relative mt-4 flex items-center gap-2 rounded-lg border border-white/8 bg-black/20 px-2.5 py-2">
        <div className="min-w-0 flex-1">
          <div className="text-[9px] uppercase tracking-wider text-white/35">
            Replaces
          </div>
          <div className="truncate text-[11px] font-medium text-white/65 line-through decoration-white/30">
            {oldHire}
          </div>
        </div>
        <div className="text-right">
          <div className="text-[9px] uppercase tracking-wider text-white/35">
            Was
          </div>
          <div className="text-[11px] font-mono font-medium text-white/65 line-through decoration-white/30">
            {oldCost}
          </div>
        </div>
      </div>

      {/* agent badge */}
      <div className="relative mt-3 flex items-center gap-2.5 rounded-lg border border-[var(--color-xo-lime)]/25 bg-[var(--color-xo-lime)]/[0.07] px-2.5 py-2">
        <div className="flex size-7 items-center justify-center rounded-md border border-[var(--color-xo-lime)]/30 bg-[var(--color-xo-lime)]/10 text-[var(--color-xo-lime)]">
          <BrandIcon name={agentIcon} size={16} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[9px] uppercase tracking-wider text-[var(--color-xo-lime)]/85">
            Now
          </div>
          <div className="truncate text-[12px] font-medium text-white">
            {agentName}
          </div>
        </div>
        <div className="text-right">
          <div className="text-[9px] uppercase tracking-wider text-[var(--color-xo-lime)]/85">
            From
          </div>
          <div className="text-[12px] font-mono font-medium text-[var(--color-xo-lime)]">
            $10 / mo
          </div>
        </div>
      </div>

      {/* capabilities */}
      <ul className="relative mt-4 space-y-1.5 text-[12.5px] text-white/65">
        {bullets.map((b) => (
          <li key={b} className="flex items-start gap-1.5">
            <Check />
            <span>{b}</span>
          </li>
        ))}
      </ul>
    </motion.div>
  );
}

function Check() {
  return (
    <svg
      width="11"
      height="11"
      viewBox="0 0 12 12"
      fill="none"
      className="mt-1 shrink-0"
      aria-hidden
    >
      <path
        d="M2.5 6l2.5 2.5L9.5 3.5"
        stroke="var(--color-xo-lime)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.85"
      />
    </svg>
  );
}
