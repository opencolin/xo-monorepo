import type { ReactNode } from "react";

// Future of Work visual kit. Theme-aware (fd-* tokens), no external deps.
// Phosphor icon classes are written as literals so Tailwind generates them.

const ICONS: Record<string, string> = {
  userPlus: "icon-[ph--user-plus-fill]",
  users: "icon-[ph--users-fill]",
  user: "icon-[ph--user-fill]",
  brain: "icon-[ph--brain-fill]",
  robot: "icon-[ph--robot-fill]",
  clock: "icon-[ph--clock-fill]",
  identity: "icon-[ph--identification-card-fill]",
  budget: "icon-[ph--wallet-fill]",
  eye: "icon-[ph--eye-fill]",
  shield: "icon-[ph--shield-check-fill]",
  cube: "icon-[ph--cube-fill]",
  package: "icon-[ph--package-fill]",
  server: "icon-[ph--hard-drives-fill]",
  network: "icon-[ph--share-network-fill]",
  handshake: "icon-[ph--handshake-fill]",
  workflow: "icon-[ph--flow-arrow-fill]",
  rocket: "icon-[ph--rocket-fill]",
  code: "icon-[ph--code-fill]",
  refresh: "icon-[ph--arrows-clockwise-fill]",
  check: "icon-[ph--check-circle-fill]",
  target: "icon-[ph--target-fill]",
  gauge: "icon-[ph--gauge-fill]",
  tools: "icon-[ph--wrench-fill]",
  database: "icon-[ph--database-fill]",
  files: "icon-[ph--files-fill]",
  chat: "icon-[ph--chat-circle-fill]",
  building: "icon-[ph--buildings-fill]",
  lightning: "icon-[ph--lightning-fill]",
  scales: "icon-[ph--scales-fill]",
  sparkle: "icon-[ph--sparkle-fill]",
  trendDown: "icon-[ph--trend-down-fill]",
  trendUp: "icon-[ph--trend-up-fill]",
  arrow: "icon-[ph--arrow-right-fill]",
  briefcase: "icon-[ph--briefcase-fill]",
  ticket: "icon-[ph--ticket-fill]",
  report: "icon-[ph--file-text-fill]",
  receipt: "icon-[ph--receipt-fill]",
};

function Icon({ name, className }: { name: string; className?: string }) {
  const cls = ICONS[name] ?? "icon-[ph--circle-fill]";
  return <span className={`${cls} ${className ?? ""}`} aria-hidden="true" />;
}

type Item = { icon: string; title: string; desc?: string };

export function PhaseHero({
  number,
  title,
  tagline,
  icon,
}: {
  number: string;
  title: string;
  tagline: string;
  icon: string;
}) {
  return (
    <div className="not-prose mb-10 overflow-hidden rounded-2xl border border-fd-border bg-fd-card">
      <div className="flex items-center gap-5 p-6 sm:p-8">
        <div className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-fd-primary/10 text-fd-primary">
          <Icon name={icon} className="size-8" />
        </div>
        <div>
          <div className="text-xs font-medium uppercase tracking-[0.18em] text-fd-primary">
            Phase {number}
          </div>
          <div className="mt-1 text-2xl font-bold tracking-tight text-fd-foreground sm:text-3xl">
            {title}
          </div>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-fd-muted-foreground">
            {tagline}
          </p>
        </div>
      </div>
    </div>
  );
}

function Tile({
  icon,
  label,
  sub,
  tone = "muted",
}: {
  icon: string;
  label: string;
  sub?: string;
  tone?: "muted" | "primary";
}) {
  const toneCls =
    tone === "primary"
      ? "border-fd-primary/40 bg-fd-primary/10 text-fd-primary"
      : "border-fd-border bg-fd-background text-fd-muted-foreground";
  return (
    <div className={`flex items-center gap-3 rounded-xl border p-3 ${toneCls}`}>
      <Icon name={icon} className="size-6 shrink-0" />
      <div className="min-w-0">
        <div className="text-sm font-medium text-fd-foreground">{label}</div>
        {sub ? <div className="text-xs">{sub}</div> : null}
      </div>
    </div>
  );
}

// Phase 1 signature: skill unbundles from time.
export function Unbundling() {
  return (
    <div className="not-prose my-6 grid items-center gap-4 sm:grid-cols-[1fr_auto_1fr]">
      <div className="rounded-2xl border border-fd-border bg-fd-card p-5">
        <div className="mb-3 text-xs font-medium uppercase tracking-widest text-fd-muted-foreground">
          The old deal
        </div>
        <div className="space-y-2">
          <Tile icon="brain" label="Brain" sub="judgment, framing" />
          <Tile icon="tools" label="Skill" sub="practiced craft" />
        </div>
        <div className="mt-3 flex items-center gap-2 text-xs text-fd-muted-foreground">
          <Icon name="clock" className="size-4" />
          Bought together, rationed by time
        </div>
      </div>

      <div className="flex justify-center text-fd-primary">
        <Icon name="arrow" className="size-7 rotate-90 sm:rotate-0" />
      </div>

      <div className="rounded-2xl border border-fd-primary/40 bg-fd-primary/5 p-5">
        <div className="mb-3 text-xs font-medium uppercase tracking-widest text-fd-primary">
          The unbundling
        </div>
        <div className="space-y-2">
          <Tile icon="brain" label="Brain stays human" sub="scarce, valuable" tone="muted" />
          <Tile icon="robot" label="Skill becomes runtime" sub="on demand, parallel" tone="primary" />
        </div>
        <div className="mt-3 flex items-center gap-2 text-xs text-fd-primary">
          <Icon name="lightning" className="size-4" />
          Bought separately, at marginal cost
        </div>
      </div>
    </div>
  );
}

export function Flow({ steps }: { steps: Item[] }) {
  return (
    <div className="not-prose my-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {steps.map((s, i) => (
        <div
          key={s.title}
          className="relative rounded-2xl border border-fd-border bg-fd-card p-4"
        >
          <div className="mb-3 flex items-center justify-between">
            <div className="flex size-9 items-center justify-center rounded-lg bg-fd-primary/10 text-fd-primary">
              <Icon name={s.icon} className="size-5" />
            </div>
            <span className="text-xs font-semibold text-fd-muted-foreground">
              {String(i + 1).padStart(2, "0")}
            </span>
          </div>
          <div className="text-sm font-medium text-fd-foreground">{s.title}</div>
          {s.desc ? (
            <div className="mt-1 text-xs leading-relaxed text-fd-muted-foreground">
              {s.desc}
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}

export function FeatureGrid({
  items,
  cols = 2,
}: {
  items: Item[];
  cols?: 2 | 3 | 4;
}) {
  const colCls =
    cols === 4
      ? "sm:grid-cols-2 lg:grid-cols-4"
      : cols === 3
        ? "sm:grid-cols-3"
        : "sm:grid-cols-2";
  return (
    <div className={`not-prose my-6 grid gap-3 ${colCls}`}>
      {items.map((it) => (
        <div
          key={it.title}
          className="rounded-2xl border border-fd-border bg-fd-card p-4"
        >
          <div className="mb-2 flex size-9 items-center justify-center rounded-lg bg-fd-primary/10 text-fd-primary">
            <Icon name={it.icon} className="size-5" />
          </div>
          <div className="text-sm font-medium text-fd-foreground">{it.title}</div>
          {it.desc ? (
            <div className="mt-1 text-xs leading-relaxed text-fd-muted-foreground">
              {it.desc}
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}

function Column({
  icon,
  title,
  items,
  tone,
}: {
  icon: string;
  title: string;
  items: string[];
  tone: "muted" | "primary";
}) {
  const head =
    tone === "primary"
      ? "bg-fd-primary/10 text-fd-primary"
      : "bg-fd-muted text-fd-foreground";
  return (
    <div className="rounded-2xl border border-fd-border bg-fd-card p-5">
      <div className={`mb-4 inline-flex items-center gap-2 rounded-lg px-3 py-1.5 ${head}`}>
        <Icon name={icon} className="size-5" />
        <span className="text-sm font-medium">{title}</span>
      </div>
      <ul className="space-y-2">
        {items.map((t) => (
          <li key={t} className="flex items-start gap-2 text-sm text-fd-muted-foreground">
            <Icon name="check" className="mt-0.5 size-4 shrink-0 text-fd-primary" />
            <span>{t}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SplitCompare({
  left,
  right,
}: {
  left: { icon: string; title: string; items: string[] };
  right: { icon: string; title: string; items: string[] };
}) {
  return (
    <div className="not-prose my-6 grid gap-3 sm:grid-cols-2">
      <Column {...left} tone="muted" />
      <Column {...right} tone="primary" />
    </div>
  );
}

export function TrendChart({
  label,
  caption,
  direction = "down",
}: {
  label: string;
  caption?: string;
  direction?: "down" | "up";
}) {
  const down = direction === "down";
  const path = down
    ? "M8,28 C70,40 120,60 180,92 C220,112 280,124 312,128"
    : "M8,128 C70,116 120,96 180,64 C220,44 280,32 312,28";
  const area = `${path} L312,148 L8,148 Z`;
  return (
    <div className="not-prose my-6 rounded-2xl border border-fd-border bg-fd-card p-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="text-sm font-medium text-fd-foreground">{label}</div>
        <span className="inline-flex items-center gap-1 rounded-full bg-fd-primary/10 px-2.5 py-1 text-xs font-medium text-fd-primary">
          <Icon name={down ? "trendDown" : "trendUp"} className="size-4" />
          {down ? "lower is better" : "higher is better"}
        </span>
      </div>
      <svg
        viewBox="0 0 320 150"
        className="h-28 w-full text-fd-primary"
        preserveAspectRatio="none"
        role="img"
        aria-label={label}
      >
        <path d={area} fill="currentColor" opacity="0.12" />
        <path
          d={path}
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
      {caption ? (
        <div className="mt-3 text-xs leading-relaxed text-fd-muted-foreground">
          {caption}
        </div>
      ) : null}
    </div>
  );
}

function Node({
  icon,
  label,
  highlight,
}: {
  icon: string;
  label: string;
  highlight?: boolean;
}) {
  const cls = highlight
    ? "border-fd-primary/40 bg-fd-primary/10 text-fd-primary"
    : "border-fd-border bg-fd-background text-fd-foreground";
  return (
    <div className={`flex items-center gap-2 rounded-xl border px-3 py-2 ${cls}`}>
      <Icon name={icon} className="size-5 shrink-0" />
      <span className="text-sm font-medium">{label}</span>
    </div>
  );
}

function Lane({
  label,
  middleIcon,
  middleLabel,
  badges,
  highlight,
}: {
  label: string;
  middleIcon: string;
  middleLabel: string;
  badges: string[];
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-4 ${highlight ? "border-fd-primary/40 bg-fd-primary/5" : "border-fd-border bg-fd-card"}`}
    >
      <div className="mb-3 text-[11px] font-medium uppercase tracking-widest text-fd-muted-foreground">
        {label}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Node icon="chat" label="Intent" />
        <Icon name="arrow" className="size-5 shrink-0 text-fd-muted-foreground" />
        <Node icon={middleIcon} label={middleLabel} highlight={highlight} />
        <Icon name="arrow" className="size-5 shrink-0 text-fd-muted-foreground" />
        <Node icon="check" label="Outcome" />
        <div className="ml-auto flex flex-wrap gap-1.5">
          {badges.map((b) => (
            <span
              key={b}
              className={`rounded-full px-2.5 py-1 text-xs ${highlight ? "bg-fd-primary/10 text-fd-primary" : "bg-fd-muted text-fd-muted-foreground"}`}
            >
              {b}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// Same shape as today (intent in, outcome out), only more efficient.
export function IntentOutcome() {
  return (
    <div className="not-prose my-6 space-y-3">
      <Lane
        label="Today"
        middleIcon="users"
        middleLabel="A team or agency"
        badges={["weeks", "fixed headcount", "billed by the hour"]}
      />
      <Lane
        label="With XO agents"
        middleIcon="robot"
        middleLabel="A fleet of agents"
        badges={["hours", "on demand", "per unit of work"]}
        highlight
      />
    </div>
  );
}

function Pill({ icon, label }: { icon: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-fd-muted px-2 py-0.5 text-xs text-fd-muted-foreground">
      <Icon name={icon} className="size-3.5" />
      {label}
    </span>
  );
}

function SessionRow({ intent, status }: { intent: string; status: "done" | "running" }) {
  const done = status === "done";
  return (
    <div className="rounded-xl border border-fd-border bg-fd-background p-3">
      <div className="flex items-center gap-2">
        <Icon name="target" className="size-4 shrink-0 text-fd-primary" />
        <span className="text-sm font-medium text-fd-foreground">{intent}</span>
        <span
          className={`ml-auto inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs ${done ? "bg-fd-primary/10 text-fd-primary" : "bg-fd-muted text-fd-muted-foreground"}`}
        >
          <Icon name={done ? "check" : "clock"} className="size-3.5" />
          {done ? "done" : "running"}
        </span>
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        <Pill icon="budget" label="budget" />
        <Pill icon="eye" label="state check" />
        <Pill icon="gauge" label="token meter" />
      </div>
    </div>
  );
}

// One XO workspace, many sessions, each scoped to an intent and tracked on its own.
export function WorkspaceSessions() {
  return (
    <div className="not-prose my-6 rounded-2xl border border-fd-border bg-fd-card p-5">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-xl bg-fd-primary/10 text-fd-primary">
          <Icon name="cube" className="size-5" />
        </div>
        <div>
          <div className="text-sm font-medium text-fd-foreground">XO workspace</div>
          <div className="text-xs text-fd-muted-foreground">
            One session per intent, each tracked on its own
          </div>
        </div>
      </div>
      <div className="space-y-2">
        <SessionRow intent="Clear the support backlog" status="done" />
        <SessionRow intent="Review Q3 vendor contracts" status="running" />
        <SessionRow intent="Ship the weekly metrics report" status="done" />
      </div>
      <div className="mt-4 flex items-center gap-2 rounded-xl bg-fd-primary/5 p-3 text-xs font-medium text-fd-primary">
        <Icon name="scales" className="size-4 shrink-0" />
        Priced per intent and outcome, not per token.
      </div>
    </div>
  );
}

// The mechanism: a unit of work is settled by comparing state and comparing cost.
export function StateAndCost() {
  return (
    <div className="not-prose my-6 grid gap-3 sm:grid-cols-2">
      <div className="rounded-2xl border border-fd-border bg-fd-card p-5">
        <div className="mb-4 inline-flex items-center gap-2 rounded-lg bg-fd-muted px-3 py-1.5 text-sm font-medium text-fd-foreground">
          <Icon name="eye" className="size-5" />
          Did the state change?
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Node icon="clock" label="State before" />
          <Icon name="arrow" className="size-5 shrink-0 text-fd-muted-foreground" />
          <Node icon="check" label="State after" highlight />
        </div>
        <div className="mt-3 text-xs leading-relaxed text-fd-muted-foreground">
          Compare the two, the same check a manager makes today. If the world moved
          the way you asked, the work is done.
        </div>
      </div>

      <div className="rounded-2xl border border-fd-border bg-fd-card p-5">
        <div className="mb-4 inline-flex items-center gap-2 rounded-lg bg-fd-muted px-3 py-1.5 text-sm font-medium text-fd-foreground">
          <Icon name="scales" className="size-5" />
          What did it cost?
        </div>
        <div className="mb-2 text-xs font-medium text-fd-muted-foreground">
          Budget (the price)
        </div>
        <div className="flex h-9 w-full overflow-hidden rounded-lg border border-fd-border">
          <div
            className="flex items-center justify-center bg-fd-primary/15 text-xs font-medium text-fd-primary"
            style={{ width: "60%" }}
          >
            AI spend
          </div>
          <div
            className="flex items-center justify-center bg-fd-primary text-xs font-medium text-fd-primary-foreground"
            style={{ width: "40%" }}
          >
            efficiency
          </div>
        </div>
        <div className="mt-3 text-xs leading-relaxed text-fd-muted-foreground">
          The budget is what the outcome is worth. The tokens are where the AI
          spends, on the model you bring. XO only enables the tracking; the gap is
          your efficiency.
        </div>
      </div>
    </div>
  );
}

export function Lead({ children }: { children: ReactNode }) {
  return (
    <p className="not-prose my-5 border-l-2 border-fd-primary pl-4 text-base leading-relaxed text-fd-foreground">
      {children}
    </p>
  );
}
