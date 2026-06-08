/**
 * Typed HTTP client for xo-cowork-api.
 *
 * xo-cowork-api runs inside a Coworker workspace (the developer's
 * laptop, a Coder container, Vercel Sandbox, etc.) on port 5002 by
 * default. There is no inbound auth at any endpoint (per
 * `xo-cowork-api/docs/frontend-api-index.md`): the workspace itself
 * is the trust boundary. We therefore do not forward any token; we
 * just hit the endpoints.
 *
 * Call from the server (Server Components, Route Handlers, agent
 * tool resolvers). Browser-side calls would also need CORS to be
 * loosened on the cowork-api ALLOWED_ORIGINS env var.
 *
 * Soft-fail philosophy: when the cowork-api is unreachable (a common
 * dev case, e.g. the developer forgot to start it), we return
 * `{ ok: false, error }` instead of throwing. The agent surfaces the
 * error in chat without crashing the turn.
 */

import type {
  AgentSummary,
  CoworkHealth,
  CoworkResult,
  DirectoryListing,
  FileContent,
  SessionSummary,
  WorkspaceConfig,
} from "./types"

const DEFAULT_BASE_URL = "http://localhost:5002"
const DEFAULT_TIMEOUT_MS = 5_000

function baseUrl(): string {
  return (process.env.COWORK_API_URL ?? DEFAULT_BASE_URL).replace(/\/$/, "")
}

interface RequestOptions {
  method?: "GET" | "POST" | "DELETE"
  query?: Record<string, string | number | boolean | undefined>
  body?: unknown
  timeoutMs?: number
}

async function request<T>(
  path: string,
  opts: RequestOptions = {},
): Promise<CoworkResult<T>> {
  const url = buildUrl(path, opts.query)
  const controller = new AbortController()
  const timer = setTimeout(
    () => controller.abort(),
    opts.timeoutMs ?? DEFAULT_TIMEOUT_MS,
  )

  try {
    const res = await fetch(url, {
      method: opts.method ?? "GET",
      headers: opts.body
        ? { "content-type": "application/json" }
        : undefined,
      body: opts.body ? JSON.stringify(opts.body) : undefined,
      signal: controller.signal,
      cache: "no-store",
    })
    if (!res.ok) {
      const detail = await res.text().catch(() => "")
      return {
        ok: false,
        status: res.status,
        error: `cowork-api ${path} returned HTTP ${res.status}${
          detail ? `: ${truncate(detail, 240)}` : ""
        }`,
      }
    }
    const data = (await res.json()) as T
    return { ok: true, data }
  } catch (e) {
    if ((e as Error).name === "AbortError") {
      return { ok: false, error: `cowork-api ${path} timed out (${opts.timeoutMs ?? DEFAULT_TIMEOUT_MS}ms)` }
    }
    const msg = e instanceof Error ? e.message : String(e)
    // Likely ECONNREFUSED — give a concrete actionable hint.
    if (msg.includes("ECONNREFUSED") || msg.includes("fetch failed")) {
      return {
        ok: false,
        error: `cowork-api unreachable at ${baseUrl()}. Is xo-cowork-api running? Set COWORK_API_URL if it lives elsewhere.`,
      }
    }
    return { ok: false, error: `cowork-api ${path}: ${msg}` }
  } finally {
    clearTimeout(timer)
  }
}

function buildUrl(path: string, query?: RequestOptions["query"]): string {
  const url = new URL(`${baseUrl()}${path}`)
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v === undefined) continue
      url.searchParams.set(k, String(v))
    }
  }
  return url.toString()
}

function truncate(s: string, n: number): string {
  return s.length <= n ? s : `${s.slice(0, n)}...`
}

// ─── public surface ─────────────────────────────────────────────────

export const coworkApi = {
  baseUrl,

  /** GET /health */
  health: () => request<CoworkHealth>("/health"),

  /**
   * GET /api/config/workspace
   * Canonical first call any frontend should make on boot. Use the
   * returned `roots[default]` as the projects root; never hardcode
   * `~/xo-projects`.
   */
  workspaceConfig: () => request<WorkspaceConfig>("/api/config/workspace"),

  /**
   * GET /api/sessions/* (subject to upstream; defaults to a flat list).
   * The shape is loose because cowork-api supports multiple runtimes
   * (claude, openclaw, codex) and their session listings differ.
   */
  listSessions: (opts: { limit?: number; offset?: number } = {}) =>
    request<{ sessions: SessionSummary[] } | SessionSummary[]>(
      "/api/sessions/",
      { query: opts },
    ),

  /** GET /api/agents/* */
  listAgents: () =>
    request<{ agents: AgentSummary[] } | AgentSummary[]>("/api/agents/"),

  /**
   * POST /api/files/list-directory
   * Body: `{ path? }` (omit for the workspace default root).
   * Returns `{ path, parent, dirs[], files[] }`. cowork-api clamps
   * every path to $HOME; outside-$HOME paths return 403. There is no
   * recursive listing; call repeatedly per subdirectory.
   */
  listDirectory: (path?: string) =>
    request<DirectoryListing>("/api/files/list-directory", {
      method: "POST",
      body: path ? { path } : {},
    }),

  /**
   * POST /api/files/content (text).
   * Body: `{ path }`. Returns `{ path, content }`. Binary files
   * should use /api/files/content-binary (returns a download stream;
   * not wrapped here).
   */
  readFile: (path: string) =>
    request<FileContent>("/api/files/content", {
      method: "POST",
      body: { path },
    }),
}
