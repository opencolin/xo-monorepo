/**
 * Mock fixtures for every cowork-api response shape.
 *
 * Section K: the browser client returns these in mock mode
 * (NEXT_PUBLIC_USE_COWORK_MOCKS != "false") with a simulated 50-200ms
 * latency, so UI animations and skeleton loaders behave like real.
 *
 * Each shape includes at least one "error" / "empty" fixture so error
 * rendering can be exercised without breaking the backend or the
 * happy-path tests.
 */

import type {
  Agent,
  AgentStatusResponse,
  Channel,
  DirectoryListing,
  FileContent,
  Health,
  Message,
  Quip,
  Session,
  UsageResponse,
  WorkspaceConfig,
} from "./types"

// ──────────────────────────────────────────────────────────────────
// Health + workspace
// ──────────────────────────────────────────────────────────────────

export const mockHealth: Health = {
  status: "ok",
  stage: "local",
}

export const mockHealthDown: Health = {
  status: "down",
  stage: "local",
}

export const mockWorkspaceConfig: WorkspaceConfig = {
  roots: { openclaw: "/Users/demo/xo-projects" },
  default: "openclaw",
}

// ──────────────────────────────────────────────────────────────────
// Agents
// ──────────────────────────────────────────────────────────────────

export const mockAgents: Agent[] = [
  {
    id: "agent_eliza",
    name: "Eliza",
    description: "The original chat persona, default for most sessions.",
    backend: "openclaw",
    state: "idle",
  },
  {
    id: "agent_codex",
    name: "Codex Helper",
    description: "Code-focused assistant. Better at refactors.",
    backend: "codex",
    state: "running",
  },
]

export const mockAgentStatus: AgentStatusResponse = {
  agents: mockAgents,
  primary: mockAgents[0],
}

export const mockAgentStatusErrored: AgentStatusResponse = {
  agents: [{ ...mockAgents[0], state: "errored" }],
  primary: { ...mockAgents[0], state: "errored" },
}

export const mockAgentStatusEmpty: AgentStatusResponse = {
  agents: [],
  primary: null,
}

// ──────────────────────────────────────────────────────────────────
// Sessions + messages
// ──────────────────────────────────────────────────────────────────

export const mockSessions: Session[] = [
  {
    id: "s_001",
    runtime: "claude",
    title: "Refactor billing module",
    updated_at: "2026-05-20T09:32:00Z",
    message_count: 24,
  },
  {
    id: "s_002",
    runtime: "openclaw",
    title: "Brainstorm Q3 roadmap",
    updated_at: "2026-05-19T16:14:00Z",
    message_count: 11,
  },
  {
    id: "s_003",
    runtime: "claude",
    title: "Debug auth flow",
    updated_at: "2026-05-19T11:02:00Z",
    message_count: 38,
  },
  {
    id: "s_004",
    runtime: "codex",
    title: "Write a postmortem",
    updated_at: "2026-05-18T22:18:00Z",
    message_count: 8,
  },
  {
    id: "s_005",
    runtime: "claude",
    title: "Demo prep for investors",
    updated_at: "2026-05-18T15:42:00Z",
    message_count: 19,
  },
]

export const mockSessionsEmpty: Session[] = []

export const mockMessages: Message[] = [
  {
    id: "m_001",
    session_id: "s_001",
    role: "user",
    text: "Help me refactor the billing module",
    created_at: "2026-05-20T09:30:00Z",
  },
  {
    id: "m_002",
    session_id: "s_001",
    role: "assistant",
    text: "Sure! Let me look at the structure first.",
    created_at: "2026-05-20T09:30:15Z",
  },
  {
    id: "m_003",
    session_id: "s_001",
    role: "user",
    text: "Start with the invoice generator.",
    created_at: "2026-05-20T09:31:00Z",
  },
  {
    id: "m_004",
    session_id: "s_001",
    role: "assistant",
    text: "On it. I'll split the file into formatter + persister.",
    created_at: "2026-05-20T09:31:30Z",
  },
]

// ──────────────────────────────────────────────────────────────────
// Files
// ──────────────────────────────────────────────────────────────────

export const mockDirectoryRoot: DirectoryListing = {
  path: "/Users/demo/xo-projects",
  parent: null,
  dirs: ["xo-phone-os", "xo-cowork-api", "xo-swarm", "xo-docs", "experiments"],
  files: ["README.md", "CHANGELOG.md"],
}

export const mockDirectoryChild: DirectoryListing = {
  path: "/Users/demo/xo-projects/xo-phone-os",
  parent: "/Users/demo/xo-projects",
  dirs: ["app", "components", "lib", "context", "data", "public"],
  files: ["package.json", "tsconfig.json", "next.config.ts", "README.md"],
}

export const mockDirectoryEmpty: DirectoryListing = {
  path: "/Users/demo/xo-projects/empty-dir",
  parent: "/Users/demo/xo-projects",
  dirs: [],
  files: [],
}

export const mockFileContent: FileContent = {
  path: "/Users/demo/xo-projects/xo-phone-os/README.md",
  content:
    "# xo-phone-os\n\nXO Phone OS, the marketing surface and product entry as an iPhone-style phone OS. The viewport IS the device on phones; the OS sits inside an iPhone-shaped frame on tablets and desktops.\n\nSection K mock content.\n",
}

// ──────────────────────────────────────────────────────────────────
// Channels
// ──────────────────────────────────────────────────────────────────

export const mockChannels: Channel[] = [
  {
    id: "ch_general",
    name: "general",
    created_at: "2026-04-01T10:00:00Z",
    recent_activity: "2026-05-20T08:00:00Z",
    message_count: 142,
  },
  {
    id: "ch_design",
    name: "design",
    created_at: "2026-04-05T10:00:00Z",
    recent_activity: "2026-05-19T22:00:00Z",
    message_count: 67,
  },
  {
    id: "ch_release",
    name: "release-notes",
    created_at: "2026-04-08T10:00:00Z",
    recent_activity: "2026-05-18T14:30:00Z",
    message_count: 21,
  },
]

export const mockChannelsEmpty: Channel[] = []

// ──────────────────────────────────────────────────────────────────
// Usage
// ──────────────────────────────────────────────────────────────────

export const mockUsage: UsageResponse = {
  today: { tokens_in: 12450, tokens_out: 8230, cost_usd: 0.32 },
  by_model: [
    { model: "claude-sonnet-4.6", tokens_in: 10200, tokens_out: 6800, cost_usd: 0.26 },
    { model: "openclaw-default", tokens_in: 2250, tokens_out: 1430, cost_usd: 0.06 },
  ],
}

// ──────────────────────────────────────────────────────────────────
// Quips (Thought of the Day widget)
// ──────────────────────────────────────────────────────────────────

export const mockQuips: Quip[] = [
  { text: "agents that work for you" },
  { text: "two pairs of chevrons, one purpose" },
  { text: "you bring the prompt, we bring the cowork" },
  { text: "the phone is the unit, the swarm is the fleet" },
  { text: "every workspace, anywhere" },
  { text: "you ship code, agents ship outcomes" },
  { text: "press tab to confess" },
  { text: "the agent's only job is to make you faster" },
  { text: "your coworker, but containerized" },
  { text: "one cowork, many runtimes" },
  { text: "lime is louder than logos" },
  { text: "shipping is a state of mind" },
  { text: "agents work weekends" },
  { text: "the dock is the front door" },
  { text: "you bring the why, the agent brings the how" },
  { text: "less context-switching, more shipping" },
  { text: "the right tool, summoned" },
  { text: "agents are infrastructure" },
  { text: "make the agent do it" },
  { text: "build once, run anywhere" },
]
