"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { XOMark } from "@/components/brand/xo-mark";

/**
 * FinalCTA: closer with the chevron mark scaling up as we scroll in.
 * Two CTAs, no walls of text.
 */
export function FinalCTA() {
  const ref = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end end"],
  });
  const markScale = useTransform(scrollYProgress, [0, 1], [0.6, 1.2]);
  const glowOpacity = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <section
      ref={ref}
      className="relative isolate flex min-h-[90vh] w-full items-center justify-center overflow-hidden py-32"
    >
      {/* glow */}
      <motion.div
        aria-hidden
        style={{ opacity: glowOpacity }}
        className="pointer-events-none absolute inset-0 -z-10"
      >
        <div
          className="absolute left-1/2 top-1/2 size-[900px] -translate-x-1/2 -translate-y-1/2"
          style={{
            background:
              "radial-gradient(closest-side, hsla(92,66%,53%,0.18), transparent 70%)",
            filter: "blur(40px)",
          }}
        />
      </motion.div>

      {/* mark */}
      <motion.div
        style={{ scale: markScale }}
        className="absolute inset-0 -z-10 flex items-center justify-center opacity-30"
      >
        <XOMark size={520} />
      </motion.div>

      <div className="relative mx-auto flex max-w-3xl flex-col items-center px-6 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-white/55 backdrop-blur">
          <span className="size-1 animate-pulse rounded-full bg-[var(--color-xo-lime)]" />
          Free forever · zero DevOps
        </div>

        <h2 className="mt-7 text-balance text-[44px] font-semibold leading-[1.05] tracking-[-0.02em] text-white sm:text-[64px]">
          Your{" "}
          <span className="bg-gradient-to-br from-[var(--color-xo-lime)] via-[hsl(92,80%,70%)] to-white bg-clip-text text-transparent">
            AI workforce
          </span>{" "}
          is one dump away.
        </h2>

        <p className="mt-6 max-w-xl text-base text-white/60 sm:text-lg">
          Brain-dump your context. Pick an agent. Pick a model. The team
          configures itself and ships in under a minute.
        </p>

        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <a
            href="https://beta.xo.builders/"
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-xo-lime)] px-6 py-3.5 text-sm font-semibold text-black shadow-[0_0_0_1px_rgba(255,255,255,0.1),0_20px_60px_-20px_hsla(92,66%,53%,0.6)] transition hover:bg-[hsl(92,66%,60%)]"
          >
            Start free
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
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
            href="https://docs.xo.builders"
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-6 py-3.5 text-sm font-medium text-white/85 backdrop-blur transition hover:bg-white/[0.06]"
          >
            Read the docs
          </a>
        </div>

        <div className="mt-10 text-[11px] uppercase tracking-[0.2em] text-white/35">
          Free forever · 4 hours of agent time / day · No credit card
        </div>
      </div>
    </section>
  );
}
