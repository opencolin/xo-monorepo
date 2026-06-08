"use client";

import { motion } from "motion/react";
import { BrandIcon, type IconName } from "@/components/brand/brand-icon";
import { SectionHeader } from "@/components/stack/stack-section";

/**
 * OneClickConnect: counterpart to the agents section.
 *
 * Story: launching the agent is one click. Wiring your tools to that
 * agent is the *same* click. Linear, GitHub, Slack as first-party MCPs;
 * Telegram + WhatsApp as OpenClaw channels; Claude / ChatGPT / Cursor
 * as MCP clients that talk to your XO workspace.
 *
 * Each card now leads with the provider's brand icon; the marquee still
 * loops and each card carries a "Connected" affordance.
 *
 * The file name is preserved for now; the export is renamed.
 */

type Tool = {
  name: string;
  icon: IconName;
  blurb: string;
  kind: "mcp" | "channel" | "client";
  accent?: boolean;
};

const TOOLS: Tool[] = [
  {
    name: "Linear",
    icon: "linear",
    blurb: "Read and triage issues, write back from chat.",
    kind: "mcp",
    accent: true,
  },
  {
    name: "GitHub",
    icon: "github",
    blurb: "Read repos, open PRs, run reviews natively.",
    kind: "mcp",
  },
  {
    name: "Slack",
    icon: "slack",
    blurb: "Talk to your agent from any channel or DM.",
    kind: "mcp",
  },
  {
    name: "Telegram",
    icon: "telegram",
    blurb: "Channel into the workspace from Telegram.",
    kind: "channel",
  },
  {
    name: "WhatsApp",
    icon: "whatsapp",
    blurb: "Same agent, reachable on WhatsApp.",
    kind: "channel",
  },
  {
    name: "Claude",
    icon: "claude",
    blurb: "Use the workspace as a tool inside Claude.",
    kind: "client",
    accent: true,
  },
  {
    name: "ChatGPT",
    icon: "chatgpt",
    blurb: "Same agent, surfaced inside ChatGPT.",
    kind: "client",
  },
  {
    name: "Cursor",
    icon: "cursor",
    blurb: "Wire your XO workspace into Cursor's agent.",
    kind: "client",
  },
  {
    name: "Custom MCP",
    icon: "mcp",
    blurb: "Any MCP server. Drop in the URL and connect.",
    kind: "mcp",
    accent: true,
  },
];

export function TemplatesStrip() {
  return (
    <section
      id="connect"
      className="relative isolate w-full overflow-hidden py-32"
    >
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeader
          eyebrow="1-click connect"
          title={
            <>
              Launch the agent.
              <br />
              <span className="text-white/55">Wire your tools, same click.</span>
            </>
          }
          subtitle="Linear, GitHub, Slack and any MCP server connect natively. Telegram and WhatsApp drop in as channels. Your XO workspace also shows up inside Claude, ChatGPT, and Cursor. Same agent, every surface."
        />
      </div>

      {/* edge fades */}
      <div className="relative mt-14">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-32 bg-gradient-to-r from-[var(--color-xo-charcoal)] to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-32 bg-gradient-to-l from-[var(--color-xo-charcoal)] to-transparent" />

        <div className="overflow-hidden">
          <motion.div
            className="flex gap-4 px-6"
            initial={{ x: 0 }}
            animate={{ x: "-50%" }}
            transition={{
              duration: 55,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            {[...TOOLS, ...TOOLS].map((t, i) => (
              <ToolCard key={i} {...t} index={i} />
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

const KIND_COPY: Record<Tool["kind"], string> = {
  mcp: "MCP integration",
  channel: "agent channel",
  client: "MCP client",
};

function ToolCard({
  name,
  icon,
  blurb,
  kind,
  accent,
  index,
}: Tool & { index: number }) {
  return (
    <div
      className={`flex aspect-[4/3] w-[280px] shrink-0 flex-col justify-between rounded-2xl border p-5 ${
        accent
          ? "border-[var(--color-xo-lime)]/30 bg-gradient-to-br from-[var(--color-xo-lime)]/[0.08] to-transparent"
          : "border-white/8 bg-white/[0.02]"
      }`}
    >
      <div>
        <div className="flex items-center justify-between">
          <div
            className={`flex size-10 items-center justify-center overflow-hidden rounded-xl border ${
              accent
                ? "border-[var(--color-xo-lime)]/30 bg-[var(--color-xo-lime)]/10 text-[var(--color-xo-lime)]"
                : "border-white/10 bg-white/[0.04] text-white/85"
            }`}
          >
            <BrandIcon name={icon} size={22} />
          </div>
          <span className="text-[9px] font-semibold uppercase tracking-[0.18em] text-white/45">
            {KIND_COPY[kind]}
          </span>
        </div>
        <div className="mt-3 text-xl font-semibold tracking-tight text-white">
          {name}
        </div>
        <div className="mt-2 text-[13px] leading-relaxed text-white/55">
          {blurb}
        </div>
      </div>

      <div className="flex items-center justify-between">
        {/* Connected pill: small breathing dot to suggest live link. */}
        <span className="inline-flex items-center gap-2 rounded-full border border-[var(--color-xo-lime)]/30 bg-[var(--color-xo-lime)]/10 px-2.5 py-1 text-[11px] font-medium text-[var(--color-xo-lime)]">
          <BreathingDot delay={(index % 9) * 0.15} />
          Connected
        </span>
        <CheckBadge />
      </div>
    </div>
  );
}

function BreathingDot({ delay }: { delay: number }) {
  return (
    <span className="relative flex size-1.5">
      <motion.span
        className="absolute inset-0 rounded-full bg-[var(--color-xo-lime)]"
        animate={{ scale: [1, 2.4, 1], opacity: [0.6, 0, 0.6] }}
        transition={{ duration: 2.2, delay, repeat: Infinity }}
      />
      <span className="relative size-1.5 rounded-full bg-[var(--color-xo-lime)]" />
    </span>
  );
}

function CheckBadge() {
  return (
    <span className="flex size-5 items-center justify-center rounded-full bg-[var(--color-xo-lime)]/15">
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
        <path
          d="M2 5.5l2 2 4-4"
          stroke="var(--color-xo-lime)"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}
