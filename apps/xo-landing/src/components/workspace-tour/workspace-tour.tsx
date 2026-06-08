"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { WorkspaceMock } from "@/components/hero/workspace-mock";
import { SectionHeader } from "@/components/stack/stack-section";

/**
 * WorkspaceTour: pinned-feel scroll section showing what working with
 * an agent looks like. Three "scenes" attached to scroll progress; each
 * scene highlights a part of the workspace with a side caption.
 */
const SCENES = [
  {
    // Region: file panel + drop affordance + memory/ folder badge
    eyebrow: "01 · Files + memory",
    title: "Drop your context in",
    body: "Drag a folder, paste a Linear board, forward an email. The agent indexes everything and remembers it across sessions. The memory/ folder shows you exactly what it knows, with a live fact count.",
    highlight: "files",
  },
  {
    // Region: code preview pane (agent.ts with imports)
    eyebrow: "02 · Code + skills",
    title: "It runs your real stack",
    body: "Look at agent.ts: real imports, real skills, real tools. The agent isn't sandboxed. It executes your actual code, calls your actual APIs, and pushes to your actual GitHub branches.",
    highlight: "code",
  },
  {
    // Region: chat panel (message stream + composer)
    eyebrow: "03 · Conversation",
    title: "Manage it like a teammate",
    body: "Stream of thought. Tool calls. Files appearing. Step in mid-task, redirect, take over, hand back. The workspace is a shared room, not a black box.",
    highlight: "chat",
  },
];

export function WorkspaceTour() {
  const ref = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  // Three caption scenes, lit one at a time
  const scene0Opacity = useTransform(scrollYProgress, [0, 0.1, 0.32, 0.4], [0, 1, 1, 0]);
  const scene1Opacity = useTransform(scrollYProgress, [0.35, 0.42, 0.62, 0.7], [0, 1, 1, 0]);
  const scene2Opacity = useTransform(scrollYProgress, [0.65, 0.72, 0.92, 1], [0, 1, 1, 0]);

  return (
    <section
      ref={ref}
      className="relative isolate w-full bg-gradient-to-b from-[#08090a] via-[#0a0b0c] to-[#08090a] py-20 sm:py-32"
      style={{ height: "300vh" }}
    >
      {/* sticky stage */}
      <div className="sticky top-0 flex h-screen items-center overflow-hidden">
        <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 sm:px-6 lg:grid-cols-[1fr_1.4fr] lg:gap-8">
          {/* left captions stack */}
          <div className="relative">
            <SectionHeader
              eyebrow="Inside the workspace"
              title={
                <>
                  Give it data.
                  <br />
                  <span className="text-white/55">Take it back any time.</span>
                </>
              }
            />
            <div className="relative mt-6 h-[180px] sm:mt-10 sm:h-[260px]">
              <Caption
                opacity={scene0Opacity}
                eyebrow={SCENES[0].eyebrow}
                title={SCENES[0].title}
                body={SCENES[0].body}
              />
              <Caption
                opacity={scene1Opacity}
                eyebrow={SCENES[1].eyebrow}
                title={SCENES[1].title}
                body={SCENES[1].body}
              />
              <Caption
                opacity={scene2Opacity}
                eyebrow={SCENES[2].eyebrow}
                title={SCENES[2].title}
                body={SCENES[2].body}
              />
            </div>
          </div>

          {/* right: workspace mock with spotlight overlays */}
          <div className="relative h-[360px] sm:h-[460px] lg:h-[520px]">
            <WorkspaceMock variant="tour" className="h-full" />
            <Spotlight opacity={scene0Opacity} pos="files" />
            <Spotlight opacity={scene1Opacity} pos="code" />
            <Spotlight opacity={scene2Opacity} pos="chat" />
          </div>
        </div>
      </div>
    </section>
  );
}

function Caption({
  opacity,
  eyebrow,
  title,
  body,
}: {
  opacity: ReturnType<typeof useTransform<number, number>>;
  eyebrow: string;
  title: string;
  body: string;
}) {
  return (
    <motion.div style={{ opacity }} className="absolute inset-0">
      <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--color-xo-lime)]">
        {eyebrow}
      </div>
      <div className="mt-2 text-2xl font-semibold tracking-tight text-white sm:mt-3 sm:text-3xl">
        {title}
      </div>
      <div className="mt-3 max-w-md text-[14px] leading-relaxed text-white/55 sm:mt-4 sm:text-[15px]">
        {body}
      </div>
    </motion.div>
  );
}

function Spotlight({
  opacity,
  pos,
}: {
  opacity: ReturnType<typeof useTransform<number, number>>;
  pos: "files" | "code" | "chat";
}) {
  /*
   * The WorkspaceMock has three distinct horizontal regions on md+:
   *   left panel:  files tree (0% .. 18%) | code preview (18% .. 42%)
   *   right panel: chat (42% .. 100%)
   *
   * Each spotlight tracks one region exactly. The titlebar + tab strip
   * take roughly 76px from the top, so all spotlights start there.
   * On < md the left panel collapses and spotlights are hidden.
   */
  const positions: Record<typeof pos, React.CSSProperties> = {
    files: { left: "0", width: "18%", top: "76px", bottom: "0" },
    code: { left: "18%", width: "24%", top: "76px", bottom: "0" },
    chat: { left: "42%", right: "0", top: "76px", bottom: "0" },
  };
  return (
    <motion.div
      aria-hidden
      style={{ opacity, ...positions[pos] }}
      className="pointer-events-none absolute hidden rounded-xl border border-[var(--color-xo-lime)]/40 md:block"
    >
      <div
        className="absolute inset-0 rounded-xl"
        style={{
          background:
            "radial-gradient(closest-side, hsla(92,66%,53%,0.18), transparent 70%)",
        }}
      />
    </motion.div>
  );
}
