/**
 * Section K tests: the browser-client in mock mode.
 *
 * Validates the contract that UI code will rely on:
 *   - every method returns CoworkResult<T> with the right shape
 *   - mock latency is real (>= 50ms) so animations feel like network
 *   - the chat stream yields a 6+ event scripted reply
 *   - client-action can be requested by the caller (mock-only knob)
 */

import { describe, expect, it } from "vitest"
import { coworkApi } from "@/lib/cowork/browser-client"
import type {
  ChatStreamEvent,
  ClientActionKind,
} from "@/lib/cowork/types"

describe("coworkApi (mock mode)", () => {
  it("reports isMock = true in the default test env", () => {
    expect(coworkApi.isMock).toBe(true)
  })

  describe("read endpoints", () => {
    it("health returns ok status", async () => {
      const res = await coworkApi.health()
      expect(res.ok).toBe(true)
      if (!res.ok) return
      expect(res.data.status).toBe("ok")
    })

    it("workspaceConfig returns a default root", async () => {
      const res = await coworkApi.workspaceConfig()
      expect(res.ok).toBe(true)
      if (!res.ok) return
      expect(res.data.default).toBeTruthy()
      expect(res.data.roots[res.data.default]).toBeTruthy()
    })

    it("agentStatus returns at least one agent + primary", async () => {
      const res = await coworkApi.agentStatus()
      expect(res.ok).toBe(true)
      if (!res.ok) return
      expect(res.data.agents.length).toBeGreaterThan(0)
      expect(res.data.primary).not.toBeNull()
      expect(res.data.primary?.name).toBeTruthy()
    })

    it("listAgents returns the agent array", async () => {
      const res = await coworkApi.listAgents()
      expect(res.ok).toBe(true)
      if (!res.ok) return
      expect(res.data.length).toBeGreaterThan(0)
      expect(res.data[0].state).toMatch(/^(idle|running|errored)$/)
    })

    it("listSessions returns 5 sessions sorted-ish", async () => {
      const res = await coworkApi.listSessions()
      expect(res.ok).toBe(true)
      if (!res.ok) return
      expect(res.data.length).toBe(5)
      expect(res.data[0].id).toBeTruthy()
      expect(res.data[0].title).toBeTruthy()
      expect(res.data[0].updated_at).toMatch(/^\d{4}-\d{2}-\d{2}T/)
    })

    it("listDirectory without path returns the workspace root", async () => {
      const res = await coworkApi.listDirectory()
      expect(res.ok).toBe(true)
      if (!res.ok) return
      expect(res.data.parent).toBeNull()
      expect(res.data.dirs.length).toBeGreaterThan(0)
    })

    it("listDirectory with path returns a child listing with parent set", async () => {
      const res = await coworkApi.listDirectory("/Users/demo/xo-projects/xo-phone-os")
      expect(res.ok).toBe(true)
      if (!res.ok) return
      expect(res.data.parent).not.toBeNull()
      expect(res.data.dirs.length).toBeGreaterThan(0)
    })

    it("readFile echoes the requested path back", async () => {
      const res = await coworkApi.readFile("/tmp/test.md")
      expect(res.ok).toBe(true)
      if (!res.ok) return
      expect(res.data.path).toBe("/tmp/test.md")
      expect(res.data.content.length).toBeGreaterThan(0)
    })

    it("listChannels returns at least one channel", async () => {
      const res = await coworkApi.listChannels()
      expect(res.ok).toBe(true)
      if (!res.ok) return
      expect(res.data.length).toBeGreaterThan(0)
      expect(res.data[0].name).toBeTruthy()
    })

    it("usage returns a today total + by-model breakdown", async () => {
      const res = await coworkApi.usage()
      expect(res.ok).toBe(true)
      if (!res.ok) return
      expect(res.data.today.cost_usd).toBeGreaterThanOrEqual(0)
      expect(res.data.by_model.length).toBeGreaterThan(0)
    })

    it("quip returns a non-empty string", async () => {
      const res = await coworkApi.quip()
      expect(res.ok).toBe(true)
      if (!res.ok) return
      expect(typeof res.data.text).toBe("string")
      expect(res.data.text.length).toBeGreaterThan(0)
    })

    it("two consecutive quip calls can return different quotes (probabilistic)", async () => {
      const seen = new Set<string>()
      for (let i = 0; i < 10; i += 1) {
        const res = await coworkApi.quip()
        if (res.ok) seen.add(res.data.text)
      }
      // With 20 quips, 10 picks should almost always yield 2+ unique.
      expect(seen.size).toBeGreaterThan(1)
    })
  })

  describe("mock latency", () => {
    it("a single read takes >= 50ms (realistic)", async () => {
      const start = performance.now()
      await coworkApi.health()
      const elapsed = performance.now() - start
      // 50ms is the floor in randomLatencyMs(); allow a small jitter.
      expect(elapsed).toBeGreaterThan(40)
    })
  })

  describe("chat handshake", () => {
    it("chatPrompt returns stream_id and session_id", async () => {
      const res = await coworkApi.chatPrompt("hello")
      expect(res.ok).toBe(true)
      if (!res.ok) return
      expect(res.data.stream_id.length).toBeGreaterThan(0)
      expect(res.data.session_id.length).toBeGreaterThan(0)
    })

    it("chatPrompt with a session_id reuses it", async () => {
      const res = await coworkApi.chatPrompt("hello", "sess_xyz")
      expect(res.ok).toBe(true)
      if (!res.ok) return
      expect(res.data.session_id).toBe("sess_xyz")
    })

    it("abortChat returns success in mock mode", async () => {
      const res = await coworkApi.abortChat("mock_stream_anything")
      expect(res.ok).toBe(true)
      if (!res.ok) return
      expect(res.data.aborted).toBe(true)
    })
  })

  describe("chat stream", () => {
    it("yields >= 6 events ending with `done`", async () => {
      const events: ChatStreamEvent[] = []
      for await (const event of coworkApi.streamChat("mock_stream_test")) {
        events.push(event)
      }
      expect(events.length).toBeGreaterThanOrEqual(6)
      expect(events[0].type).toBe("session-created")
      expect(events[events.length - 1].type).toBe("done")
    })

    it("includes at least 4 text-delta chunks", async () => {
      const events: ChatStreamEvent[] = []
      for await (const event of coworkApi.streamChat("mock_stream_test")) {
        events.push(event)
      }
      const deltas = events.filter((e) => e.type === "text-delta")
      expect(deltas.length).toBeGreaterThanOrEqual(4)
    })

    it("when includeAction is true, emits a client-action event", async () => {
      const events: ChatStreamEvent[] = []
      for await (const event of coworkApi.streamChat("mock_stream_test", {
        includeAction: true,
        actionRoute: "/files",
      })) {
        events.push(event)
      }
      const actions = events.filter(
        (e): e is Extract<ChatStreamEvent, { type: "client-action" }> =>
          e.type === "client-action",
      )
      expect(actions.length).toBe(1)
      expect(actions[0].kind satisfies ClientActionKind).toBe("navigate")
      expect(actions[0].args?.route).toBe("/files")
    })

    it("when includeAction is false, emits zero client-action events", async () => {
      const events: ChatStreamEvent[] = []
      for await (const event of coworkApi.streamChat("mock_stream_test", {
        includeAction: false,
      })) {
        events.push(event)
      }
      const actions = events.filter((e) => e.type === "client-action")
      expect(actions.length).toBe(0)
    })

    it("done event carries usage data", async () => {
      const events: ChatStreamEvent[] = []
      for await (const event of coworkApi.streamChat("mock_stream_test")) {
        events.push(event)
      }
      const done = events[events.length - 1]
      expect(done.type).toBe("done")
      if (done.type !== "done") return
      expect(done.usage?.tokens_in).toBeGreaterThan(0)
      expect(done.usage?.tokens_out).toBeGreaterThan(0)
    })
  })
})
