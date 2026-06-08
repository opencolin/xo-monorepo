"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { BrandIcon, type IconName } from "@/components/brand/brand-icon";

/**
 * StackSection: visual answer to "what is XO".
 *
 * Two stacked layers:
 *  - Cowork (the workspace, the unit)
 *  - Swarm (the fleet manager)
 *
 * As the user scrolls, a single Cowork tile multiplies into a grid of
 * tiles, then a Swarm "orchestrator" panel slides in above them.
 */
export function StackSection() {
  const ref = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  // Cowork phase: 0..0.45  Swarm phase: 0.45..1
  const tilesScale = useTransform(scrollYProgress, [0.05, 0.4], [0.4, 1]);
  const tilesOpacity = useTransform(scrollYProgress, [0.05, 0.25], [0, 1]);
  const swarmY = useTransform(scrollYProgress, [0.4, 0.8], [60, -10]);
  const swarmOpacity = useTransform(scrollYProgress, [0.4, 0.65], [0, 1]);

  return (
    <section
      id="what-is-xo"
      ref={ref}
      className="section-fade-top relative isolate w-full overflow-hidden py-32"
    >
      <div className="haze pointer-events-none absolute inset-0 -z-10 opacity-60" />

      <div className="mx-auto max-w-7xl px-6">
        <SectionHeader
          eyebrow="Manage your fleet"
          title={
            <>
              One dashboard.
              <br />
              <span className="text-white/55">Every agent you run.</span>
            </>
          }
          subtitle="Launch a workspace, drop files in, watch it work, restart, share, take it offline. Every agent on your fleet lives in the same dashboard, with the same controls, the same logs, the same billing meter."
        />

        <div className="relative mt-20 grid items-stretch gap-6 lg:grid-cols-[1fr_1.4fr]">
          {/* Left side: labels */}
          <div className="relative flex flex-col justify-between gap-12 lg:py-10">
            <Layer
              tag="01 · Workspace"
              title="Where the agent lives"
              body="Pre-configured runtime, files, memory, and tools. The agent has everything it needs to work. Isolated from your laptop, persistent across sessions, ready in seconds."
              accent="lime"
            />
            <Layer
              tag="02 · Platform"
              title="One dashboard for every agent"
              body="Launch a workspace, monitor it, share it, restart it. Identity, billing, observability, and integrations live above the workspaces: the place you manage your fleet."
            />
          </div>

          {/* Right side: visual stack */}
          <div className="relative h-[640px] sm:h-[620px]">
            {/* Swarm orchestrator panel */}
            <motion.div
              style={{ y: swarmY, opacity: swarmOpacity }}
              className="absolute left-0 right-0 top-0 z-20"
            >
              <SwarmPanel />
            </motion.div>

            {/* connection lines */}
            <motion.svg
              style={{ opacity: swarmOpacity }}
              className="absolute inset-0 z-10 h-full w-full"
              aria-hidden
              preserveAspectRatio="none"
              viewBox="0 0 600 600"
            >
              <defs>
                <linearGradient id="line-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsla(92,66%,53%,0.6)" />
                  <stop offset="100%" stopColor="hsla(92,66%,53%,0)" />
                </linearGradient>
              </defs>
              {[120, 240, 360, 480].map((x, i) => (
                <line
                  key={i}
                  x1={x}
                  y1="160"
                  x2={x}
                  y2="320"
                  stroke="url(#line-grad)"
                  strokeWidth="1"
                  strokeDasharray="3 4"
                />
              ))}
            </motion.svg>

            {/* Cowork workspace tiles */}
            <motion.div
              style={{ scale: tilesScale, opacity: tilesOpacity }}
              className="absolute inset-x-0 bottom-0 grid origin-bottom grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4"
            >
              {WORKSPACE_TILES.map((tile, i) => (
                <CoworkTile key={i} {...tile} delay={i * 0.05} />
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * The CoworkTile + SwarmPanel below are faithful, static recreations of
 * components from the live XO swarm app:
 *   - SwarmPanel mirrors WelcomeHeader.tsx (emerald gradient + headline)
 *     plus the filter row used at the top of components/projects-table.
 *   - CoworkTile mirrors a single ProjectsTable row: name, role badge,
 *     type badge, and a status indicator. The grid form is the same data
 *     a user would see in the live dashboard.
 *
 * Source: xo-swarm/components/{WelcomeHeader.tsx, projects-table/index.tsx,
 * projects-table/columns.tsx}.
 */

type TileColor = "lime" | "white";
type TileState = "running" | "thinking" | "idle";

const WORKSPACE_TILES: ReadonlyArray<{
  name: string;
  agent: string;
  agentIcon: IconName;
  role: "personal" | "shared";
  color: TileColor;
  state: TileState;
}> = [
  { name: "ledger-bot", agent: "OpenClaw", agentIcon: "openclaw", role: "personal", color: "lime", state: "running" },
  { name: "research", agent: "Claude Code", agentIcon: "claude-code", role: "personal", color: "white", state: "thinking" },
  { name: "ops-deck", agent: "Hermes", agentIcon: "hermes", role: "personal", color: "lime", state: "running" },
  { name: "supportd", agent: "OpenClaw", agentIcon: "openclaw", role: "shared", color: "white", state: "idle" },
  { name: "growth", agent: "Codex", agentIcon: "codex", role: "personal", color: "lime", state: "running" },
  { name: "design-rev", agent: "Claude Code", agentIcon: "claude-code", role: "personal", color: "white", state: "running" },
  { name: "billing", agent: "OpenClaw", agentIcon: "openclaw", role: "personal", color: "lime", state: "running" },
  { name: "docs-bot", agent: "Hermes", agentIcon: "hermes", role: "shared", color: "white", state: "idle" },
];

type Tile = (typeof WORKSPACE_TILES)[number] & { delay: number };

const STATE_COLOR: Record<TileState, string> = {
  running: "var(--color-xo-lime)",
  thinking: "hsl(48, 90%, 60%)",
  idle: "hsl(0, 0%, 50%)",
};

const STATE_LABEL: Record<TileState, string> = {
  running: "running",
  thinking: "thinking",
  idle: "idle",
};

function CoworkTile({ name, agent, agentIcon, role, color, state, delay }: Tile) {
  return (
    <motion.div
      initial={{ y: 30, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      className="relative flex flex-col gap-2.5 rounded-xl border border-white/10 bg-gradient-to-br from-white/[0.04] to-transparent p-3 backdrop-blur"
      style={{
        boxShadow:
          color === "lime"
            ? "0 0 0 1px hsla(92,66%,53%,0.15), 0 30px 60px -30px hsla(92,66%,53%,0.4)"
            : "0 0 0 1px rgba(255,255,255,0.05), 0 30px 60px -30px rgba(0,0,0,0.6)",
      }}
    >
      {/* Row 1: project name + status dot. Mirrors the Name column. */}
      <div className="flex items-center gap-1.5">
        <span className="truncate text-[11.5px] font-medium text-white hover:underline">
          {name}
        </span>
        <span className="ml-auto" title={STATE_LABEL[state]}>
          <span
            className="block size-1.5 rounded-full"
            style={{
              background: STATE_COLOR[state],
              boxShadow:
                state === "running"
                  ? `0 0 8px ${STATE_COLOR[state]}`
                  : "none",
            }}
          />
        </span>
      </div>

      {/* Row 2: agent runtime with brand icon. */}
      <div className="flex items-center gap-1.5 text-[10px] text-white/55">
        <span className="text-white/85">
          <BrandIcon name={agentIcon} size={11} />
        </span>
        <span className="truncate">{agent}</span>
      </div>

      {/* Row 3: badges. Match the live Role + Type column shape. */}
      <div className="mt-auto flex flex-wrap items-center gap-1">
        <span
          className={`rounded px-1.5 py-0.5 text-[9px] font-medium capitalize ${
            role === "personal"
              ? "bg-white/15 text-white"
              : "bg-white/[0.06] text-white/65"
          }`}
        >
          {role}
        </span>
        <span className="rounded border border-white/10 px-1.5 py-0.5 text-[9px] font-medium capitalize text-white/65">
          agent
        </span>
      </div>
    </motion.div>
  );
}

/**
 * SwarmPanel: reproduces the live xo-swarm WelcomeHeader gradient
 * (from-black via-emerald-950 to-emerald-900, border-emerald-500) plus
 * the filter strip from the top of the projects table (search input +
 * Role facet + Type facet).
 */
function SwarmPanel() {
  return (
    <div className="overflow-hidden rounded-xl border border-emerald-500/40 bg-gradient-to-br from-black via-emerald-950 to-emerald-900 shadow-[0_30px_80px_-30px_rgba(16,185,129,0.35)]">
      {/* Welcome shell */}
      <div className="px-4 py-3 sm:px-5 sm:py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-200/80">
              <span className="size-1 rounded-full bg-emerald-400" />
              Platform
            </div>
            <div className="mt-1 truncate text-[18px] font-bold text-white sm:text-[22px]">
              Welcome suraj{" "}
              <span aria-hidden className="ml-0.5">
                👋
              </span>
            </div>
            <div className="mt-0.5 text-[11px] text-emerald-100/65">
              Launch, manage, and scale AI agents effortlessly.
            </div>
          </div>
          <div className="hidden shrink-0 items-center gap-3 text-[10px] text-emerald-100/65 sm:flex">
            <span>
              <b className="text-white">8</b> active
            </span>
            <span className="text-emerald-100/30">·</span>
            <span>
              <b className="text-white">2</b> paused
            </span>
            <span className="text-emerald-100/30">·</span>
            <span>1.2M tokens / hr</span>
          </div>
        </div>
      </div>

      {/* Filter strip: matches projects-table top bar */}
      <div className="flex items-center gap-2 border-t border-emerald-500/20 bg-black/30 px-3 py-2">
        <div className="flex h-7 flex-1 items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.04] px-2 text-[11px] text-white/45">
          <SearchGlyph />
          <span>Filter projects</span>
        </div>
        <FacetChip label="Role" />
        <FacetChip label="Type" />
        <button className="hidden h-7 items-center gap-1 rounded-md bg-[var(--color-xo-lime)] px-2.5 text-[11px] font-semibold text-black sm:flex">
          + New
        </button>
      </div>
    </div>
  );
}

function FacetChip({ label }: { label: string }) {
  return (
    <span className="hidden h-7 items-center gap-1 rounded-md border border-dashed border-white/15 bg-white/[0.02] px-2 text-[10px] text-white/65 sm:flex">
      <PlusGlyph />
      {label}
    </span>
  );
}

function SearchGlyph() {
  return (
    <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden>
      <circle cx="5" cy="5" r="3.4" stroke="currentColor" strokeWidth="1.2" />
      <path d="M7.6 7.6L10 10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

function PlusGlyph() {
  return (
    <svg width="9" height="9" viewBox="0 0 9 9" fill="none" aria-hidden>
      <path d="M4.5 1v7M1 4.5h7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  subtitle,
  align = "left",
}: {
  eyebrow: string;
  title: React.ReactNode;
  subtitle?: string;
  align?: "left" | "center";
}) {
  return (
    <div
      className={`max-w-2xl ${
        align === "center" ? "mx-auto text-center" : ""
      }`}
    >
      <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.02] px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-white/55">
        <span className="size-1 rounded-full bg-[var(--color-xo-lime)]" />
        {eyebrow}
      </div>
      <h2 className="text-balance text-[34px] font-semibold leading-[1.08] tracking-[-0.02em] text-white sm:text-[44px]">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-5 max-w-xl text-base text-white/55 sm:text-lg">
          {subtitle}
        </p>
      )}
    </div>
  );
}

function Layer({
  tag,
  title,
  body,
  accent,
}: {
  tag: string;
  title: string;
  body: string;
  accent?: "lime";
}) {
  return (
    <div>
      <div
        className={`mb-2 text-xs font-semibold tracking-[0.2em] ${
          accent === "lime" ? "text-[var(--color-xo-lime)]" : "text-white/55"
        }`}
      >
        {tag}
      </div>
      <div className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
        {title}
      </div>
      <div className="mt-3 max-w-md text-[15px] leading-relaxed text-white/55">
        {body}
      </div>
    </div>
  );
}
