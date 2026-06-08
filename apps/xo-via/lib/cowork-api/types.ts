/**
 * DTOs from xo-cowork-api. Kept narrow on purpose: only the fields we
 * actually surface to the agent. If the upstream adds new fields we
 * still parse fine; if it removes one we know early via the typed
 * client at runtime.
 *
 * Source of truth for shapes lives in
 *   ../../../xo-cowork-api/docs/frontend-*.md
 */

export interface CoworkHealth {
  status: string
  // ...there are more fields but we don't read them.
}

export interface WorkspaceConfig {
  /** Map of root name to absolute path (e.g. { openclaw: "/home/coder/xo-projects" }). */
  roots: Record<string, string>
  /** Which root name is the default. */
  default: string
}

export interface SessionSummary {
  id: string
  /** Logical session id, used in /api/messages/{id}. */
  logical_id?: string
  runtime: "claude" | "openclaw" | "codex" | string
  title?: string | null
  updated_at?: string
  message_count?: number
}

export interface AgentSummary {
  id: string
  name: string
  description?: string | null
  backend?: string
}

/**
 * Shape of /api/files/list-directory. cowork-api returns dir + file
 * names as separate string arrays (no size, mtime, or mime metadata).
 */
export interface DirectoryListing {
  path: string
  parent: string | null
  dirs: string[]
  files: string[]
}

/**
 * Shape of /api/files/content (text). Binary content uses the
 * /api/files/content-binary endpoint and streams a file download
 * rather than JSON; we don't wrap that here.
 */
export interface FileContent {
  path: string
  content: string
}

/**
 * Wrapper result type. Successful calls return { ok: true, data };
 * failures return { ok: false, error } with a human-readable error
 * that is safe to surface in agent tool replies.
 */
export type CoworkResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; status?: number }
