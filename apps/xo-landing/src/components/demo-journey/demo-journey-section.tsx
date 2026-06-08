"use client";

import {
  motion,
  useScroll,
  useTransform,
  useMotionValueEvent,
  type MotionValue,
} from "motion/react";
import { useRef, useState } from "react";
import { BrandIcon, type IconName } from "@/components/brand/brand-icon";

/**
 * DemoJourneySection v2.1 (cinematic).
 *
 * One pinned stage cross-fades through six product states as the user
 * scrolls a 700vh section. Each step has its own opacity + scale + y
 * curve (camera-dolly feel) plus a *local* scroll progress value that
 * drives internal motion (items flying in, bars filling, chat
 * materialising).
 *
 * Motion stack: motion + sticky CSS + Lenis. No GSAP.
 *
 * Step ranges (in scrollYProgress 0..1):
 *   01 Land           0.00 .. 0.18
 *   02 Pick           0.13 .. 0.35
 *   03 Brain dump     0.30 .. 0.52
 *   04 Auto-configure 0.47 .. 0.69
 *   05 Live           0.64 .. 0.86
 *   06 Fleet          0.81 .. 1.00
 *
 * Adjacent steps overlap by 0.05 so the transition is a soft handoff.
 */

const STEPS: {
  num: string;
  short: string;
  eyebrow: string;
  title: string;
  body: string;
}[] = [
  {
    num: "01",
    short: "Land",
    eyebrow: "Step 01 · Land",
    title: "Sign in. See your fleet.",
    body: "No CLI. No setup. Land on a clean dashboard. Every agent you launch lives here, with the same controls, logs, and billing meter.",
  },
  {
    num: "02",
    short: "Pick",
    eyebrow: "Step 02 · Pick",
    title: "Pick an agent. Pick a model.",
    body: "Choose a runtime: OpenClaw, Claude Code, Codex, Hermes. Then a model: Claude, GPT-5, Kimi K-2, GLM, Llama, OpenRouter, Hugging Face. Swap either anytime.",
  },
  {
    num: "03",
    short: "Brain dump",
    eyebrow: "Step 03 · Brain dump",
    title: "Drop your context in.",
    body: "Folders, Linear boards, Notion docs, GitHub repos, Slack channels, raw notes. The agent reads everything. No prompts to write, no skills to wire.",
  },
  {
    num: "04",
    short: "Configure",
    eyebrow: "Step 04 · Auto-configure",
    title: "The agent sets itself up.",
    body: "Memory fills with facts. Skills get detected. Integrations auto-wire. A backlog forms. You watch the workspace assemble itself in real time.",
  },
  {
    num: "05",
    short: "Live",
    eyebrow: "Step 05 · Live",
    title: "Online. Reachable everywhere.",
    body: "Streaming on Slack, Telegram, WhatsApp, Discord. Open the same workspace inside Claude, ChatGPT, or Cursor. Twenty-four hours a day.",
  },
  {
    num: "06",
    short: "Fleet",
    eyebrow: "Step 06 · Fleet",
    title: "Manage your whole team.",
    body: "Engineer. Marketer. Researcher. Operations. Each its own workspace, all on one dashboard. Launch the next one from the same button.",
  },
];

// Soft cubic-bezier (out-expo-ish) used for opacity + scale + y curves
const EZ = [0.22, 1, 0.36, 1] as const;

export function DemoJourneySection() {
  const ref = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  /*
   * For each step we compute three motion values:
   *   - opacity: 0 -> 1 -> 1 -> 0 across its range
   *   - scale:   0.94 -> 1 -> 1 -> 0.94 (subtle dolly)
   *   - y:       30 -> 0 -> 0 -> -30 (rises on entry, lifts on exit)
   *
   * Plus a "local" 0..1 progress from the step's start to its end so
   * each step can drive internal animation from where the user is
   * within it.
   */

  // ---- step 0 (Land) ----
  const op0 = useTransform(scrollYProgress, [0, 0.02, 0.13, 0.18], [1, 1, 1, 0]);
  const sc0 = useTransform(scrollYProgress, [0, 0.02, 0.13, 0.18], [1, 1, 1, 0.94]);
  const ty0 = useTransform(scrollYProgress, [0, 0.02, 0.13, 0.18], [0, 0, 0, -36]);
  const lp0 = useTransform(scrollYProgress, [0, 0.18], [0, 1]);

  // ---- step 1 (Pick) ----
  const op1 = useTransform(scrollYProgress, [0.13, 0.18, 0.30, 0.35], [0, 1, 1, 0]);
  const sc1 = useTransform(scrollYProgress, [0.13, 0.18, 0.30, 0.35], [0.94, 1, 1, 0.94]);
  const ty1 = useTransform(scrollYProgress, [0.13, 0.18, 0.30, 0.35], [36, 0, 0, -36]);
  const lp1 = useTransform(scrollYProgress, [0.13, 0.35], [0, 1]);

  // ---- step 2 (Brain dump) ----
  const op2 = useTransform(scrollYProgress, [0.30, 0.35, 0.47, 0.52], [0, 1, 1, 0]);
  const sc2 = useTransform(scrollYProgress, [0.30, 0.35, 0.47, 0.52], [0.94, 1, 1, 0.94]);
  const ty2 = useTransform(scrollYProgress, [0.30, 0.35, 0.47, 0.52], [36, 0, 0, -36]);
  const lp2 = useTransform(scrollYProgress, [0.30, 0.52], [0, 1]);

  // ---- step 3 (Auto-configure) ----
  const op3 = useTransform(scrollYProgress, [0.47, 0.52, 0.64, 0.69], [0, 1, 1, 0]);
  const sc3 = useTransform(scrollYProgress, [0.47, 0.52, 0.64, 0.69], [0.94, 1, 1, 0.94]);
  const ty3 = useTransform(scrollYProgress, [0.47, 0.52, 0.64, 0.69], [36, 0, 0, -36]);
  const lp3 = useTransform(scrollYProgress, [0.47, 0.69], [0, 1]);

  // ---- step 4 (Live) ----
  const op4 = useTransform(scrollYProgress, [0.64, 0.69, 0.81, 0.86], [0, 1, 1, 0]);
  const sc4 = useTransform(scrollYProgress, [0.64, 0.69, 0.81, 0.86], [0.94, 1, 1, 0.94]);
  const ty4 = useTransform(scrollYProgress, [0.64, 0.69, 0.81, 0.86], [36, 0, 0, -36]);
  const lp4 = useTransform(scrollYProgress, [0.64, 0.86], [0, 1]);

  // ---- step 5 (Fleet) ----
  const op5 = useTransform(scrollYProgress, [0.81, 0.86, 0.98, 1.0], [0, 1, 1, 1]);
  const sc5 = useTransform(scrollYProgress, [0.81, 0.86, 0.98, 1.0], [0.94, 1, 1, 1]);
  const ty5 = useTransform(scrollYProgress, [0.81, 0.86, 0.98, 1.0], [36, 0, 0, 0]);
  const lp5 = useTransform(scrollYProgress, [0.81, 1.0], [0, 1]);

  const stepMotion = [
    { op: op0, sc: sc0, ty: ty0, lp: lp0 },
    { op: op1, sc: sc1, ty: ty1, lp: lp1 },
    { op: op2, sc: sc2, ty: ty2, lp: lp2 },
    { op: op3, sc: sc3, ty: ty3, lp: lp3 },
    { op: op4, sc: sc4, ty: ty4, lp: lp4 },
    { op: op5, sc: sc5, ty: ty5, lp: lp5 },
  ];

  // top progress bar fills 0 -> 100%
  const progressWidth = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  // ambient haze: subtle color shift per step (lime intensity peaks at
  // the brain-dump and live steps where the agent does its work)
  const hazeOpacity = useTransform(
    scrollYProgress,
    [0, 0.35, 0.52, 0.69, 0.86, 1],
    [0.4, 0.55, 0.8, 0.65, 0.7, 0.55],
  );

  // active step index for the rail + caption (kept in state because the
  // caption needs to know which step to slide up/down between)
  const [active, setActive] = useState(0);
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const i = Math.min(STEPS.length - 1, Math.max(0, Math.floor(v * STEPS.length)));
    setActive(i);
  });

  const jumpTo = (i: number) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const top = rect.top + window.scrollY;
    const stepHeight = rect.height / STEPS.length;
    const target = top + i * stepHeight + stepHeight * 0.25;
    window.scrollTo({ top: target, behavior: "smooth" });
  };

  return (
    <section
      ref={ref}
      id="demo"
      className="relative isolate w-full"
      style={{ height: "700vh" }}
    >
      <div className="sticky top-0 flex h-screen w-full flex-col overflow-hidden bg-[var(--color-xo-charcoal)]">
        {/* ambient lime haze: amplitude tracks scroll so the page glows
            slightly warmer at the high-action moments */}
        <motion.div
          aria-hidden
          style={{ opacity: hazeOpacity }}
          className="haze pointer-events-none absolute inset-0 -z-10"
        />

        {/* top progress line */}
        <div className="relative h-[2px] w-full bg-white/[0.04]">
          <motion.div
            className="absolute inset-y-0 left-0 origin-left bg-[var(--color-xo-lime)]"
            style={{ width: progressWidth }}
          />
        </div>

        {/* eyebrow row (lg only) */}
        <div className="hidden border-b border-white/5 px-6 py-3 lg:block">
          <div className="mx-auto flex max-w-7xl items-center justify-between text-[11px] uppercase tracking-[0.2em] text-white/45">
            <span className="flex items-center gap-2">
              <span className="size-1 rounded-full bg-[var(--color-xo-lime)]" />
              The XO journey
            </span>
            <span>scroll to play</span>
          </div>
        </div>

        {/* main split */}
        <div className="relative mx-auto flex w-full max-w-7xl flex-1 flex-col gap-4 px-4 py-6 sm:px-6 sm:py-8 lg:grid lg:grid-cols-[1fr_240px] lg:items-center lg:gap-8">
          {/* DEMO STAGE */}
          <div
            className="relative flex h-[60vh] w-full items-center justify-center sm:h-[58vh] lg:h-[68vh]"
            style={{ perspective: "1400px" }}
          >
            <Stage stepMotion={stepMotion} />
          </div>

          {/* STEP RAIL */}
          <div className="lg:py-6">
            <StepRail
              active={active}
              onJump={jumpTo}
              progress={scrollYProgress}
            />
          </div>

          {/* CAPTION */}
          <div className="lg:col-span-2">
            <Caption stepMotion={stepMotion} active={active} />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
 * STAGE: layered steps with opacity + scale + y-translate
 * ============================================================ */

type StepMotion = {
  op: MotionValue<number>;
  sc: MotionValue<number>;
  ty: MotionValue<number>;
  lp: MotionValue<number>;
};

function Stage({ stepMotion }: { stepMotion: StepMotion[] }) {
  return (
    <div className="relative h-full w-full" style={{ transformStyle: "preserve-3d" }}>
      <StageLayer m={stepMotion[0]}>
        <StepLand local={stepMotion[0].lp} />
      </StageLayer>
      <StageLayer m={stepMotion[1]}>
        <StepPick local={stepMotion[1].lp} />
      </StageLayer>
      <StageLayer m={stepMotion[2]}>
        <StepBrainDump local={stepMotion[2].lp} />
      </StageLayer>
      <StageLayer m={stepMotion[3]}>
        <StepConfigure local={stepMotion[3].lp} />
      </StageLayer>
      <StageLayer m={stepMotion[4]}>
        <StepLive local={stepMotion[4].lp} />
      </StageLayer>
      <StageLayer m={stepMotion[5]}>
        <StepFleet local={stepMotion[5].lp} />
      </StageLayer>
    </div>
  );
}

function StageLayer({
  m,
  children,
}: {
  m: StepMotion;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      style={{ opacity: m.op, scale: m.sc, y: m.ty }}
      transition={{ ease: EZ }}
      className="absolute inset-0 flex items-center justify-center will-change-transform"
    >
      {children}
    </motion.div>
  );
}

/* ============================================================
 * STEP RAIL: animated lime fill + checkmarks for past steps
 * ============================================================ */

function StepRail({
  active,
  onJump,
  progress,
}: {
  active: number;
  onJump: (i: number) => void;
  progress: MotionValue<number>;
}) {
  const fillHeight = useTransform(progress, [0, 1], ["0%", "100%"]);
  return (
    <>
      {/* DESKTOP: vertical timeline */}
      <div className="relative hidden h-full lg:block">
        {/* base track */}
        <div className="absolute left-2 top-2 bottom-2 w-px bg-white/10" />
        {/* lime fill, continuous to scroll */}
        <motion.div
          className="absolute left-2 top-2 w-px origin-top bg-gradient-to-b from-[var(--color-xo-lime)] to-[hsl(92,66%,40%)]"
          style={{ height: fillHeight }}
        />
        {/* glow at the leading edge of the fill */}
        <motion.div
          className="absolute left-1 size-[6px] -translate-x-1/2 rounded-full bg-[var(--color-xo-lime)]"
          style={{
            top: useTransform(progress, [0, 1], ["0.5rem", "calc(100% - 0.5rem)"]),
            boxShadow: "0 0 12px hsla(92,66%,53%,0.85)",
          }}
        />

        <ul className="relative space-y-5">
          {STEPS.map((step, i) => {
            const isActive = i === active;
            const isPast = i < active;
            return (
              <li key={step.num}>
                <button
                  onClick={() => onJump(i)}
                  className="group flex w-full items-center gap-3 text-left"
                  aria-label={`Jump to step ${step.num}: ${step.short}`}
                >
                  <span
                    className={`relative flex size-4 shrink-0 items-center justify-center rounded-full border transition ${
                      isActive
                        ? "border-[var(--color-xo-lime)] bg-[var(--color-xo-lime)]"
                        : isPast
                          ? "border-[var(--color-xo-lime)] bg-[var(--color-xo-lime)]"
                          : "border-white/20 bg-[var(--color-xo-charcoal)]"
                    }`}
                  >
                    {/* checkmark on past steps */}
                    {isPast && (
                      <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
                        <path
                          d="M2 5l1.6 1.6L7 3"
                          stroke="black"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                    {/* halo on active */}
                    {isActive && (
                      <>
                        <motion.span
                          className="absolute inset-0 rounded-full bg-[var(--color-xo-lime)]"
                          animate={{ scale: [1, 1.8, 1], opacity: [0.7, 0, 0.7] }}
                          transition={{ duration: 1.6, repeat: Infinity }}
                        />
                        <motion.span
                          className="absolute -inset-1 rounded-full border border-[var(--color-xo-lime)]/40"
                          animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
                          transition={{ duration: 1.6, repeat: Infinity, delay: 0.2 }}
                        />
                      </>
                    )}
                  </span>
                  <span
                    className={`flex-1 text-[12px] font-medium transition ${
                      isActive
                        ? "text-white"
                        : isPast
                          ? "text-white/65"
                          : "text-white/35 group-hover:text-white/70"
                    }`}
                  >
                    <span className="font-mono text-[10px] text-white/35">
                      {step.num}
                    </span>{" "}
                    {step.short}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* MOBILE: horizontal pill row */}
      <div className="flex items-center justify-center gap-1.5 lg:hidden">
        {STEPS.map((step, i) => {
          const isActive = i === active;
          const isPast = i < active;
          return (
            <button
              key={step.num}
              onClick={() => onJump(i)}
              aria-label={`Jump to step ${step.num}`}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                isActive
                  ? "w-10 bg-[var(--color-xo-lime)] shadow-[0_0_10px_hsla(92,66%,53%,0.7)]"
                  : isPast
                    ? "w-3 bg-[var(--color-xo-lime)]/55"
                    : "w-3 bg-white/15"
              }`}
            />
          );
        })}
      </div>
    </>
  );
}

/* ============================================================
 * CAPTION: slide-up + fade per step
 * ============================================================ */

function Caption({
  stepMotion,
  active,
}: {
  stepMotion: StepMotion[];
  active: number;
}) {
  return (
    <div className="relative h-[100px] sm:h-[108px]">
      {STEPS.map((step, i) => (
        <CaptionLayer key={step.num} m={stepMotion[i]} step={step} hidden={i !== active} />
      ))}
    </div>
  );
}

function CaptionLayer({
  m,
  step,
  hidden,
}: {
  m: StepMotion;
  step: (typeof STEPS)[number];
  hidden: boolean;
}) {
  // Caption slides up gently from y=12 to y=0 within its peak window.
  const captionY = useTransform(m.op, [0, 1], [12, 0]);
  return (
    <motion.div
      style={{ opacity: m.op, y: captionY }}
      className="absolute inset-0 flex flex-col items-start"
      aria-hidden={hidden}
    >
      <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--color-xo-lime)]">
        {step.eyebrow}
      </div>
      <div className="mt-1 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
        {step.title}
      </div>
      <div className="mt-2 max-w-3xl text-[13.5px] leading-relaxed text-white/60 sm:text-base">
        {step.body}
      </div>
    </motion.div>
  );
}

/* ============================================================
 * STEP 01 · LAND
 * ============================================================ */

function StepLand({ local }: { local: MotionValue<number> }) {
  // CTA pulse intensifies the deeper into the step you scroll
  const ctaScale = useTransform(local, [0, 1], [1, 1.04]);
  const ctaGlow = useTransform(local, [0, 1], [0.4, 0.85]);
  const ctaShadow = useTransform(
    ctaGlow,
    (g) => `0 20px 60px -20px hsla(92,66%,53%,${g})`,
  );
  return (
    <DesktopFrame title="xo.builders / suraj">
      <div className="relative flex h-full flex-col">
        <div className="border-b border-emerald-500/30 bg-gradient-to-br from-black via-emerald-950 to-emerald-900 p-6 sm:p-8">
          <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-200/70">
            Welcome
          </div>
          <div className="mt-1 text-2xl font-bold text-white sm:text-3xl">
            Welcome suraj{" "}
            <span aria-hidden className="ml-1">
              👋
            </span>
          </div>
          <div className="mt-1 text-[13px] text-emerald-100/65">
            Launch, manage, and scale AI agents effortlessly.
          </div>
        </div>

        <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6 sm:p-10">
          <div
            aria-hidden
            className="rounded-full bg-[var(--color-xo-lime)]/10 p-4 text-[var(--color-xo-lime)]"
          >
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <path
                d="M11 4v14M4 11h14"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <div className="text-center">
            <div className="text-base font-semibold text-white sm:text-lg">
              No agents yet
            </div>
            <div className="mt-1 text-[13px] text-white/55">
              Launch your first one. It takes seconds.
            </div>
          </div>
          <motion.div
            style={{ scale: ctaScale }}
            animate={{ y: [0, -3, 0] }}
            transition={{ duration: 1.6, repeat: Infinity }}
          >
            <motion.button
              style={{ boxShadow: ctaShadow }}
              className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-xo-lime)] px-5 py-2.5 text-sm font-semibold text-black"
            >
              <span className="text-lg leading-none">+</span>
              Launch a workspace
            </motion.button>
          </motion.div>
        </div>
      </div>
    </DesktopFrame>
  );
}

/* ============================================================
 * STEP 02 · PICK
 * ============================================================ */

function StepPick({ local }: { local: MotionValue<number> }) {
  // Agent grid stages in 0..0.4, model row in 0.3..0.7, CTA at 0.6+
  const agentsOpacity = useTransform(local, [0, 0.1, 0.4], [0, 1, 1]);
  const modelsOpacity = useTransform(local, [0.3, 0.4, 0.7], [0, 1, 1]);
  const ctaOpacity = useTransform(local, [0.6, 0.75], [0, 1]);
  return (
    <DesktopFrame title="Launch a workspace" tone="modal">
      <div className="flex h-full flex-col">
        <div className="border-b border-white/5 px-5 py-3">
          <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/45">
            Step 1 of 2
          </div>
          <div className="mt-1 text-base font-semibold text-white">
            Pick an agent
          </div>
        </div>

        <motion.div
          style={{ opacity: agentsOpacity }}
          className="grid flex-1 grid-cols-2 gap-2.5 p-4 sm:gap-3 sm:p-5"
        >
          <AgentChoice icon="openclaw" name="OpenClaw" tag="Open source" selected />
          <AgentChoice icon="claude-code" name="Claude Code" tag="Anthropic" />
          <AgentChoice icon="codex" name="Codex" tag="OpenAI" />
          <AgentChoice icon="hermes" name="Hermes" tag="Nous Research" />
        </motion.div>

        <motion.div
          style={{ opacity: modelsOpacity }}
          className="border-t border-white/5 px-5 py-3"
        >
          <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/45">
            Pick a model
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <ModelOption name="Claude" icon="claude" selected />
            <ModelOption name="GPT-5" icon="chatgpt" />
            <ModelOption name="Kimi K-2" />
            <ModelOption name="GLM" />
            <ModelOption name="Llama" />
            <ModelOption name="OpenRouter" />
            <ModelOption name="HF" />
          </div>
        </motion.div>

        <motion.div
          style={{ opacity: ctaOpacity }}
          className="border-t border-white/5 px-5 py-3"
        >
          <button className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--color-xo-lime)] px-4 py-2 text-sm font-semibold text-black shadow-[0_10px_30px_-10px_hsla(92,66%,53%,0.7)]">
            Launch OpenClaw on Claude
          </button>
        </motion.div>
      </div>
    </DesktopFrame>
  );
}

function AgentChoice({
  icon,
  name,
  tag,
  selected,
}: {
  icon: IconName;
  name: string;
  tag: string;
  selected?: boolean;
}) {
  return (
    <div
      className={`relative rounded-lg border p-3 transition ${
        selected
          ? "border-[var(--color-xo-lime)]/50 bg-[var(--color-xo-lime)]/[0.07]"
          : "border-white/10 bg-white/[0.02]"
      }`}
    >
      <div className="flex items-center gap-2">
        <div
          className={`flex size-8 items-center justify-center rounded-md border ${
            selected
              ? "border-[var(--color-xo-lime)]/40 bg-[var(--color-xo-lime)]/15 text-[var(--color-xo-lime)]"
              : "border-white/10 bg-white/[0.04] text-white/85"
          }`}
        >
          <BrandIcon name={icon} size={16} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[12.5px] font-semibold text-white">
            {name}
          </div>
          <div className="text-[10px] text-white/45">{tag}</div>
        </div>
        {selected && (
          <span className="flex size-4 items-center justify-center rounded-full bg-[var(--color-xo-lime)] text-black">
            <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
              <path
                d="M2 5l2 2 4-4"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        )}
      </div>
    </div>
  );
}

function ModelOption({
  name,
  icon,
  selected,
}: {
  name: string;
  icon?: IconName;
  selected?: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-[11px] font-medium transition ${
        selected
          ? "border-[var(--color-xo-lime)]/50 bg-[var(--color-xo-lime)]/15 text-white"
          : "border-white/10 bg-white/[0.03] text-white/80"
      }`}
    >
      {icon && <BrandIcon name={icon} size={11} />}
      {name}
      {selected && (
        <span className="size-1 rounded-full bg-[var(--color-xo-lime)]" />
      )}
    </span>
  );
}

/* ============================================================
 * STEP 03 · BRAIN DUMP (items appear with local scroll)
 * ============================================================ */

function StepBrainDump({ local }: { local: MotionValue<number> }) {
  const items = [
    { label: "team-onboarding.pdf", icon: undefined as IconName | undefined, x: 18, y: 22, t: 0.05 },
    { label: "Linear · PROJ-12", icon: "linear" as IconName, x: 62, y: 14, t: 0.15 },
    { label: "Notion docs (5)", icon: undefined, x: 78, y: 32, t: 0.25 },
    { label: "github.com/team/repo", icon: "github" as IconName, x: 12, y: 60, t: 0.35 },
    { label: "#ops · Slack", icon: "slack" as IconName, x: 70, y: 64, t: 0.45 },
    { label: "FAQs.docx", icon: undefined, x: 30, y: 78, t: 0.55 },
    { label: "Customer interviews", icon: undefined, x: 50, y: 88, t: 0.65 },
  ];

  return (
    <DesktopFrame title="ledger-bot · setup">
      <div className="relative h-full p-3 sm:p-5">
        <div className="relative h-full overflow-hidden rounded-lg border border-dashed border-[var(--color-xo-lime)]/35 bg-[var(--color-xo-lime)]/[0.03]">
          {/* center label */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-[var(--color-xo-lime)]/40 bg-[#08090a]/80 px-3 py-1 text-[11px] font-medium text-[var(--color-xo-lime)] backdrop-blur">
                <DropArrow />
                Drop anything here
              </div>
              <div className="mt-3 text-[12px] text-white/55">
                Files · Linear · Notion · GitHub · Slack · raw text
              </div>
            </div>
          </div>

          {/* items appear progressively as the user scrolls into the step */}
          {items.map((it) => (
            <BrainDumpItem
              key={it.label}
              local={local}
              t={it.t}
              x={it.x}
              y={it.y}
              icon={it.icon}
              label={it.label}
            />
          ))}

          {/* counter, also scroll-driven */}
          <BrainDumpCounter local={local} total={items.length} />
        </div>
      </div>
    </DesktopFrame>
  );
}

function BrainDumpItem({
  local,
  t,
  x,
  y,
  icon,
  label,
}: {
  local: MotionValue<number>;
  t: number;
  x: number;
  y: number;
  icon?: IconName;
  label: string;
}) {
  const opacity = useTransform(local, [t, t + 0.06], [0, 1]);
  const scale = useTransform(local, [t, t + 0.06], [0.6, 1]);
  const itemY = useTransform(local, [t, t + 0.1], [16, 0]);
  return (
    <div
      className="pointer-events-none absolute"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        transform: "translate(-50%, -50%)",
      }}
    >
      <motion.div
        style={{ opacity, scale, y: itemY }}
        className="flex items-center gap-1.5 rounded-md border border-white/10 bg-[#0d0f12]/95 px-2 py-1 text-[11px] text-white/85 shadow-[0_8px_24px_-12px_rgba(0,0,0,0.6)] backdrop-blur"
      >
        {icon ? <BrandIcon name={icon} size={11} /> : <FileGlyph />}
        <span className="truncate">{label}</span>
      </motion.div>
    </div>
  );
}

function BrainDumpCounter({
  local,
  total,
}: {
  local: MotionValue<number>;
  total: number;
}) {
  // Counter ticks from 0 toward 47 as the user scrolls. Total items
  // visible is `total`, but the indexed-fact count is much higher.
  const count = useTransform(local, [0.0, 0.95], [0, 47]);
  return (
    <div className="absolute bottom-3 right-3 flex items-center gap-2 rounded-md bg-black/60 px-2.5 py-1.5 backdrop-blur">
      <Spinner />
      <span className="font-mono text-[11px] text-white/85">
        <MotionNumber value={count} />
        <span className="ml-1 text-white/45">items indexing</span>
      </span>
      <span className="ml-1 hidden text-[10px] text-white/30 sm:inline">
        ({total} sources)
      </span>
    </div>
  );
}

/** Renders a MotionValue<number> as live text, rounding to the nearest int. */
function MotionNumber({ value }: { value: MotionValue<number> }) {
  const [v, setV] = useState(() => Math.round(value.get()));
  useMotionValueEvent(value, "change", (latest) => setV(Math.round(latest)));
  return <>{v}</>;
}

function DropArrow() {
  return (
    <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden>
      <path
        d="M6 1.5v7M3 6l3 3 3-3M2 11h8"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function FileGlyph() {
  return (
    <svg width="9" height="11" viewBox="0 0 9 11" fill="none" aria-hidden className="text-white/55">
      <path
        d="M1 1.5A.5.5 0 011.5 1H5l3 3v5.5a.5.5 0 01-.5.5h-6a.5.5 0 01-.5-.5v-8z"
        stroke="currentColor"
        strokeWidth="1"
      />
      <path d="M5 1v3h3" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}

function Spinner() {
  return (
    <svg
      width="11"
      height="11"
      viewBox="0 0 12 12"
      fill="none"
      className="animate-spin text-[var(--color-xo-lime)]"
      aria-hidden
    >
      <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeOpacity="0.25" strokeWidth="1.4" />
      <path d="M10.5 6a4.5 4.5 0 0 0-4.5-4.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

/* ============================================================
 * STEP 04 · AUTO-CONFIGURE (bars + chips fill with local scroll)
 * ============================================================ */

function StepConfigure({ local }: { local: MotionValue<number> }) {
  const memBar = useTransform(local, [0.0, 0.4], [0, 0.92]);
  const memCount = useTransform(local, [0.0, 0.4], [0, 47]);
  const skillsOp = useTransform(local, [0.3, 0.55], [0, 1]);
  const integOp = useTransform(local, [0.5, 0.75], [0, 1]);
  const taskBar = useTransform(local, [0.6, 0.9], [0, 0.55]);
  const taskCount = useTransform(local, [0.6, 0.9], [0, 12]);
  return (
    <DesktopFrame title="ledger-bot · configuring">
      <div className="grid h-full gap-3 p-4 sm:grid-cols-2 sm:gap-4 sm:p-5">
        <ConfigCard label="Memory" sub="facts indexed">
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-3xl font-semibold tracking-tight text-white">
              <MotionNumber value={memCount} />
            </span>
            <span className="text-[12px] text-white/55">facts</span>
          </div>
          <ScrollDrivenBar progress={memBar} />
        </ConfigCard>

        <ConfigCard label="Backlog" sub="tasks created">
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-3xl font-semibold tracking-tight text-[var(--color-xo-lime)]">
              <MotionNumber value={taskCount} />
            </span>
            <span className="text-[12px] text-white/55">tasks</span>
          </div>
          <ScrollDrivenBar progress={taskBar} lime />
        </ConfigCard>

        <ConfigCard label="Skills detected" sub="auto-wired from your context">
          <motion.div style={{ opacity: skillsOp }} className="mt-2 flex flex-wrap gap-1.5">
            {["linear-triage", "slack-replies", "doc-qa", "daily-summary"].map(
              (s) => (
                <code
                  key={s}
                  className="rounded bg-[var(--color-xo-lime)]/10 px-1.5 py-0.5 font-mono text-[10.5px] text-[var(--color-xo-lime)]"
                >
                  /{s}
                </code>
              ),
            )}
          </motion.div>
        </ConfigCard>

        <ConfigCard label="Integrations" sub="connected">
          <motion.div style={{ opacity: integOp }} className="mt-2 flex flex-wrap gap-1.5">
            {(["linear", "github", "slack", "claude-code"] as IconName[]).map(
              (icon) => (
                <span
                  key={icon}
                  className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.04] px-1.5 py-0.5 text-[10.5px] text-white/85"
                >
                  <BrandIcon name={icon} size={10} />
                  <span className="capitalize">
                    {icon === "claude-code" ? "Notion" : icon}
                  </span>
                  <CheckMini />
                </span>
              ),
            )}
          </motion.div>
        </ConfigCard>
      </div>
    </DesktopFrame>
  );
}

function ScrollDrivenBar({
  progress,
  lime,
}: {
  progress: MotionValue<number>;
  lime?: boolean;
}) {
  const width = useTransform(progress, (v) => `${v * 100}%`);
  return (
    <div className="mt-3 h-[3px] overflow-hidden rounded-full bg-white/[0.06]">
      <motion.div
        style={{ width }}
        className={`h-full rounded-full ${
          lime ? "bg-[var(--color-xo-lime)]" : "bg-white/40"
        }`}
      />
    </div>
  );
}

function ConfigCard({
  label,
  sub,
  children,
}: {
  label: string;
  sub: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col rounded-xl border border-white/8 bg-white/[0.02] p-4">
      <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/45">
        {label}
      </div>
      <div className="mt-1 text-[12px] text-white/55">{sub}</div>
      {children}
    </div>
  );
}

function CheckMini() {
  return (
    <svg width="8" height="8" viewBox="0 0 9 9" fill="none" aria-hidden>
      <path
        d="M2 5l2 2 4-4"
        stroke="var(--color-xo-lime)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ============================================================
 * STEP 05 · LIVE (chat lines materialise sequentially with scroll)
 * ============================================================ */

function StepLive({ local }: { local: MotionValue<number> }) {
  return (
    <DesktopFrame title="ledger-bot · live">
      <div className="flex h-full flex-col">
        <div className="flex items-center gap-2 border-b border-white/5 bg-black/20 px-3 py-2 text-[10px] text-white/55">
          <span className="size-1.5 animate-pulse rounded-full bg-[var(--color-xo-lime)]" />
          <span className="text-[var(--color-xo-lime)]">live</span>
          <span className="text-white/20">·</span>
          <span>uptime 14h 22m</span>
          <span className="text-white/20">·</span>
          <span>1.2M tokens / hr</span>
          <span className="ml-auto flex items-center gap-1 text-white/45">
            <ChannelIcon name="slack" />
            <ChannelIcon name="telegram" />
            <ChannelIcon name="whatsapp" />
            <ChannelIcon name="discord" />
          </span>
        </div>

        <div className="flex flex-1 flex-col gap-2.5 overflow-hidden p-3 sm:p-4">
          <ScrollChatLine
            local={local}
            t={0.05}
            who="agent"
            badge="OpenClaw · Slack"
            content={<>3 new tickets in Linear PROJ-12. Triaging now.</>}
          />
          <ScrollChatLine
            local={local}
            t={0.3}
            who="user"
            content={<>What about the auth ones?</>}
          />
          <ScrollChatLine
            local={local}
            t={0.55}
            who="agent"
            badge="OpenClaw · Slack"
            streaming
            content={
              <>
                <span className="text-[var(--color-xo-lime)]">✓</span>{" "}
                Found 4. Routed to{" "}
                <code className="rounded bg-white/[0.06] px-1 text-[11px]">
                  @security
                </code>
                . Drafting summary
              </>
            }
          />
        </div>
      </div>
    </DesktopFrame>
  );
}

function ChannelIcon({ name }: { name: IconName }) {
  return (
    <span className="flex size-5 items-center justify-center rounded-md border border-white/10 bg-white/[0.04]">
      <BrandIcon name={name} size={10} />
    </span>
  );
}

function ScrollChatLine({
  local,
  t,
  who,
  badge,
  content,
  streaming,
}: {
  local: MotionValue<number>;
  t: number;
  who: "user" | "agent";
  badge?: string;
  content: React.ReactNode;
  streaming?: boolean;
}) {
  const opacity = useTransform(local, [t, t + 0.08], [0, 1]);
  const y = useTransform(local, [t, t + 0.12], [10, 0]);
  const isUser = who === "user";
  return (
    <motion.div
      style={{ opacity, y }}
      className={`flex ${isUser ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`max-w-[80%] rounded-lg border px-3 py-2 text-[12px] leading-relaxed ${
          isUser
            ? "border-white/10 bg-white/[0.04] text-white/90"
            : "border-white/8 bg-white/[0.025] text-white/85"
        }`}
      >
        {!isUser && badge && (
          <div className="mb-1.5 flex items-center gap-1.5 text-[9.5px] font-medium uppercase tracking-wider text-[var(--color-xo-lime)]">
            <span className="size-1 rounded-full bg-[var(--color-xo-lime)]" />
            {badge}
          </div>
        )}
        <span>
          {content}
          {streaming && (
            <span className="ml-0.5 inline-block h-3 w-[2px] animate-pulse bg-[var(--color-xo-lime)] align-middle" />
          )}
        </span>
      </div>
    </motion.div>
  );
}

/* ============================================================
 * STEP 06 · FLEET (tiles stagger in with local scroll)
 * ============================================================ */

function StepFleet({ local }: { local: MotionValue<number> }) {
  const tiles: {
    name: string;
    agent: string;
    icon: IconName;
    state: "running" | "thinking" | "idle";
    role: string;
    t: number;
  }[] = [
    { name: "ledger-bot", agent: "OpenClaw", icon: "openclaw", state: "running", role: "Ops", t: 0.1 },
    { name: "research", agent: "Hermes", icon: "hermes", state: "thinking", role: "Research", t: 0.18 },
    { name: "ops-deck", agent: "OpenClaw", icon: "openclaw", state: "running", role: "Marketing", t: 0.26 },
    { name: "supportd", agent: "Claude Code", icon: "claude-code", state: "running", role: "Support", t: 0.34 },
    { name: "growth", agent: "Codex", icon: "codex", state: "running", role: "Engineer", t: 0.42 },
    { name: "design-rev", agent: "Claude Code", icon: "claude-code", state: "running", role: "Design", t: 0.5 },
    { name: "billing", agent: "OpenClaw", icon: "openclaw", state: "idle", role: "Billing", t: 0.58 },
    { name: "docs-bot", agent: "Hermes", icon: "hermes", state: "running", role: "Docs", t: 0.66 },
  ];

  const STATE_COLOR: Record<string, string> = {
    running: "var(--color-xo-lime)",
    thinking: "hsl(48, 90%, 60%)",
    idle: "hsl(0, 0%, 50%)",
  };

  return (
    <DesktopFrame title="xo.builders / suraj · fleet">
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between border-b border-emerald-500/30 bg-gradient-to-br from-black via-emerald-950 to-emerald-900 px-4 py-3">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-200/70">
              Your fleet
            </div>
            <div className="mt-0.5 text-base font-semibold text-white sm:text-lg">
              8 agents running
            </div>
          </div>
          <div className="hidden items-center gap-3 text-[10px] text-emerald-100/65 sm:flex">
            <span>1.2M tokens / hr</span>
            <span className="text-emerald-100/30">·</span>
            <span>uptime 99.97%</span>
          </div>
        </div>

        <div className="grid flex-1 grid-cols-2 gap-2 overflow-hidden p-3 sm:grid-cols-4 sm:gap-3 sm:p-4">
          {tiles.map(({ t, ...tile }) => (
            <FleetTile
              key={tile.name}
              local={local}
              t={t}
              {...tile}
              dotColor={STATE_COLOR[tile.state]}
            />
          ))}
        </div>
      </div>
    </DesktopFrame>
  );
}

function FleetTile({
  local,
  t,
  name,
  icon,
  role,
  state,
  dotColor,
}: {
  local: MotionValue<number>;
  t: number;
  name: string;
  agent: string;
  icon: IconName;
  state: "running" | "thinking" | "idle";
  role: string;
  dotColor: string;
}) {
  const opacity = useTransform(local, [t, t + 0.06], [0, 1]);
  const scale = useTransform(local, [t, t + 0.08], [0.9, 1]);
  const y = useTransform(local, [t, t + 0.1], [12, 0]);
  return (
    <motion.div
      style={{ opacity, scale, y }}
      className="flex min-h-0 flex-col gap-1.5 rounded-xl border border-white/10 bg-white/[0.02] p-2.5"
    >
      <div className="flex items-center gap-1.5">
        <div className="flex size-5 items-center justify-center rounded-md border border-white/10 bg-white/[0.04] text-white/85">
          <BrandIcon name={icon} size={10} />
        </div>
        <span className="truncate text-[11px] font-medium text-white">
          {name}
        </span>
        <span
          className="ml-auto size-1.5 rounded-full"
          style={{
            background: dotColor,
            boxShadow:
              state === "running" ? `0 0 8px ${dotColor}` : "none",
          }}
        />
      </div>
      <div className="text-[9.5px] uppercase tracking-wider text-white/35">
        {role}
      </div>
    </motion.div>
  );
}

/* ============================================================
 * Shared "desktop" frame
 * ============================================================ */

function DesktopFrame({
  title,
  tone,
  children,
}: {
  title: string;
  tone?: "modal";
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex aspect-[16/10] w-full max-w-[920px] flex-col overflow-hidden rounded-[14px] border border-white/10 bg-gradient-to-br from-[#0d0f12]/95 via-[#0a0c0e]/95 to-[#08090a]/95 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.7),0_0_0_1px_rgba(255,255,255,0.04)]">
      <div className="flex shrink-0 items-center gap-2 border-b border-white/5 px-3 py-2">
        <span className="size-2.5 rounded-full bg-white/15" />
        <span className="size-2.5 rounded-full bg-white/15" />
        <span className="size-2.5 rounded-full bg-[var(--color-xo-lime)]/70" />
        <span className="ml-3 truncate text-[11px] text-white/55">
          {tone === "modal" ? (
            <span className="rounded-md bg-white/[0.04] px-2 py-0.5">{title}</span>
          ) : (
            title
          )}
        </span>
      </div>
      <div className="relative flex-1 overflow-hidden">{children}</div>
    </div>
  );
}
