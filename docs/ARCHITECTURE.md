# XO Platform — Architecture

How the pieces in this monorepo fit together, what each one owns, and where the
seams are. For the at‑a‑glance map see the root [README](../README.md); this
document goes a layer deeper.

---

## 1. The big picture

XO turns a folder on your machine into an **agent workspace**: a place where one
or more long‑running AI coding agents (Claude Code, OpenClaw, Codex, Hermes) do
work, share a project model, and report usage — all behind one API. Around that
core sit marketing surfaces, documentation, research, an MCP control surface, and
an experimental "organization of agents" UI.

Three planes:

| Plane | Lives where | Responsibility |
|---|---|---|
| **Presentation** | `apps/*` | Marketing (landing, phone‑os), product UI (org, cowork), docs, research, history viewer. |
| **Control** | `services/xo-cowork-api`, `services/xo-mcp-server` | Broker chat to runtimes, own the project model, deploy/manage apps, identity, usage. |
| **Runtime** | `agents/*`, the user's installed CLIs | The actual agents that execute work (`~/.claude`, `~/.openclaw`, `~/.codex`, `~/.hermes`). |

---

## 2. Control plane — `services/xo-cowork-api`

The keystone. A **FastAPI** service that runs locally inside every workspace
(default port `5002`; some clients reference `:8000`). It does **not** run
inference — it stitches runtimes together and adds the boring‑but‑critical glue.

**HTTP / SSE surface** (`server.py` wires the routers):

```
/api/chat/*        /api/sessions/*     /api/files/*
/api/agents/*      /api/projects/*     /api/secrets/*
/api/usage         /api/connectors/*   /xo-auth/*
/health  /sessions  /ask_question  /ask_question_streaming  /gateway/restart  /app/{restart,update}
```

Routers live in [`services/xo-cowork-api/routers/`](../services/xo-cowork-api/routers)
(`auth`, `channels`, `providers`, `models`, `claude_setup_token`, `codex_setup`,
`openclaw_usage`, `cowork_agent`); supporting logic in
[`services/xo-cowork-api/services/`](../services/xo-cowork-api/services)
(`usage_sync`, `xo_manifest`, `cowork_agent`).

**Four things it owns**

1. **Pluggable runtimes** — one `BaseAgentAdapter` contract behind `/api/chat/*`.
   Claude Code, OpenClaw, and Hermes are first‑class; Codex is partial. New
   runtimes plug in without touching routers.
2. **A sharing‑safe project model** — chat content stays in each runtime's own
   store (`~/.claude/`, `~/.openclaw/`). The project folder at
   `~/xo-projects/<id>/` is pure metadata + work files, structurally safe to
   share, fork, or rebase.
3. **SSE streaming with sane reconnects** — `event: text-delta` / `done` /
   `heartbeat` / `agent-error`, React‑Strict‑Mode‑safe via a 600 s reconnect
   window, single‑flight on conflicts.
4. **Connectors & identity** — Google Drive / OneDrive (rclone), GitHub (PAT +
   `gh` device flow), Vercel (OAuth 2.1 PKCE + Dynamic Client Registration),
   Manus (API key). Credentials land in `mcp-tokens.json` / `rclone.conf` and
   survive restarts. Identity is **Clerk**‑backed via a browser poll‑token flow
   where cowork‑api is the trusted intermediary — tokens never reach the frontend.

**Local‑first:** the only outbound call is to `xo-swarm-api` (cloud) for identity
verification and a daily usage sync. No telemetry.

---

## 3. Product UI — `apps/xo-org`

A **dual‑mode** Next.js 16 workspace for managing agents. One env var,
`NEXT_PUBLIC_XO_MODE`, flips the whole app:

| | `org` mode | `agent` mode |
|---|---|---|
| Routes | `/org/*` (+ drill into `/agent/[id]`) | `/agent/*` only |
| Nav | Dashboard, Agents, Objectives | Chat, Dashboard |
| Identity | org + all agents (switcher) | one fixed agent |
| Storage keys | `xo-org-session-*` | `xo-agent-session-*` |

**Data flow:** client (React 19) → `localStorage` for chat persistence →
`/api/*` routes → an in‑memory **Bridge** (append‑only event log, agents,
channels, tasks) and `/api/proxy` → the external backend (the cowork/swarm
control plane on `:8000`) for sessions, tasks, and workspace.

**Messaging** is an append‑only event log with cursor reads. Each
`MessageEnvelope` has four addressing modes:

- **Direct** `agent-id` — one agent
- **Role** `@Engineering` — load‑routed to an available agent of that role
- **Channel** `#code-review` — all channel members
- **Broadcast** `*` — everyone

UI is shadcn/ui (`components.json`) with a sidebar shell (ContextSwitcher,
NavMain, Folders, Sessions, Tasks).

---

## 4. Marketing surfaces — `apps/xo-landing`, `apps/xo-via`

- **xo-landing** — a single‑page, scroll‑driven story (9 scenes: hero → why →
  workspace/platform → tour → agents → integrations → 1‑click connect → pricing →
  CTA). Content‑light by design; visuals lead. CTAs point to `beta.xo.builders`.
- **xo-via** (`xo-phone-os`) — the same marketing content reimagined as an
  **iPhone‑style phone OS**: full‑bleed on phones, a centered device frame on
  desktop/tablet, home grid → app, status bar, dock, home indicator. Next.js 16 +
  Turbopack + Tailwind 4 + Framer Motion shared‑layout transitions. Server
  Components by default with a single client boundary; `output: "standalone"`,
  multi‑stage Dockerfile, runtime env injection via `entrypoint.sh`, k8s‑ready.
  Dev/serve port **18002**. Clean‑room — no Apple code or assets.

---

## 5. MCP control surface — `services/xo-mcp-server`

A **FastMCP** server (`FastMCP("XO-MCP-Server")`) that lets any MCP client
(Claude, Cursor, ChatGPT, …) operate the XO platform in natural language. Tools:

| Tool | Purpose |
|---|---|
| `deploy_to_xo()` | One‑click container deploy to XO infra |
| `start_xo_app()` / `stop_xo_app()` / `remove_xo_app()` | App lifecycle |
| `get_xo_app_logs()` | Real‑time logs |
| `expose_xo_app()` | Publish with an auto‑provisioned domain |
| `update_knowledgebase_using_text(project, text, …)` | Write to a per‑project KB |
| `ask_question(project, question, agent_type, …)` | Context‑aware Q&A over the KB |

Packaged with `uv` / hatchling (`xo-mcp-server` entry point).

---

## 6. Agent runtimes & automations — `agents/*`

- **openclaw-starterkit** — the template a user drops into `~/.openclaw` so the
  control plane has an OpenClaw runtime to broker. Ships a `gateway.sh`
  auto‑runner, `setup.sh`, and `agents/`, `prompts/`, `tools/`, `cron/`,
  `devices/`, `identity/`, `canvas/`, `workspace/` scaffolding plus `AGENTS.md` /
  `CLAUDE.md` guidance.
- **n8n-templates** — importable n8n workflows across Customer Support, Lead
  Generation, and Social Media (`index.json` indexes them).
- **xo-agents-prompts** — placeholder for shared prompts (empty upstream).

---

## 7. Knowledge & experiments

- **apps/xo-docs** — Fumadocs product docs with `/api/search` and `/api/chat`
  route handlers; MDX content under `content/`.
- **apps/xo-research** — Fumadocs research site; additionally runs a **swarm** of
  two tiny folder‑scoped writing agents (`swarm/agents.env` scopes agent *X* and
  *O* to specific content folders + prompts, driven by `swarm/xo-swarm.sh` and
  `pnpm swarm`).
- **apps/xo-history** (`visualizer`) — a Canvas 2D "histography": every branch of
  a target git repo drawn as one flowing wave (additions ridge up green,
  deletions fall red). Point it at any local repo path.
- **services/ethcc-hack-xo-ember** — an ETHCC hackathon experiment: a fully
  autonomous "XO digital organization" on uAgents (Fetch.ai) + LangChain /
  LangGraph (`xo_agent.py`, `test-agent-uagent.py`).
- **content/xo-universe** — the conceptual "universe": `observe.py` installs a
  cron heartbeat that snapshots the folder via git every 10 minutes (**time** as
  the first primitive; root commit = big bang) and models *thoughts as folders*.
  Standalone art/observatory piece, not part of the product runtime.

---

## 8. Ports & integration cheat‑sheet

| Component | Default port | Talks to |
|---|---|---|
| `services/xo-cowork-api` | `5002` (clients also use `:8000`) | runtimes on disk; `xo-swarm-api` cloud (Clerk + usage) |
| `apps/xo-org` | `3000` | control plane via `/api/proxy` (`:8000`) + in‑memory bridge + localStorage |
| `apps/xo-via` | `18002` | none (static) |
| `apps/xo-docs` / `xo-research` | `3000` | own search/chat route handlers |
| `apps/xo-history` | `3000` | reads a local git repo path |
| `services/xo-mcp-server` | stdio (MCP) | XO infra deploy/KB APIs |

> Because several web apps default to `3000`, run them one at a time or assign
> explicit ports when running concurrently.

---

## 9. Monorepo conventions

- **JS workspace** = `apps/*` + `packages/*` only (pnpm). One root lockfile;
  Turborepo fans `build/dev/lint/typecheck` across packages with caching.
- **Python services** are deliberately outside the JS workspace — each keeps its
  own `requirements.txt` / `pyproject.toml`. Use `pip`/`uv` per service.
- **Filter by package name**, not directory: e.g. `pnpm dev --filter xo-phone-os`
  for `apps/xo-via`, `--filter visualizer` for `apps/xo-history`.
- **Original project docs are authoritative for detail** — each subproject keeps
  its README, `AGENTS.md`/`CLAUDE.md`, and planning docs (xo-via in particular
  ships an extensive `*_PLAN.md` set describing its roadmap).
- **`packages/`** is reserved for code shared across apps (design tokens, types,
  UI). Empty today; add shared TS packages here and reference them as
  `workspace:*` dependencies.
