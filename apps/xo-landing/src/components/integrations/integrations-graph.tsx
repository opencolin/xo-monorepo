"use client";

import { motion } from "motion/react";
import { BrandIcon, type IconName } from "@/components/brand/brand-icon";
import { SectionHeader } from "@/components/stack/stack-section";

/**
 * IntegrationsGraph: "Stay connected everywhere".
 *
 * Center: the XO workspace.
 * Outer ring: 12 live surfaces grouped into three kinds.
 *   - tool:    pulls work into the agent (Linear, GitHub, Jira, ClickUp)
 *   - channel: where the agent talks (Slack, Telegram, WhatsApp, Discord, Teams)
 *   - client:  where the agent shows up via MCP (Claude, ChatGPT, Cursor)
 * Nodes are evenly spaced every 30 degrees on a single ring at r=230.
 */
type IntegrationNode = {
  name: string;
  icon: IconName;
  x: number;
  y: number;
  kind: "tool" | "client" | "channel";
};

const INTEGRATIONS: IntegrationNode[] = [
  // Top arc: tools that feed the agent
  { name: "Linear", icon: "linear", x: 0, y: -230, kind: "tool" },
  { name: "GitHub", icon: "github", x: 115, y: -199, kind: "tool" },
  { name: "Jira", icon: "jira", x: 199, y: -115, kind: "tool" },
  { name: "ClickUp", icon: "clickup", x: 230, y: 0, kind: "tool" },
  // Right + bottom arc: channels where the agent talks
  { name: "Slack", icon: "slack", x: 199, y: 115, kind: "channel" },
  { name: "Telegram", icon: "telegram", x: 115, y: 199, kind: "channel" },
  { name: "WhatsApp", icon: "whatsapp", x: 0, y: 230, kind: "channel" },
  { name: "Discord", icon: "discord", x: -115, y: 199, kind: "channel" },
  { name: "Teams", icon: "teams", x: -199, y: 115, kind: "channel" },
  // Left arc: MCP clients where XO shows up
  { name: "Cursor", icon: "cursor", x: -230, y: 0, kind: "client" },
  { name: "ChatGPT", icon: "chatgpt", x: -199, y: -115, kind: "client" },
  { name: "Claude", icon: "claude", x: -115, y: -199, kind: "client" },
];

export function IntegrationsGraph() {
  return (
    <section
      id="integrations"
      className="relative isolate w-full overflow-hidden py-32"
    >
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeader
          align="center"
          eyebrow="Connected · 24 / 7"
          title={
            <>
              Always on. Reachable
              <br />
              <span className="text-white/55">from anywhere you work.</span>
            </>
          }
          subtitle="Once your agent is up, it stays up. Reach it on Slack, WhatsApp, Telegram, Discord, or Teams. Open the same workspace from inside Claude, ChatGPT, or Cursor. Pull from Linear, GitHub, Jira, ClickUp. One agent, every surface, twenty-four hours a day."
        />

        <div className="relative mx-auto mt-20 aspect-square w-full max-w-[720px]">
          <svg viewBox="-300 -300 600 600" className="absolute inset-0 h-full w-full">
            <defs>
              <linearGradient id="spoke-grad" x1="0" x2="1" y1="0" y2="0">
                <stop offset="0%" stopColor="hsla(92,66%,53%,0)" />
                <stop offset="55%" stopColor="hsla(92,66%,53%,0.4)" />
                <stop offset="100%" stopColor="hsla(92,66%,53%,0.85)" />
              </linearGradient>
            </defs>

            {/* concentric backdrop rings */}
            {[90, 160, 230].map((r) => (
              <circle
                key={r}
                cx={0}
                cy={0}
                r={r}
                fill="none"
                stroke="rgba(255,255,255,0.05)"
                strokeWidth="1"
              />
            ))}

            {/* spokes with traveling dash */}
            {INTEGRATIONS.map((node, i) => (
              <g key={i}>
                <line
                  x1={0}
                  y1={0}
                  x2={node.x}
                  y2={node.y}
                  stroke="rgba(255,255,255,0.06)"
                  strokeWidth="1"
                />
                <motion.line
                  x1={0}
                  y1={0}
                  x2={node.x}
                  y2={node.y}
                  stroke="url(#spoke-grad)"
                  strokeWidth="1.4"
                  strokeDasharray="6 14"
                  initial={{ strokeDashoffset: 0 }}
                  animate={{ strokeDashoffset: -200 }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "linear",
                    delay: i * 0.18,
                  }}
                />
              </g>
            ))}
          </svg>

          {/* nodes */}
          <div className="absolute inset-0">
            {INTEGRATIONS.map((node, i) => (
              <div
                key={node.name}
                /*
                 * Outer wrapper handles position. `left`/`top` use
                 * percentages of the *parent*, then translate(-50%,-50%)
                 * centers the chip on that point.
                 *
                 * Inner `motion.div` is then free to scale/fade without
                 * fighting the centering transform (an earlier
                 * implementation collapsed both into one transform: calc()
                 * which incorrectly used percentages of the *chip's own*
                 * width and stacked every node over the centre).
                 */
                className="absolute"
                style={{
                  left: `${(node.x / 600 + 0.5) * 100}%`,
                  top: `${(node.y / 600 + 0.5) * 100}%`,
                  transform: "translate(-50%, -50%)",
                }}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.6 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ delay: i * 0.06, duration: 0.5 }}
                >
                  <IntegrationNodeChip name={node.name} icon={node.icon} />
                </motion.div>
              </div>
            ))}
          </div>

          {/* center workspace */}
          <div className="absolute inset-0 flex items-center justify-center">
            <CenterWorkspace />
          </div>
        </div>
      </div>
    </section>
  );
}

function IntegrationNodeChip({
  name,
  icon,
}: {
  name: string;
  icon: IconName;
}) {
  return (
    /*
     * No self-translate here. The outer wrapper in the loop already
     * centers the chip on its target coordinate via translate(-50%,-50%).
     */
    <div className="group relative flex flex-col items-center gap-1.5">
      <div className="flex size-11 items-center justify-center rounded-xl border border-white/10 bg-[#0d0f12]/90 text-white/85 shadow-[0_8px_24px_-12px_rgba(0,0,0,0.6)] backdrop-blur transition group-hover:border-[var(--color-xo-lime)]/50 group-hover:bg-[#10131A]/90">
        <BrandIcon name={icon} size={22} />
      </div>
      <div className="rounded-md bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-white/85 backdrop-blur">
        {name}
      </div>
    </div>
  );
}

function CenterWorkspace() {
  return (
    <div className="relative">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 rounded-2xl"
        style={{
          background:
            "radial-gradient(closest-side, hsla(92,66%,53%,0.5), transparent 70%)",
          filter: "blur(30px)",
        }}
      />
      <div className="rounded-xl border border-[var(--color-xo-lime)]/30 bg-[#0a0b0c]/95 p-3 text-center shadow-[0_0_0_1px_rgba(255,255,255,0.05)]">
        <div className="text-[10px] uppercase tracking-wider text-[var(--color-xo-lime)]">
          MCP
        </div>
        <div className="mt-1 text-sm font-semibold text-white">workspace</div>
      </div>
    </div>
  );
}
