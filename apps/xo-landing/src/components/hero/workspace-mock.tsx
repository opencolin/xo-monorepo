"use client";

import { motion } from "motion/react";
import { BrandIcon } from "@/components/brand/brand-icon";

/**
 * WorkspaceMock: a faithful static recreation of the live XO project
 * workspace page (xo-swarm/app/projects/[...slug]/page.tsx).
 *
 * The real layout is a horizontal `ResizablePanelGroup` with:
 *   - Left panel (CodeTab): repo/files context
 *   - Right panel (collapsible): Chat | Files | Secrets | Preview
 *   - Right-panel header: view label + close X
 *
 * Chat bubbles mirror the shape of MessageBubble.tsx in xo-swarm:
 *   - max-w-[80%], rounded-lg p-4
 *   - bg-card / bg-card/30 with border-border
 *   - Assistant: small context icon + label, streaming indicator
 *   - User: aligned right, lighter bg
 *   - Timestamp at bottom (HH:MM)
 *
 * Mobile-first: on viewports < md, the left repo panel collapses; chat
 * takes the full width. The bar above the panels stays the same shape.
 */
export function WorkspaceMock({
  className = "",
  variant = "hero",
}: {
  className?: string;
  variant?: "hero" | "tour";
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-[14px] border border-white/10 bg-gradient-to-br from-[#0d0f12]/95 via-[#0a0c0e]/95 to-[#08090a]/95 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.6),0_0_0_1px_rgba(255,255,255,0.04)] ${className}`}
    >
      {/* App titlebar */}
      <div className="flex items-center gap-2 border-b border-white/5 px-3 py-2">
        <span className="size-2.5 rounded-full bg-white/15" />
        <span className="size-2.5 rounded-full bg-white/15" />
        <span className="size-2.5 rounded-full bg-[var(--color-xo-lime)]/70" />
        <div className="ml-3 hidden items-center gap-2 text-[11px] text-white/55 sm:flex">
          <span className="rounded-md bg-white/[0.04] px-2 py-0.5">
            xo.builders / suraj
          </span>
          <span className="text-white/30">/</span>
          <span className="text-white/70">ledger-bot</span>
        </div>
        <div className="ml-auto flex items-center gap-1.5 text-[10px] text-white/40">
          <span className="size-1.5 animate-pulse rounded-full bg-[var(--color-xo-lime)]" />
          live
        </div>
      </div>

      {/* Top tab strip: matches the real project page view tabs */}
      <div className="flex items-center gap-0.5 border-b border-white/5 bg-black/20 px-2">
        <ViewTab label="Chat" active />
        <ViewTab label="Files" />
        <ViewTab label="Secrets" />
        <ViewTab label="Preview" />
        <button
          aria-label="Close panel"
          className="ml-auto flex size-7 items-center justify-center rounded-md text-white/45 hover:bg-white/[0.05] hover:text-white"
        >
          <CloseIcon />
        </button>
      </div>

      {/* Two-pane layout: code panel + chat panel */}
      <div className="grid grid-cols-1 divide-x divide-white/5 md:grid-cols-[42%_58%]">
        {/* Left: code/repo panel (CodeTab equivalent) */}
        <CodePanel />
        {/* Right: chat panel (ProjectChat equivalent) */}
        <ChatPanel />
      </div>

      {/* Subtle scanning gradient for the hero variant: keeps the snapshot alive */}
      {variant === "hero" && (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          initial={{ opacity: 0.0 }}
          animate={{ opacity: [0.0, 0.18, 0.0] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
          style={{
            background:
              "linear-gradient(180deg, transparent 0%, hsla(92,66%,53%,0.07) 45%, transparent 90%)",
          }}
        />
      )}
    </div>
  );
}

/* ----------------------- left panel (CodeTab) ----------------------- */

function CodePanel() {
  return (
    <div className="hidden min-h-0 flex-col md:flex">
      {/* Repo header */}
      <div className="flex items-center gap-2 border-b border-white/5 px-4 py-3">
        <BrandIcon name="github" size={14} className="opacity-85" />
        <span className="truncate text-[12px] font-medium text-white/85">
          surshar/ledger-bot
        </span>
        <span className="ml-auto rounded bg-white/[0.04] px-1.5 py-0.5 text-[10px] text-white/55">
          main
        </span>
      </div>

      {/* File tree + code preview */}
      <div className="grid min-h-0 flex-1 grid-cols-[44%_56%]">
        {/* file tree */}
        <div className="flex flex-col border-r border-white/5">
          <div className="flex-1 space-y-0.5 px-2 py-3 text-[11px]">
            <Dir label="ledger-bot" indent={0} open />
            <Dir label="src" indent={1} open />
            <File label="agent.ts" indent={2} active />
            <File label="memory.ts" indent={2} />
            <File label="skills.ts" indent={2} />
            <DirWithCount label="memory" indent={1} count="47" open />
            <File label="MEMORY.md" indent={2} />
            <File label="TASKS.md" indent={2} />
            <Dir label="skills" indent={1} />
            <File label=".env" indent={1} dim />
            <File label="package.json" indent={1} />
            <File label="README.md" indent={1} />
          </div>
          {/* Drop affordance: gives the "give it data" caption something
              to point at. Subtle dashed border + label. */}
          <div className="m-2 flex items-center justify-center gap-1.5 rounded-md border border-dashed border-white/15 bg-white/[0.02] px-2 py-1.5 text-[10px] text-white/45">
            <PlusGlyph />
            Drop files
          </div>
        </div>

        {/* code preview */}
        <div className="overflow-hidden bg-black/30">
          <div className="flex items-center gap-1.5 border-b border-white/5 px-3 py-1.5 text-[10px] text-white/45">
            <span className="text-white/70">agent.ts</span>
            <span className="text-white/25">·</span>
            <span>32 lines</span>
          </div>
          <pre className="overflow-hidden whitespace-pre px-3 py-2 font-mono text-[10.5px] leading-[1.55] text-white/65">
            <Line n={1}>
              <Tok kw>import</Tok> {"{ "}
              <Tok name>OpenClaw</Tok>
              {" }"} <Tok kw>from</Tok> <Tok str>{`"@xo/openclaw"`}</Tok>;
            </Line>
            <Line n={2}>
              <Tok kw>import</Tok> {"{ "}
              <Tok name>linear</Tok>, <Tok name>github</Tok>
              {" }"} <Tok kw>from</Tok> <Tok str>{`"./skills"`}</Tok>;
            </Line>
            <Line n={3} />
            <Line n={4}>
              <Tok kw>const</Tok> <Tok name>agent</Tok> ={" "}
              <Tok kw>new</Tok> <Tok type>OpenClaw</Tok>({"{"}
            </Line>
            <Line n={5}>
              {"  "}name: <Tok str>{`"ledger-bot"`}</Tok>,
            </Line>
            <Line n={6}>
              {"  "}skills: [<Tok name>linear</Tok>, <Tok name>github</Tok>],
            </Line>
            <Line n={7}>{"});"}</Line>
            <Line n={8} />
            <Line n={9}>
              <Tok kw>await</Tok> <Tok name>agent</Tok>.<Tok fn>start</Tok>();
            </Line>
          </pre>
        </div>
      </div>
    </div>
  );
}

/* ----------------------- right panel (ProjectChat) ----------------------- */

function ChatPanel() {
  return (
    <div className="flex min-h-0 flex-col">
      {/* messages */}
      <div className="flex flex-1 flex-col gap-3 overflow-hidden p-3 sm:p-4">
        <ChatBubble
          role="assistant"
          context="OpenClaw"
          content={
            <>
              Pulled the latest from <Code>main</Code>. 4 PRs touch the auth
              middleware. Running tests now.
            </>
          }
          time="14:02"
        />
        <ChatBubble
          role="user"
          content={<>ship it once tests pass, no manual QA today</>}
          time="14:03"
        />
        <ChatBubble
          role="assistant"
          context="OpenClaw"
          streaming
          content={
            <>
              <span className="text-[var(--color-xo-lime)]">✓</span>{" "}
              <b className="text-white/90">142 / 142</b> tests passing.
              Merging in 30s
            </>
          }
          time="14:04"
        />
      </div>

      {/* composer */}
      <div className="border-t border-white/5 p-2 sm:p-3">
        <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2">
          <span className="text-[12px] text-white/45">Message ledger-bot</span>
          <span className="ml-auto flex items-center gap-1.5 text-[10px] text-white/35">
            <kbd className="rounded border border-white/10 bg-white/[0.04] px-1 py-0.5">
              ⌘
            </kbd>
            <kbd className="rounded border border-white/10 bg-white/[0.04] px-1 py-0.5">
              ↵
            </kbd>
          </span>
        </div>
      </div>
    </div>
  );
}

/* ----------------------- atoms ----------------------- */

function ViewTab({ label, active }: { label: string; active?: boolean }) {
  return (
    <button
      className={`relative px-3 py-2 text-[11px] font-medium transition ${
        active ? "text-white" : "text-white/55 hover:text-white"
      }`}
    >
      {label}
      {active && (
        <span className="absolute inset-x-2 bottom-0 h-[2px] rounded-full bg-[var(--color-xo-lime)]" />
      )}
    </button>
  );
}

function CloseIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
      <path
        d="M3 3l6 6M9 3l-6 6"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function Dir({
  label,
  indent,
  open,
}: {
  label: string;
  indent: number;
  open?: boolean;
}) {
  return (
    <div
      className="flex items-center gap-1.5 truncate text-white/75"
      style={{ paddingLeft: indent * 10 + 4 }}
    >
      <span className="text-[8px] text-white/45">{open ? "▾" : "▸"}</span>
      <span>{label}</span>
    </div>
  );
}

function DirWithCount({
  label,
  indent,
  open,
  count,
}: {
  label: string;
  indent: number;
  open?: boolean;
  count: string;
}) {
  return (
    <div
      className="flex items-center gap-1.5 truncate text-white"
      style={{ paddingLeft: indent * 10 + 4 }}
    >
      <span className="text-[8px] text-[var(--color-xo-lime)]">{open ? "▾" : "▸"}</span>
      <span>{label}</span>
      <span className="ml-auto rounded bg-[var(--color-xo-lime)]/15 px-1 py-px text-[8.5px] font-mono text-[var(--color-xo-lime)]">
        {count}
      </span>
    </div>
  );
}

function PlusGlyph() {
  return (
    <svg width="9" height="9" viewBox="0 0 9 9" fill="none" aria-hidden>
      <path d="M4.5 1v7M1 4.5h7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

function File({
  label,
  indent,
  active,
  dim,
}: {
  label: string;
  indent: number;
  active?: boolean;
  dim?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-1.5 truncate rounded px-1 ${
        active
          ? "bg-[var(--color-xo-lime)]/10 text-white"
          : dim
            ? "text-white/35"
            : "text-white/60"
      }`}
      style={{ paddingLeft: indent * 10 + 12 }}
    >
      <span className="text-[8px] text-white/30">·</span>
      <span>{label}</span>
    </div>
  );
}

function Line({ n, children }: { n: number; children?: React.ReactNode }) {
  return (
    <div className="flex">
      <span className="mr-3 inline-block w-4 select-none text-right text-white/20">
        {n}
      </span>
      <span className="min-w-0 flex-1">{children ?? " "}</span>
    </div>
  );
}

function Tok({
  children,
  kw,
  str,
  name,
  fn,
  type,
}: {
  children: React.ReactNode;
  kw?: boolean;
  str?: boolean;
  name?: boolean;
  fn?: boolean;
  type?: boolean;
}) {
  let cls = "text-white/75";
  if (kw) cls = "text-[hsl(305,80%,75%)]";
  else if (str) cls = "text-[hsl(92,66%,65%)]";
  else if (name) cls = "text-[hsl(210,80%,75%)]";
  else if (fn) cls = "text-[hsl(40,90%,70%)]";
  else if (type) cls = "text-[hsl(180,55%,70%)]";
  return <span className={cls}>{children}</span>;
}

/**
 * ChatBubble: same visual shape as the live XO MessageBubble.
 * - max-w-[80%], rounded-lg, p-3 (smaller than full app for the landing)
 * - context icon + label at top of assistant messages
 * - streaming caret + "Generating" indicator
 * - timestamp at bottom in muted/lime colour
 */
function ChatBubble({
  role,
  context,
  content,
  time,
  streaming,
}: {
  role: "user" | "assistant";
  context?: string;
  content: React.ReactNode;
  time: string;
  streaming?: boolean;
}) {
  const isUser = role === "user";
  return (
    <div
      className={`flex gap-2.5 ${isUser ? "justify-end" : "justify-start"}`}
    >
      {!isUser && (
        <div className="mt-0.5 hidden size-7 shrink-0 items-center justify-center rounded-full border border-[var(--color-xo-lime)]/30 bg-[var(--color-xo-lime)]/10 text-[var(--color-xo-lime)] sm:flex">
          <BrandIcon name="openclaw" size={14} />
        </div>
      )}
      <div
        className={`max-w-[85%] rounded-lg border px-3 py-2.5 text-[12px] leading-relaxed shadow-sm sm:max-w-[80%] ${
          isUser
            ? "border-white/10 bg-white/[0.04] text-white/90"
            : "border-white/8 bg-white/[0.025] text-white/85"
        }`}
      >
        {!isUser && context && (
          <div className="mb-1.5 flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-[var(--color-xo-lime)]">
            <span className="size-1 rounded-full bg-[var(--color-xo-lime)]" />
            {context}
          </div>
        )}
        <div>
          {content}
          {streaming && (
            <span className="ml-0.5 inline-block h-3 w-[2px] animate-pulse bg-[var(--color-xo-lime)] align-middle" />
          )}
        </div>
        {streaming && (
          <div className="mt-1.5 flex items-center gap-1.5 text-[10px] text-white/40">
            <Spinner />
            <span>Generating</span>
          </div>
        )}
        <div
          className={`mt-1.5 text-[10px] ${
            isUser ? "text-[var(--color-xo-lime)]/85" : "text-white/35"
          }`}
        >
          {time}
        </div>
      </div>
      {isUser && (
        <div className="mt-0.5 hidden size-7 shrink-0 items-center justify-center rounded-full bg-white/[0.06] text-white/65 sm:flex">
          <UserGlyph />
        </div>
      )}
    </div>
  );
}

function Code({ children }: { children: React.ReactNode }) {
  return (
    <code className="rounded bg-white/[0.06] px-1 py-[1px] font-mono text-[11px] text-white/85">
      {children}
    </code>
  );
}

function Spinner() {
  return (
    <svg
      width="11"
      height="11"
      viewBox="0 0 12 12"
      fill="none"
      className="animate-spin"
      aria-hidden
    >
      <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeOpacity="0.25" strokeWidth="1.4" />
      <path
        d="M10.5 6a4.5 4.5 0 0 0-4.5-4.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function UserGlyph() {
  return (
    <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden>
      <circle cx="7" cy="5" r="2.4" stroke="currentColor" strokeWidth="1.2" />
      <path
        d="M2.5 12.5c.7-2.5 2.4-3.7 4.5-3.7s3.8 1.2 4.5 3.7"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}
