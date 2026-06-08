"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { ChevronParticles } from "./chevron-particles";
import { WorkspaceMock } from "./workspace-mock";

export function Hero() {
  const ref = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  // As the user scrolls, the chevron mark drifts up & fades while the
  // workspace mock rises into view from below.
  const markY = useTransform(scrollYProgress, [0, 1], [0, -160]);
  const markOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [1, 0.8, 0]);
  const mockY = useTransform(scrollYProgress, [0, 1], [120, -80]);
  const mockOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [0, 1, 1]);
  const mockScale = useTransform(scrollYProgress, [0, 1], [0.94, 1]);

  return (
    <section
      ref={ref}
      className="relative isolate flex min-h-[120vh] w-full flex-col items-center overflow-hidden pt-[140px]"
    >
      {/* haze background */}
      <div className="haze pointer-events-none absolute inset-0 -z-10" />

      {/* ambient grid */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.08]"
        style={{
          backgroundImage:
            "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          maskImage:
            "radial-gradient(circle at 50% 40%, black 30%, transparent 80%)",
        }}
      />

      {/* eyebrow + headline */}
      <motion.div
        style={{ y: markY, opacity: markOpacity }}
        className="relative z-20 mx-auto flex w-full max-w-5xl flex-col items-center px-6 text-center"
      >
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-white/70 backdrop-blur">
          <span className="inline-block size-1.5 animate-pulse rounded-full bg-[var(--color-xo-lime)]" />
          For solo founders and small teams
        </div>

        <h1 className="text-balance text-[44px] font-semibold leading-[1.05] tracking-[-0.02em] text-white sm:text-[68px] md:text-[84px]">
          Launch your AI fleet{" "}
          <span className="bg-gradient-to-br from-[var(--color-xo-lime)] via-[hsl(92,80%,70%)] to-white bg-clip-text text-transparent">
            in&nbsp;minutes.
          </span>
        </h1>

        <p className="mx-auto mt-6 max-w-xl text-balance text-base text-white/65 sm:text-lg">
          One-click setup. Brain-dump your context. Pick an agent, pick a
          model, swap either anytime. Your team is online in minutes:
          running 24/7, reachable everywhere, ten times cheaper than a hire.
        </p>

        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <a
            href="https://beta.xo.builders/"
            className="group inline-flex items-center gap-2 rounded-xl bg-[var(--color-xo-lime)] px-5 py-3 text-sm font-semibold text-black shadow-[0_0_0_1px_rgba(255,255,255,0.1),0_20px_60px_-20px_hsla(92,66%,53%,0.6)] transition hover:bg-[hsl(92,66%,60%)]"
          >
            Start free
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              className="transition group-hover:translate-x-0.5"
            >
              <path
                d="M3 7h8M7 3l4 4-4 4"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>
          <a
            href="#pricing"
            className="rounded-xl border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-medium text-white/85 backdrop-blur transition hover:bg-white/[0.06]"
          >
            See pricing
          </a>
        </div>

        <div className="mt-4 text-[12px] text-white/45">
          Free forever · 4 hours of agent time per day · No credit card
        </div>
      </motion.div>

      {/* particle mark */}
      <motion.div
        style={{ y: markY, opacity: markOpacity }}
        className="relative z-10 mt-10 h-[420px] w-full max-w-[1100px] sm:mt-12"
      >
        <ChevronParticles />
        {/* glow halo */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(closest-side, hsla(92,66%,53%,0.18), transparent 70%)",
            filter: "blur(40px)",
          }}
        />
      </motion.div>

      {/* workspace materializing below the fold */}
      <motion.div
        style={{ y: mockY, opacity: mockOpacity, scale: mockScale }}
        className="relative z-10 mx-auto -mt-24 w-full max-w-[1100px] px-6"
      >
        <WorkspaceMock variant="hero" className="h-[420px]" />
        {/* base reflection */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-12 -bottom-8 h-24 rounded-[100%] blur-2xl"
          style={{
            background:
              "radial-gradient(closest-side, hsla(92,66%,53%,0.35), transparent 80%)",
          }}
        />
      </motion.div>

      {/* socials / proof strip */}
      <div className="relative z-10 mt-24 flex w-full flex-col items-center px-6 pb-24 text-center">
        <div className="text-[11px] uppercase tracking-[0.2em] text-white/35">
          Live today · over a trillion tokens / month
        </div>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 text-sm text-white/55">
          <RuntimeChip>OpenClaw</RuntimeChip>
          <RuntimeChip>Claude Code</RuntimeChip>
          <RuntimeChip>Hermes</RuntimeChip>
          <RuntimeChip>Custom agents</RuntimeChip>
        </div>
      </div>
    </section>
  );
}

function RuntimeChip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.02] px-3 py-1.5 text-xs text-white/65">
      <span className="size-1 rounded-full bg-[var(--color-xo-lime)]" />
      {children}
    </span>
  );
}
