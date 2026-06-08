"use client";

import { motion } from "motion/react";
import { BrandIcon, type IconName } from "@/components/brand/brand-icon";
import { SectionHeader } from "@/components/stack/stack-section";

/**
 * BrainDumpSection: the killer feature. The user dumps raw context
 * (notes, docs, links, channels, exports) and the agent reads it and
 * configures itself: memory populated, skills detected, integrations
 * auto-wired, tasks created. No prompt engineering, no skill wiring.
 *
 * Visual: two facing cards.
 *   Left: "What you give it" with input chips arriving in a stagger.
 *   Right: "What it sets up" with config sections materialising in sync.
 *   Between: a flow line with a "reading" indicator.
 *
 * Mobile: cards stack vertically; the connector flips to vertical.
 */

type Input = {
  label: string;
  meta?: string;
  kind: "file" | "link" | "tool" | "note";
  icon?: IconName;
  delay: number;
};

const INPUTS: Input[] = [
  { label: "team-onboarding.pdf", meta: "12 pages", kind: "file", delay: 0 },
  { label: "Linear · PROJ-12 board", kind: "tool", icon: "linear", delay: 0.15 },
  { label: "Notion docs", meta: "5 files", kind: "file", delay: 0.3 },
  { label: "github.com/team/repo", kind: "link", delay: 0.45 },
  { label: "Slack · #ops channel", kind: "tool", icon: "slack", delay: 0.6 },
  { label: "FAQs.docx", meta: "23 entries", kind: "file", delay: 0.75 },
  { label: "Hire 2 contractors by Q3", kind: "note", delay: 0.9 },
  { label: "Customer interview notes", meta: "8 calls", kind: "file", delay: 1.05 },
];

const DETECTED_SKILLS = [
  "linear-triage",
  "slack-replies",
  "doc-qa",
  "daily-summary",
];

const DETECTED_INTEGRATIONS: { icon: IconName; label: string }[] = [
  { icon: "linear", label: "Linear" },
  { icon: "github", label: "GitHub" },
  { icon: "slack", label: "Slack" },
  { icon: "claude-code", label: "Notion" },
];

export function BrainDumpSection() {
  return (
    <section
      id="brain-dump"
      className="relative isolate w-full overflow-hidden py-24 sm:py-32"
    >
      <div className="haze pointer-events-none absolute inset-0 -z-10 opacity-50" />

      <div className="mx-auto max-w-7xl px-6">
        <SectionHeader
          align="center"
          eyebrow="Setup, not really"
          title={
            <>
              Brain-dump everything.
              <br />
              <span className="text-white/55">The agent does the rest.</span>
            </>
          }
          subtitle="No prompts to write. No skills to wire. Drop in your notes, docs, links, and exports. The agent reads it all and configures itself: memory, integrations, skills, tasks. From dump to deployed in under a minute."
        />

        <div className="relative mt-16 grid items-center gap-6 lg:grid-cols-[1fr_auto_1fr]">
          {/* LEFT: raw input panel */}
          <div className="relative">
            <PanelCard
              eyebrow="01 · What you dump in"
              title="Your context"
              note="Anything goes. Files, exports, links, notes, channels."
            >
              <div className="space-y-2">
                {INPUTS.map((input) => (
                  <InputChip key={input.label} {...input} />
                ))}
              </div>
            </PanelCard>
          </div>

          {/* CENTER: animated flow connector */}
          <FlowConnector />

          {/* RIGHT: configured agent panel */}
          <div className="relative">
            <PanelCard
              eyebrow="02 · What it sets up"
              title="Configured agent"
              note="Auto-populated from the dump. No config, no prompts."
              accent
            >
              <ConfigBlock
                label="Memory"
                value="47 facts · 12 entities"
                bar={0.95}
                delay={0.2}
              />
              <ConfigBlock label="Skills" value={`${DETECTED_SKILLS.length} detected`} delay={0.5}>
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {DETECTED_SKILLS.map((skill, i) => (
                    <SkillPill key={skill} label={skill} delay={0.7 + i * 0.08} />
                  ))}
                </div>
              </ConfigBlock>
              <ConfigBlock label="Integrations" value={`${DETECTED_INTEGRATIONS.length} wired`} delay={1.05}>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {DETECTED_INTEGRATIONS.map((integ, i) => (
                    <IntegrationPill
                      key={integ.label}
                      icon={integ.icon}
                      label={integ.label}
                      delay={1.25 + i * 0.08}
                    />
                  ))}
                </div>
              </ConfigBlock>
              <ConfigBlock
                label="Backlog"
                value="12 tasks created"
                bar={0.6}
                delay={1.55}
                lime
              />
            </PanelCard>
          </div>
        </div>

        {/* timer + closing line */}
        <div className="mx-auto mt-12 flex max-w-3xl flex-col items-center gap-3 text-center sm:flex-row sm:justify-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-[var(--color-xo-lime)]/30 bg-[var(--color-xo-lime)]/10 px-3 py-1 font-mono text-[12px] text-[var(--color-xo-lime)]">
            <Clock />
            ~58s · dump to deployed
          </span>
          <span className="text-[12px] text-white/45">
            And every workspace stays this easy to feed forever after.
          </span>
        </div>
      </div>
    </section>
  );
}

/* --------------------------------- atoms --------------------------------- */

function PanelCard({
  eyebrow,
  title,
  note,
  children,
  accent,
}: {
  eyebrow: string;
  title: string;
  note: string;
  children: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border p-5 ${
        accent
          ? "border-[var(--color-xo-lime)]/30 bg-gradient-to-br from-[var(--color-xo-lime)]/[0.07] to-transparent"
          : "border-white/10 bg-white/[0.02]"
      }`}
    >
      {accent && (
        <div
          aria-hidden
          className="absolute -right-16 -top-16 size-44 rounded-full opacity-50 blur-3xl"
          style={{
            background:
              "radial-gradient(closest-side, hsla(92,66%,53%,0.6), transparent 70%)",
          }}
        />
      )}
      <div className="relative">
        <div
          className={`text-[10px] font-semibold uppercase tracking-[0.2em] ${
            accent ? "text-[var(--color-xo-lime)]" : "text-white/45"
          }`}
        >
          {eyebrow}
        </div>
        <div className="mt-1 text-lg font-semibold tracking-tight text-white">
          {title}
        </div>
        <div className="mt-1 text-[12px] text-white/55">{note}</div>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}

function InputChip({ label, meta, kind, icon, delay }: Input) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{
        delay,
        duration: 0.45,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="flex items-center gap-2 rounded-lg border border-white/8 bg-white/[0.025] px-2.5 py-1.5"
    >
      <span className="flex size-5 shrink-0 items-center justify-center rounded-md bg-white/[0.05] text-white/70">
        {icon ? (
          <BrandIcon name={icon} size={11} />
        ) : (
          <KindGlyph kind={kind} />
        )}
      </span>
      <span className="flex-1 truncate text-[12px] text-white/80">{label}</span>
      {meta && (
        <span className="shrink-0 text-[10px] text-white/40">{meta}</span>
      )}
    </motion.div>
  );
}

function KindGlyph({ kind }: { kind: Input["kind"] }) {
  if (kind === "file") {
    return (
      <svg width="9" height="11" viewBox="0 0 9 11" fill="none" aria-hidden>
        <path
          d="M1 1.5A.5.5 0 011.5 1H5l3 3v5.5a.5.5 0 01-.5.5h-6a.5.5 0 01-.5-.5v-8z"
          stroke="currentColor"
          strokeWidth="1"
        />
        <path d="M5 1v3h3" stroke="currentColor" strokeWidth="1" />
      </svg>
    );
  }
  if (kind === "link") {
    return (
      <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden>
        <path
          d="M4 7l3-3M3.5 5.5L2 7a1.8 1.8 0 002.5 2.5L6 8M5 5.5L6.5 4A1.8 1.8 0 019 6.5L7.5 8"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  if (kind === "note") {
    return (
      <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden>
        <path
          d="M2 2h7v6.5L7 10.5H2V2z"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinejoin="round"
        />
        <path d="M3.5 4.5h4M3.5 6.5h3" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
      </svg>
    );
  }
  // tool fallback (rare; usually has icon)
  return (
    <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden>
      <circle cx="5.5" cy="5.5" r="3.5" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}

function FlowConnector() {
  return (
    <div className="relative flex h-12 items-center justify-center lg:h-auto lg:w-32 lg:flex-col">
      {/* horizontal on lg+, vertical on mobile */}
      <svg
        viewBox="0 0 120 24"
        className="hidden h-6 w-full lg:block"
        aria-hidden
      >
        <defs>
          <linearGradient id="bd-grad-h" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="hsla(92,66%,53%,0)" />
            <stop offset="50%" stopColor="hsla(92,66%,53%,0.5)" />
            <stop offset="100%" stopColor="hsla(92,66%,53%,1)" />
          </linearGradient>
        </defs>
        <line x1="0" y1="12" x2="110" y2="12" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
        <motion.line
          x1="0"
          y1="12"
          x2="110"
          y2="12"
          stroke="url(#bd-grad-h)"
          strokeWidth="1.6"
          strokeDasharray="6 12"
          initial={{ strokeDashoffset: 0 }}
          animate={{ strokeDashoffset: -180 }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        />
        <path d="M104 7l8 5-8 5" stroke="hsla(92,66%,53%,0.95)" strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>

      <svg
        viewBox="0 0 24 96"
        className="block h-12 w-6 lg:hidden"
        aria-hidden
      >
        <defs>
          <linearGradient id="bd-grad-v" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="hsla(92,66%,53%,0)" />
            <stop offset="100%" stopColor="hsla(92,66%,53%,1)" />
          </linearGradient>
        </defs>
        <line x1="12" y1="0" x2="12" y2="86" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
        <motion.line
          x1="12"
          y1="0"
          x2="12"
          y2="86"
          stroke="url(#bd-grad-v)"
          strokeWidth="1.6"
          strokeDasharray="4 10"
          initial={{ strokeDashoffset: 0 }}
          animate={{ strokeDashoffset: -140 }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        />
        <path d="M7 80l5 8 5-8" stroke="hsla(92,66%,53%,0.95)" strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>

      {/* "reading" indicator */}
      <div className="absolute -translate-x-1/2 -translate-y-[120%] left-1/2 top-1/2 flex items-center gap-1.5 rounded-full border border-[var(--color-xo-lime)]/30 bg-[#08090a]/90 px-2.5 py-1 text-[10px] uppercase tracking-wider text-[var(--color-xo-lime)] backdrop-blur lg:translate-x-0 lg:translate-y-[-180%] lg:relative lg:left-auto lg:top-auto lg:mt-2">
        <span className="flex gap-0.5">
          <BlinkingDot delay={0} />
          <BlinkingDot delay={0.2} />
          <BlinkingDot delay={0.4} />
        </span>
        agent reading
      </div>
    </div>
  );
}

function BlinkingDot({ delay }: { delay: number }) {
  return (
    <motion.span
      className="size-1 rounded-full bg-[var(--color-xo-lime)]"
      animate={{ opacity: [0.25, 1, 0.25] }}
      transition={{ duration: 1.2, repeat: Infinity, delay }}
    />
  );
}

function ConfigBlock({
  label,
  value,
  bar,
  delay,
  lime,
  children,
}: {
  label: string;
  value: string;
  bar?: number;
  delay: number;
  lime?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ delay, duration: 0.45 }}
      className="rounded-lg border border-white/8 bg-black/20 p-2.5"
    >
      <div className="flex items-baseline justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-white/45">
          {label}
        </span>
        <span
          className={`font-mono text-[11px] font-medium ${
            lime ? "text-[var(--color-xo-lime)]" : "text-white/85"
          }`}
        >
          {value}
        </span>
      </div>
      {bar !== undefined && (
        <div className="mt-1.5 h-[3px] overflow-hidden rounded-full bg-white/[0.06]">
          <motion.div
            className={`h-full origin-left rounded-full ${
              lime ? "bg-[var(--color-xo-lime)]" : "bg-white/40"
            }`}
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: bar }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ delay: delay + 0.1, duration: 0.7, ease: "easeOut" }}
          />
        </div>
      )}
      {children}
    </motion.div>
  );
}

function SkillPill({ label, delay }: { label: string; delay: number }) {
  return (
    <motion.code
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ delay, duration: 0.35 }}
      className="rounded bg-[var(--color-xo-lime)]/10 px-1.5 py-0.5 font-mono text-[10px] text-[var(--color-xo-lime)]"
    >
      /{label}
    </motion.code>
  );
}

function IntegrationPill({
  icon,
  label,
  delay,
}: {
  icon: IconName;
  label: string;
  delay: number;
}) {
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ delay, duration: 0.35 }}
      className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/[0.03] px-1.5 py-0.5 text-[10px] text-white/85"
    >
      <BrandIcon name={icon} size={10} />
      {label}
    </motion.span>
  );
}

function Clock() {
  return (
    <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden>
      <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.2" />
      <path
        d="M6 3.5V6l1.6 1"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}
