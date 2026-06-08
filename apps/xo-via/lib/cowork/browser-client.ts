/**
 * Browser-facing cowork client.
 *
 * Section K (Phase 2 of the v.Next build, "UI on mocks"): every
 * function returns a value from `mock-data.ts` after a small
 * simulated network delay (50-200ms). UI code that consumes this
 * client sees realistic-feeling async data without any backend
 * existing yet.
 *
 * Section B (Phase 3, "real cowork wiring"): the same functions
 * fetch `/api/*` Next routes that proxy to xo-cowork-api with the
 * operator XO_API_KEY + Clerk username. The browser still never
 * talks to cowork-api directly (CLAUDE.md rule #4).
 *
 * Swap mechanism: env var `NEXT_PUBLIC_USE_COWORK_MOCKS`. Default
 * `true` until Section B lands; flip to `"false"` to use real
 * fetches (which will currently fail because the routes don't
 * exist yet).
 *
 * Every function returns `CoworkResult<T>` (soft-fail). UI code
 * branches on `.ok` instead of catching exceptions.
 */

import * as mocks from "./mock-data"
import { generateMockStream } from "./mock-stream"
import type {
  Agent,
  AgentStatusResponse,
  Channel,
  ChatPromptResponse,
  ChatStreamEvent,
  CoworkResult,
  DirectoryListing,
  FileContent,
  Health,
  Quip,
  Session,
  UsageResponse,
  WorkspaceConfig,
} from "./types"

const USE_MOCKS =
  typeof process !== "undefined" &&
  process.env.NEXT_PUBLIC_USE_COWORK_MOCKS !== "false"

// ──────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────

function randomLatencyMs(): number {
  return 50 + Math.floor(Math.random() * 150)
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function mockLatency(): Promise<void> {
  await delay(randomLatencyMs())
}

async function fetchReal<T>(
  path: string,
  init?: RequestInit,
): Promise<CoworkResult<T>> {
  try {
    const res = await fetch(path, init)
    if (!res.ok) {
      return {
        ok: false,
        status: res.status,
        error: `${init?.method ?? "GET"} ${path} returned HTTP ${res.status}`,
      }
    }
    const data = (await res.json()) as T
    return { ok: true, data }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    return { ok: false, error: `${init?.method ?? "GET"} ${path}: ${msg}` }
  }
}

async function* streamReal(
  _streamId: string,
): AsyncGenerator<ChatStreamEvent> {
  // Section B fills this in with `new EventSource("/api/chat/stream/" + id)`
  // and yields the parsed events. Until then, fail loudly so a missed
  // flag flip is obvious.
  throw new Error(
    "streamReal not implemented; Section K runs on mocks. Set NEXT_PUBLIC_USE_COWORK_MOCKS=true (default) until Section B ships.",
  )
  // eslint-disable-next-line @typescript-eslint/no-unreachable -- keeps the async generator type
  yield { type: "done" }
}

// ──────────────────────────────────────────────────────────────────
// Public surface
// ──────────────────────────────────────────────────────────────────

export const coworkApi = {
  /** True when the client is serving mock fixtures. */
  isMock: USE_MOCKS,

  // Health
  health: async (): Promise<CoworkResult<Health>> => {
    if (USE_MOCKS) {
      await mockLatency()
      return { ok: true, data: mocks.mockHealth }
    }
    return fetchReal<Health>("/api/cowork/health")
  },

  // Workspace
  workspaceConfig: async (): Promise<CoworkResult<WorkspaceConfig>> => {
    if (USE_MOCKS) {
      await mockLatency()
      return { ok: true, data: mocks.mockWorkspaceConfig }
    }
    return fetchReal<WorkspaceConfig>("/api/cowork/workspace-config")
  },

  // Agent status (Agent Status widget + Agents app)
  agentStatus: async (): Promise<CoworkResult<AgentStatusResponse>> => {
    if (USE_MOCKS) {
      await mockLatency()
      return { ok: true, data: mocks.mockAgentStatus }
    }
    return fetchReal<AgentStatusResponse>("/api/widgets/agent-status")
  },

  // Agents app
  listAgents: async (): Promise<CoworkResult<Agent[]>> => {
    if (USE_MOCKS) {
      await mockLatency()
      return { ok: true, data: mocks.mockAgents }
    }
    return fetchReal<Agent[]>("/api/cowork/agents")
  },

  // Sessions app
  listSessions: async (): Promise<CoworkResult<Session[]>> => {
    if (USE_MOCKS) {
      await mockLatency()
      return { ok: true, data: mocks.mockSessions }
    }
    return fetchReal<Session[]>("/api/cowork/sessions")
  },

  // Files app
  listDirectory: async (
    path?: string,
  ): Promise<CoworkResult<DirectoryListing>> => {
    if (USE_MOCKS) {
      await mockLatency()
      const data = path ? mocks.mockDirectoryChild : mocks.mockDirectoryRoot
      return { ok: true, data }
    }
    const qs = path ? `?path=${encodeURIComponent(path)}` : ""
    return fetchReal<DirectoryListing>(`/api/cowork/files${qs}`)
  },

  readFile: async (path: string): Promise<CoworkResult<FileContent>> => {
    if (USE_MOCKS) {
      await mockLatency()
      // Echo path so caller sees what it asked for.
      return { ok: true, data: { ...mocks.mockFileContent, path } }
    }
    return fetchReal<FileContent>(
      `/api/cowork/files?action=read&path=${encodeURIComponent(path)}`,
    )
  },

  // Channels app
  listChannels: async (): Promise<CoworkResult<Channel[]>> => {
    if (USE_MOCKS) {
      await mockLatency()
      return { ok: true, data: mocks.mockChannels }
    }
    return fetchReal<Channel[]>("/api/cowork/channels")
  },

  // Usage app
  usage: async (): Promise<CoworkResult<UsageResponse>> => {
    if (USE_MOCKS) {
      await mockLatency()
      return { ok: true, data: mocks.mockUsage }
    }
    return fetchReal<UsageResponse>("/api/cowork/usage")
  },

  // Thought of the Day widget
  quip: async (): Promise<CoworkResult<Quip>> => {
    if (USE_MOCKS) {
      await mockLatency()
      const pool = mocks.mockQuips
      const pick = pool[Math.floor(Math.random() * pool.length)]
      return { ok: true, data: pick }
    }
    return fetchReal<Quip>("/api/widgets/quip")
  },

  // ────────────────── Chat ──────────────────

  /**
   * Two-step chat handshake. Returns a stream_id you then pass to
   * `streamChat` to receive the SSE events.
   */
  chatPrompt: async (
    text: string,
    session_id?: string,
  ): Promise<CoworkResult<ChatPromptResponse>> => {
    if (USE_MOCKS) {
      await mockLatency()
      return {
        ok: true,
        data: {
          stream_id: `mock_stream_${Date.now()}`,
          session_id: session_id ?? `mock_sess_${Date.now()}`,
        },
      }
    }
    return fetchReal<ChatPromptResponse>("/api/chat", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ text, session_id }),
    })
  },

  /**
   * Async-iterable chat stream. In mock mode yields the scripted
   * sequence from `generateMockStream`. In real mode opens an
   * EventSource against the Next SSE proxy (Section B).
   *
   * The `opts` parameter is mock-only: it lets a caller decide
   * whether to include a client-action in the scripted reply. The
   * real client will ignore it (cowork-api decides what to emit).
   */
  streamChat: (
    stream_id: string,
    opts?: {
      includeAction?: boolean
      actionRoute?: string
    },
  ): AsyncGenerator<ChatStreamEvent> => {
    if (USE_MOCKS) {
      return generateMockStream({
        sessionId: stream_id,
        includeAction: opts?.includeAction,
        actionRoute: opts?.actionRoute,
      })
    }
    return streamReal(stream_id)
  },

  abortChat: async (
    stream_id: string,
  ): Promise<CoworkResult<{ aborted: true }>> => {
    if (USE_MOCKS) {
      await mockLatency()
      return { ok: true, data: { aborted: true } }
    }
    return fetchReal<{ aborted: true }>("/api/chat/abort", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ stream_id }),
    })
  },
}
