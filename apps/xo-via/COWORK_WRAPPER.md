# xo-cowork-api wrapper

A typed TypeScript client + agent toolset that lets the phone-os agent reach into a user's Coworker workspace. Lives at `lib/cowork-api/` and `lib/agent/cowork-tools.ts`. This doc explains what landed, what changes in the system because of it, and how the wrapper differs from other ways of reaching cowork-api.

For the underlying agent design, see [`AGENT_PLAN.md`](AGENT_PLAN.md). For the cowork-api itself, see the guides at `../xo-cowork-api/docs/frontend-*.md`.

---

## 1. What the wrapper is

Three small pieces:

| File | Role |
|---|---|
| `lib/cowork-api/types.ts` | Narrow DTOs for the endpoints we wrap (we don't try to model the full API). |
| `lib/cowork-api/client.ts` | Typed fetch wrapper. Reads `COWORK_API_URL` (default `http://localhost:5002`). Soft-fails with `{ ok: false, error }` so the agent can recover. |
| `lib/agent/cowork-tools.ts` | An in-process MCP server (`xo-cowork`) registered alongside `xo-os`. Six tools that wrap the client. |

The agent now sees ~6 cowork tools alongside the 7 OS tools from Phase 2. Same prompt, same wire format, same UI; the toolkit grew.

Current v1 surface (intentionally minimal):

| Tool | Endpoint | Side effects |
|---|---|---|
| `cowork_health` | `GET /health` | Read |
| `cowork_workspace_info` | `GET /api/config/workspace` | Read |
| `cowork_list_sessions` | `GET /api/sessions/` | Read |
| `cowork_list_agents` | `GET /api/agents/` | Read |
| `cowork_list_files(path?)` | `POST /api/files/list-directory` | Read |
| `cowork_read_file(path)` | `POST /api/files/content` | Read |

Read-only. No writes, no chat, no secrets, no OAuth, no scaffolding. Those add explicit tier W tools later if/when wanted.

---

## 2. Before / after architecture

### Phase 2 (OS tools only)

```
  Browser              Vercel Route Handler              Anthropic
  ┌──────┐              ┌──────────────────┐             ┌────────┐
  │AgentS│ ──snapshot──►│ runChatTurn      │             │        │
  │urface│              │   xo-os MCP      │ ───query───►│ Claude │
  │      │ ◄──SSE────── │     7 tools      │             │        │
  └──────┘              │     (R + N)      │             └────────┘
                        └──────────────────┘
                                ▲
                                │  All tools run in this Node process
                                │  against PhoneContext (via client ack)
                                │
                        (no external backend touched)
```

### Phase 2 + cowork wrapper (this work)

```
  Browser              Vercel Route Handler              Anthropic
  ┌──────┐              ┌──────────────────┐             ┌────────┐
  │AgentS│ ──snapshot──►│ runChatTurn      │             │        │
  │urface│              │   xo-os MCP      │ ───query───►│ Claude │
  │      │ ◄──SSE────── │     7 tools      │             │        │
  └──────┘              │   xo-cowork MCP  │             └────────┘
                        │     6 tools      │
                        └────────┬─────────┘
                                 │ server -> server fetch
                                 ▼
                        ┌──────────────────┐
                        │ xo-cowork-api    │
                        │ (FastAPI, :5002) │
                        │ inside the user's│
                        │ Coworker         │
                        └──────────────────┘
```

The Route Handler now has two MCP servers attached. `xo-os` continues to bridge to PhoneContext via the SSE client-action loop. `xo-cowork` calls cowork-api directly over HTTP and returns the JSON inline as the tool result (no client round-trip).

---

## 3. What changes in the system

Three categories: capabilities, costs, and trust.

### 3.1 Capabilities the agent now has

Before the wrapper, "Hey XO, what was I working on yesterday?" got a polite "I don't have access to your sessions." After:

| User asks | What the agent can do now |
|---|---|
| "What was I working on?" | `cowork_list_sessions` → summarize the top N |
| "Open the README in my main project." | `cowork_workspace_info` → `cowork_list_files` → `cowork_read_file` → quote relevant lines |
| "Which agents are configured?" | `cowork_list_agents` → list with backends |
| "Is my workspace up?" | `cowork_health` |
| "What's in /Users/me/notes/foo.md?" | `cowork_read_file` |

These compose with OS tools too: "Open Coworker and show me my latest session" routes through `os_open_app('/coworker')` + `cowork_list_sessions`.

### 3.2 Costs that appear

| Concern | Phase 2 only | Phase 2 + cowork |
|---|---|---|
| **Latency per tool call** | sub-ms (in-process) | + one network RTT to cowork-api (~5-50ms local; up to ~200ms cross-region) |
| **Failure modes** | client refused; ack timeout | + cowork-api unreachable (`ECONNREFUSED`), 404 on wrong endpoint, 403 on path-outside-`$HOME`, 502 if cowork-api itself depends on upstream that's down |
| **Token spend** | OS tool results are tiny JSON | File contents and session lists can be large; one `cowork_read_file` of a 200KB file is real input tokens |
| **Server load on cowork-api** | none | every agent call hits the user's machine; respect the user's rate limits if they have any |

The client mitigates the first two: 5-second timeout per call, soft-fail with an actionable error string. The third (token spend on file reads) is on the agent's system prompt: it's instructed to ask before reading anything large.

### 3.3 Trust surface that opens

Before the wrapper, the agent could not see anything about the user beyond the OS snapshot the browser explicitly sent. After:

- **Filesystem reach**: anything under `$HOME` on the cowork-api host is readable through `cowork_read_file`. The API's path-clamp to `$HOME` is the only barrier; symlink-traversal-out is a documented leak per `frontend-api-index.md`.
- **Session content**: session titles, message counts, and (if we wrap chat endpoints later) full conversation history.
- **Agent configs**: the user's locally-configured agents and which backend they target.
- **Workspace metadata**: projects root, runtime availability.

The wrapper does NOT currently expose: file writes, `.env` secrets, OAuth tokens, the actual chat-send endpoint, or anything from `/api/connectors/*`. Adding any of these is a discrete decision, not a code change away.

---

## 4. How the wrapper differs from other ways to reach cowork-api

Four alternative shapes, ordered by how much code lives where:

### 4.1 vs running the agent inside the Coworker container

The Coworker workspace already brokers Claude Code (and Codex, OpenClaw) via the runtimes shipped in cowork-api itself. The agent there has:

- Direct filesystem access (no HTTP hop, no path clamp)
- The user's shell, git creds, installed CLIs
- File watchers, IDE context, terminal state
- The user's own Claude subscription via the workspace's `claude /login`

| Concern | This wrapper (phone-os) | In-workspace agent |
|---|---|---|
| Reach | HTTP-mediated read-only subset | Native, full, including shell |
| Latency | Network RTT per tool | Microseconds |
| Cost model | Operator (phone-os Anthropic account) | User (their Claude subscription) |
| UX | Phone OS chat in a browser | Claude Code / OpenClaw CLI / Coworker desktop |
| Reach across machines | All your devices hit the same one cowork-api host | Each container is its own world |
| Privacy | Source flows phone-os → Anthropic | Source stays in the container |

The two are complementary. The phone-os agent is for ambient "what's in my workspace" questions you'd ask from anywhere. The in-workspace agent is for actually working in the workspace.

### 4.2 vs the browser hitting cowork-api directly

If `AgentSurface` (or any phone-os component) called cowork-api in the browser:

- `ALLOWED_ORIGINS` on cowork-api would need to include the phone-os origin (`http://localhost:18002`, then your real domain). Currently defaults to `http://localhost:3000,http://127.0.0.1:3000`.
- Every user's browser would need network reach to their own cowork-api host. Fine on a laptop where both are localhost; useless if cowork-api lives on a remote Coder workspace the user accesses via VPN.
- No agent involvement; data shows up in the UI but the model can't reason about it.

The server-side wrapper trades that for: no CORS friction (Route Handler runs server-side), the agent can chain calls in one turn, and the browser stays a thin client.

### 4.3 vs cowork-api as an MCP server

cowork-api could itself expose an MCP server (HTTP-MCP transport) that the Agent SDK consumes natively. Then `lib/cowork-api/client.ts` and `lib/agent/cowork-tools.ts` become unnecessary:

```ts
mcpServers: {
  "xo-os": createOsMcpServer(),
  "xo-cowork": { type: "http", url: "http://localhost:5002/mcp" },
}
```

Trade-offs:

| Aspect | Wrapper (current) | MCP transport |
|---|---|---|
| Tool list | Hand-picked 6 tools, narrow | Whatever cowork-api exposes (could be 50+) |
| Versioning | Wrapper code is the contract | MCP schema is the contract; upstream changes propagate |
| Auth | None today; trivially addable | MCP standard auth (we'd implement) |
| Coupling | Wrapper isolates upstream churn | Upstream tool changes hit the agent immediately |
| Discoverability | Limited to what we wrap | Agent sees everything |

Right now cowork-api does not ship an MCP transport. If/when it does, the wrapper is the migration target: keep its tool names, swap the implementation underneath, and the agent's system prompt doesn't change.

### 4.4 vs a per-XOApp `agent` block

AGENT_PLAN §3.2 sketches per-app tools declared in each `app/<route>/app.ts`. We did not use that pattern here because cowork-api is a cross-cutting concern: any phone app might want to query the workspace, not just one. Putting cowork tools on (say) the Coworker app would prevent the agent from calling them while the user is on the Pricing app.

Wrapping cowork as a top-level MCP server keeps it globally available. The per-app `agent: {}` pattern is for app-specific operations (e.g., a future `/notes` app with `notes_search(query)`).

---

## 5. Auth model

xo-cowork-api documents itself as having **no inbound auth**: the workspace itself is the trust boundary (see `xo-cowork-api/docs/frontend-api-index.md` §"Auth model"). The wrapper does not forward any token.

Consequences:

- Anyone who can reach `COWORK_API_URL` can read whatever the agent reads.
- For local dev (`http://localhost:5002`), this is fine: only the developer's machine can reach localhost.
- For remote cowork-api hosts (a Coder workspace, a hosted Coworker), you must reach the host through whatever VPN / SSH-tunnel / private network gives the user access. **Do not expose cowork-api to the public internet.**
- If a future cowork-api adds auth, this wrapper grows a token-forwarding layer. The interface (`coworkApi.foo()`) does not change; only `request()` in `client.ts` does.

Per-user auth (each phone visitor reaches their own cowork-api) is explicitly out of scope. The phone-os agent operates at operator level (one Anthropic account, one cowork-api host) per AGENT_PLAN.md §13 #2a.

---

## 6. Failure modes seen during smoke testing

Documented because they will recur and because the errors are actionable:

| Scenario | What happens | Hint surfaced |
|---|---|---|
| `cowork-api` not running | `request()` catches `ECONNREFUSED` | `"cowork-api unreachable at http://localhost:5002. Is xo-cowork-api running? Set COWORK_API_URL if it lives elsewhere."` |
| Wrong endpoint path (we hit one) | API returns `404` | `"cowork-api /api/files/list returned HTTP 404"` (agent saw this and adapted; we then fixed the endpoint to `/api/files/list-directory`) |
| Path outside `$HOME` | API returns `403` | `"cowork-api /api/files/list-directory returned HTTP 403"` |
| Per-call timeout (5s default) | `AbortController` fires | `"cowork-api /api/files/content timed out (5000ms)"` |
| cowork-api shipped a breaking change | Any of `404`, `422`, `500` | Surfaced verbatim; the wrapper does not silently swallow |

The "wrong endpoint" case is a useful design feedback loop: the wrapper is a contract we wrote against the docs. When the docs and the API disagree, the agent's tool error tells us which is wrong, fast.

---

## 7. Where to extend

When you need a new cowork capability, the path is:

1. Read the relevant doc under `../xo-cowork-api/docs/frontend-*.md`.
2. Add the DTO shape to `lib/cowork-api/types.ts`.
3. Add the wrapper method to `lib/cowork-api/client.ts`. Mirror the existing soft-fail pattern.
4. Add the `tool(...)` in `lib/agent/cowork-tools.ts`. Description should tell the agent when to use it and what NOT to do.
5. Append the fully-qualified name to `COWORK_TOOL_NAMES`.
6. Update the system-prompt section in `lib/agent/server.ts` if the new tool needs guidance.

Three obvious extensions if/when we want them:

- `cowork_send_chat({sessionId, message})` against `/api/chat/*`. turns the phone agent into a remote control for the in-workspace agent. Big capability jump; needs careful permission UX.
- `cowork_search_files(query)` against the FTS endpoint. opens "find my notes about X" flows.
- `cowork_get_session_messages(id)` against `/api/messages/{id}`. gives the phone agent visibility into prior workspace conversations.

Each is one tool + one client method + one system-prompt paragraph.

---

## 8. Verification

Live tests run during build:

```
> "Quick: call cowork_health and tell me whether my workspace is up."
< "Workspace is up (healthy, beta stage, unauthenticated)."

> "Find my projects root via cowork_workspace_info, then list its top-level entries."
< "Root: `/Users/.../ClaudeWorkspace`
   First 5 directories: .agents, .claude, .pnpm-store, .xo, .xo-cowork"
```

These are the same SSE wire format as Phase 2; the new pieces just expose more tools in the system prompt and route their results through the same `tool-call` → text loop.

---

## 9. What this wrapper is NOT

- Not a generic HTTP client. Only the endpoints we explicitly add are reachable.
- Not authenticated. cowork-api's trust model means we depend on network reachability for security; do not point this at a public cowork-api.
- Not the only path to cowork. The in-workspace agent (Claude Code / OpenClaw) has strictly more reach and is the right tool when the user IS inside the workspace.
- Not a replacement for direct user-to-cowork calls. UIs that want to render workspace data should keep doing so server-side; this wrapper is specifically for agent reach.
- Not stable. We model 6 endpoints. Adding the next 50 is mostly typing, but each is a new code change.
