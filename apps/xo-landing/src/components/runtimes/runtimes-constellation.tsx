"use client";

import { motion } from "motion/react";
import { BrandIcon, type IconName } from "@/components/brand/brand-icon";
import { SectionHeader } from "@/components/stack/stack-section";

/**
 * RuntimesConstellation: the long-running agents that power an XO
 * workspace today. Strictly the named, long-running coding/agent runtimes
 * with documented setup pages. No character agents, no workflow tools.
 */
const RUNTIMES: Array<{
  name: string;
  icon: IconName;
  tag: string;
  description: string;
  color: "lime" | "white";
}> = [
  {
    name: "OpenClaw",
    icon: "openclaw",
    tag: "Open source · v1 wedge",
    description: "XO's multi-channel agent gateway. Telegram, WhatsApp, Slack channels built in. Skills, integrations, and 250K+ GitHub stars.",
    color: "lime",
  },
  {
    name: "Claude Code",
    icon: "claude-code",
    tag: "Anthropic",
    description: "Coding agent for real software work. Drops into a clean repo room with the full toolchain, OAuth-bundled inference, no API key required.",
    color: "white",
  },
  {
    name: "Codex",
    icon: "codex",
    tag: "OpenAI",
    description: "Codex CLI brokered through your workspace. OAuth-bundled inference, same skills model, swappable mid-project.",
    color: "white",
  },
  {
    name: "Hermes",
    icon: "hermes",
    tag: "Nous Research",
    description: "Self-improving long-running agent with multi-model support: OpenRouter, Kimi, GLM, OpenAI, Hugging Face. ~132K stars.",
    color: "lime",
  },
];

export function RuntimesConstellation() {
  return (
    <section
      id="agents"
      className="relative isolate w-full overflow-hidden py-32"
    >
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeader
          eyebrow="Agents · live today"
          title={
            <>
              Pick an agent.
              <br />
              <span className="text-white/55">Pick a model. Swap either.</span>
            </>
          }
          subtitle="Workspaces are agent and model agnostic. Start with OpenClaw on Claude. Switch to Codex on GPT-5 mid-project. Try Hermes on Kimi K-2 next week. One workspace, every runtime, every model."
        />

        <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {RUNTIMES.map((r, i) => (
            <RuntimeCard key={r.name} {...r} index={i} />
          ))}
        </div>

        {/* Multi-model strip. Each runtime above can run on any of these
            models. Source: xo-docs/agents/openclaw/models + Hermes
            multi-model support (OpenRouter, Kimi, GLM, OpenAI, Hugging Face). */}
        <div className="mt-12 overflow-hidden rounded-2xl border border-white/8 bg-gradient-to-br from-white/[0.025] to-transparent p-5 sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--color-xo-lime)]">
                Multi-model · swap any time
              </div>
              <div className="mt-1 text-[13px] text-white/65">
                Every runtime above ships with multi-model support. One agent,
                every model.
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <ModelChip name="Claude" icon="claude" />
              <ModelChip name="GPT-5" icon="chatgpt" />
              <ModelChip name="Kimi K-2" />
              <ModelChip name="GLM" />
              <ModelChip name="Llama" />
              <ModelChip name="OpenRouter" />
              <ModelChip name="HF" sub="Hugging Face" />
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-center">
          <a
            href="https://docs.xo.builders/agents/custom-agent"
            className="group inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.02] px-4 py-2 text-[13px] text-white/65 backdrop-blur transition hover:border-[var(--color-xo-lime)]/40 hover:text-white"
          >
            <span className="text-[var(--color-xo-lime)]">+</span>
            Bring your own long-running agent
            <svg
              width="12"
              height="12"
              viewBox="0 0 14 14"
              fill="none"
              className="transition group-hover:translate-x-0.5"
            >
              <path
                d="M3 7h8M7 3l4 4-4 4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}

function ModelChip({
  name,
  icon,
  sub,
}: {
  name: string;
  icon?: IconName;
  sub?: string;
}) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.04] px-2 py-1 text-[11px] font-medium text-white/85"
      title={sub ?? name}
    >
      {icon && <BrandIcon name={icon} size={12} />}
      {name}
    </span>
  );
}

function RuntimeCard({
  name,
  icon,
  tag,
  description,
  color,
  index,
}: {
  name: string;
  icon: IconName;
  tag: string;
  description: string;
  color: "lime" | "white";
  index: number;
}) {
  const isLime = color === "lime";
  return (
    <motion.div
      initial={{ y: 40, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ delay: index * 0.07, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4 }}
      className={`group relative flex flex-col overflow-hidden rounded-2xl border p-6 transition ${
        isLime
          ? "border-[var(--color-xo-lime)]/30 bg-gradient-to-br from-[var(--color-xo-lime)]/[0.07] to-transparent"
          : "border-white/8 bg-white/[0.02]"
      }`}
    >
      {/* glow */}
      {isLime && (
        <div
          aria-hidden
          className="absolute -right-12 -top-12 size-44 rounded-full opacity-40 blur-3xl transition group-hover:opacity-70"
          style={{
            background:
              "radial-gradient(closest-side, hsla(92,66%,53%,0.7), transparent 70%)",
          }}
        />
      )}

      <div className="relative flex items-center justify-between">
        <div
          className={`flex size-11 items-center justify-center rounded-xl border ${
            isLime
              ? "border-[var(--color-xo-lime)]/30 bg-[var(--color-xo-lime)]/10 text-[var(--color-xo-lime)]"
              : "border-white/10 bg-white/[0.03] text-white/85"
          }`}
        >
          <BrandIcon name={icon} size={24} />
        </div>
        <span
          className={`size-2 rounded-full ${
            isLime ? "bg-[var(--color-xo-lime)]" : "bg-white/30"
          }`}
        />
      </div>
      <div className="relative mt-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/45">
        {tag}
      </div>
      <div className="relative mt-1 text-2xl font-semibold tracking-tight text-white">
        {name}
      </div>
      <p className="relative mt-3 flex-1 text-[13px] leading-relaxed text-white/55">
        {description}
      </p>
      <div className="relative mt-5 flex items-center gap-2 text-[11px] text-white/45">
        <code className="rounded bg-white/[0.04] px-1.5 py-0.5 font-mono text-[10px]">
          /{name.toLowerCase().replace(/\s/g, "-")}
        </code>
        <span>1-click launch</span>
      </div>
    </motion.div>
  );
}
