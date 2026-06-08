/**
 * Scripted chat stream generator. Yields `ChatStreamEvent`s in the
 * same shape cowork-api emits, with small simulated delays so the
 * receiving UI feels like a real stream.
 *
 * Used by Section D (ChatExpanded) in Phase 2 (mock-first) so the
 * full chat surface works end-to-end before any backend exists.
 * Section B swaps this for a real EventSource against the Next-route
 * SSE proxy; the consumer's `for await` loop does not change shape.
 */

import type {
  ChatStreamEvent,
  ClientActionKind,
} from "./types"

export interface MockStreamOptions {
  /** The user's prompt text. Optionally inspected to choose the scripted reply. */
  text?: string
  /** Whether to emit a `client-action` event part-way through. */
  includeAction?: boolean
  /** Action kind to emit (default: navigate). */
  actionKind?: ClientActionKind
  /** Route to navigate to (when actionKind is "navigate"). */
  actionRoute?: string
  /** Override the session_id for the `session-created` event. */
  sessionId?: string
}

const DEFAULT_REPLY_CHUNKS = ["Sure, ", "let me ", "help with that. ", "Here you go."]

/**
 * Default mock stream: greeting → 4 text chunks → optional action → done.
 *
 * Acceptance shape: 6+ events including session-created, 3+ text-delta,
 * and a final `done`. Optional client-action between the chunks.
 */
export async function* generateMockStream(
  opts: MockStreamOptions = {},
): AsyncGenerator<ChatStreamEvent> {
  const sessionId = opts.sessionId ?? `mock_sess_${Date.now()}`
  const includeAction = opts.includeAction ?? false
  const actionKind = opts.actionKind ?? "navigate"
  const actionRoute = opts.actionRoute ?? "/sessions"

  await mockDelay(80)
  yield { type: "session-created", session_id: sessionId }

  // Stream three text-delta chunks. Insert client-action between
  // chunks 2 and 3 if requested.
  for (let i = 0; i < DEFAULT_REPLY_CHUNKS.length; i += 1) {
    await mockDelay(120 + Math.random() * 80)
    yield { type: "text-delta", text: DEFAULT_REPLY_CHUNKS[i] }
    if (includeAction && i === 1) {
      await mockDelay(80)
      yield {
        type: "client-action",
        kind: actionKind,
        args: actionKind === "navigate" ? { route: actionRoute } : {},
      }
    }
  }

  await mockDelay(120)
  yield {
    type: "done",
    usage: { tokens_in: 25, tokens_out: 40, cost_usd: 0.001 },
  }
}

/**
 * Mock stream that always errors. Useful for testing error-state UI.
 */
export async function* generateErrorStream(
  message = "mock stream error",
): AsyncGenerator<ChatStreamEvent> {
  await mockDelay(80)
  yield { type: "session-created", session_id: `mock_sess_err_${Date.now()}` }
  await mockDelay(120)
  yield { type: "text-delta", text: "I tried but " }
  await mockDelay(120)
  yield { type: "agent-error", message }
}

function mockDelay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
