/**
 * Canonical TypeScript interfaces for everything the browser consumes
 * from xo-cowork-api (via the Next.js Route Handler proxies).
 *
 * Section K: this file defines the contract. The mock layer
 * (`mock-data.ts` + `mock-stream.ts`) and the real client (Section B)
 * both produce values that conform to these types, so UI code does
 * not change when the source flips from mock to real.
 *
 * Source of truth for response shapes: the cowork-api frontend docs
 * (`xo-cowork-api/docs/frontend-*.md`). Where the upstream is loose,
 * we narrow to only the fields the phone OS surfaces.
 */

// ──────────────────────────────────────────────────────────────────
// Health + workspace
// ──────────────────────────────────────────────────────────────────

export interface Health {
  status: "ok" | "degraded" | "down"
  stage?: string
}

export interface WorkspaceConfig {
  /** Named roots, e.g. { openclaw: "/Users/.../xo-projects" }. */
  roots: Record<string, string>
  /** Which root key is the default workspace. */
  default: string
}

// ──────────────────────────────────────────────────────────────────
// Agents
// ──────────────────────────────────────────────────────────────────

export type AgentState = "idle" | "running" | "errored"

export interface Agent {
  id: string
  name: string
  description?: string
  /** "openclaw" | "claude" | "codex" | etc. Loose because new backends land. */
  backend?: string
  state: AgentState
}

export interface AgentStatusResponse {
  agents: Agent[]
  /** The "primary" agent surfaced by the Agent Status widget. Null if none. */
  primary: Agent | null
}

// ──────────────────────────────────────────────────────────────────
// Sessions + messages
// ──────────────────────────────────────────────────────────────────

export type SessionRuntime = "claude" | "openclaw" | "codex" | string

export interface Session {
  id: string
  /** Logical session id used by /api/messages/{id}. Defaults to id. */
  logical_id?: string
  runtime: SessionRuntime
  title: string
  /** ISO timestamp. */
  updated_at: string
  message_count: number
}

export type MessageRole = "user" | "assistant" | "system"

export interface Message {
  id: string
  session_id: string
  role: MessageRole
  text: string
  created_at: string
}

// ──────────────────────────────────────────────────────────────────
// Files
// ──────────────────────────────────────────────────────────────────

export interface DirectoryListing {
  path: string
  parent: string | null
  dirs: string[]
  files: string[]
}

export interface FileContent {
  path: string
  content: string
}

// ──────────────────────────────────────────────────────────────────
// Channels
// ──────────────────────────────────────────────────────────────────

export interface Channel {
  id: string
  name: string
  created_at: string
  recent_activity?: string
  message_count?: number
}

// ──────────────────────────────────────────────────────────────────
// Usage
// ──────────────────────────────────────────────────────────────────

export interface UsageByModel {
  model: string
  tokens_in: number
  tokens_out: number
  cost_usd: number
}

export interface UsageResponse {
  today: {
    tokens_in: number
    tokens_out: number
    cost_usd: number
  }
  by_model: UsageByModel[]
}

// ──────────────────────────────────────────────────────────────────
// Quip (Thought of the Day widget)
// ──────────────────────────────────────────────────────────────────

export type QuipMood = "idle" | "happy" | "thinking" | "speaking" | "error"

export interface Quip {
  text: string
  mood?: QuipMood
}

// ──────────────────────────────────────────────────────────────────
// Chat (POST then SSE)
// ──────────────────────────────────────────────────────────────────

export interface ChatPromptResponse {
  stream_id: string
  session_id: string
}

/**
 * SSE event types emitted by cowork-api during a chat stream.
 *
 * Section J adds `client-action`: the agent can drive the OS by
 * emitting structured action events alongside text deltas.
 */
export type ChatStreamEvent =
  | { type: "session-created"; session_id: string }
  | { type: "text-delta"; text: string }
  | { type: "heartbeat" }
  | { type: "done"; usage?: ChatUsage }
  | { type: "agent-error"; message: string }
  | { type: "client-action"; kind: ClientActionKind; args?: ClientActionArgs }

export interface ChatUsage {
  tokens_in?: number
  tokens_out?: number
  cost_usd?: number
}

/**
 * Agent-driven OS action kinds, per Section J in V_NEXT_PLAN.html.
 * Forward-compatible: unknown kinds at runtime are ignored, not
 * narrowed away here.
 */
export type ClientActionKind =
  | "navigate"
  | "go-home"
  | "pop-back"
  | "open-overlay"
  | "close-overlay"
  | "collapse-chat"
  | "expand-chat"

export interface ClientActionArgs {
  route?: string
  section?: "notifications" | "controls" | "search"
  [key: string]: unknown
}

// ──────────────────────────────────────────────────────────────────
// Result wrapper (soft fail)
// ──────────────────────────────────────────────────────────────────

/**
 * Every browser-client function returns a result wrapper instead of
 * throwing on failure. UI code can branch on `.ok` without try/catch.
 */
export type CoworkResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; status?: number }
