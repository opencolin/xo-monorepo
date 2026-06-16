<div align="center">

# XO — Monorepo

**One repository for the entire XO agent‑workspace platform.**
Web surfaces, Python control‑plane services, agent runtimes, automations, and content — unified, indexed, and wired with pnpm + Turborepo.

</div>

---

## What is XO?

XO ([xo.builders](https://xo.builders) · beta at [beta.xo.builders](https://beta.xo.builders)) is a platform for running and **orchestrating long‑running AI coding agents** inside portable *workspaces*. Many agent runtimes — Claude Code, OpenClaw, Codex, Hermes — are unified behind a single local **control plane**, wrapped in marketing, docs, research, and a multi‑agent "organization" UI.

This monorepo assembles **16 source repositories** (originally under [`github.com/sharmasuraj0123`](https://github.com/sharmasuraj0123)) into one tree, grouped by role:

```
xo/
├── apps/        ← web surfaces (Next.js 16 / React 19; one Vite app)
├── services/    ← Python backends (FastAPI control plane, MCP server, autonomous org)
├── agents/      ← agent runtime kits, shared prompts, n8n automations
├── content/     ← static content + the "universe" observatory
├── packages/    ← shared TS packages (@xo/types, @xo/tsconfig)
└── docs/        ← monorepo-level docs  →  see docs/ARCHITECTURE.md
```

---

## Repository map

Every directory below is a former standalone repo. The **Source** column links to its origin.

### `apps/` — web surfaces

| Path | Package | What it is | Source |
|---|---|---|---|
| [`apps/xo-landing`](apps/xo-landing) | `xo-landing` | Cinematic, scroll‑driven marketing landing page (9 scenes). Only ships live features. | [xo-landing](https://github.com/sharmasuraj0123/xo-landing) |
| [`apps/xo-via`](apps/xo-via) | `xo-phone-os` | XO's marketing surface rendered as an **iPhone‑style phone OS** — home grid, dock, one app at a time. Dev port `18002`. | [xo-via](https://github.com/sharmasuraj0123/xo-via) |
| [`apps/xo-org`](apps/xo-org) | `xo-org` | **Dual‑mode workspace UI** to manage & orchestrate agents — full multi‑agent *org* mode or single *agent* mode from one env var. Talks to the backend control plane. | [xo-org](https://github.com/sharmasuraj0123/xo-org) |
| [`apps/xo-docs`](apps/xo-docs) | `xo-docs` | Product **documentation** site (Fumadocs) with built‑in search + AI chat routes. | [xo-docs](https://github.com/sharmasuraj0123/xo-docs) |
| [`apps/xo-research`](apps/xo-research) | `xo-research` | **Research** briefs & syntheses (Fumadocs). Ships a `swarm/` of two folder‑scoped writing agents. | [xo-research](https://github.com/sharmasuraj0123/xo-research) |
| [`apps/xo-history`](apps/xo-history) | `visualizer` | **XO Visualizer** — a calm, canvas "histography" of any git repo's branch history. | [xo-history](https://github.com/sharmasuraj0123/xo-history) |
| [`apps/demo-xo`](apps/demo-xo) | `xo-video` | Vite + React demo surface. | [demo-xo](https://github.com/sharmasuraj0123/demo-xo) |
| [`apps/xo-cowork`](apps/xo-cowork) | — | Intended Cowork workspace frontend. **Empty upstream** — placeholder. | [xo-cowork](https://github.com/sharmasuraj0123/xo-cowork) |

### `services/` — Python backends

| Path | What it is | Source |
|---|---|---|
| [`services/xo-cowork-api`](services/xo-cowork-api) | **The local control plane.** FastAPI service that runs inside every workspace, brokers chat to whichever coding‑agent runtime is installed (Claude Code, OpenClaw, Hermes, Codex), owns the portable on‑disk project model, and hosts connectors (Drive, OneDrive, GitHub, Vercel, Manus) + Clerk identity + unified usage. | [xo-cowork-api](https://github.com/sharmasuraj0123/xo-cowork-api) |
| [`services/xo-mcp-server`](services/xo-mcp-server) | **MCP server** (FastMCP). Exposes XO platform tools to any MCP client: deploy / start / stop / remove apps, stream logs, expose with a domain, and knowledge‑base update + Q&A. | [xo-mcp-server](https://github.com/sharmasuraj0123/xo-mcp-server) |
| [`services/ethcc-hack-xo-ember`](services/ethcc-hack-xo-ember) | ETHCC hackathon — a **fully‑autonomous "XO digital organization"** built on uAgents (Fetch.ai) + LangChain / LangGraph. | [ethcc-hack-xo-ember](https://github.com/sharmasuraj0123/ethcc-hack-xo-ember) |

### `agents/` — runtimes, prompts, automations

| Path | What it is | Source |
|---|---|---|
| [`agents/openclaw-starterkit`](agents/openclaw-starterkit) | Starter template for **OpenClaw**, the agent runtime XO brokers — gateway auto‑runner, prompts, tools, cron, devices, identity. Drops into `~/.openclaw`. | [openclaw-starterkit](https://github.com/sharmasuraj0123/openclaw-starterkit) |
| [`agents/n8n-templates`](agents/n8n-templates) | Ready‑to‑import **n8n** workflow templates: Customer Support, Lead Generation, Social Media. | [n8n-templates](https://github.com/sharmasuraj0123/n8n-templates) |
| [`agents/xo-agents-prompts`](agents/xo-agents-prompts) | Intended home for shared agent system prompts. **Empty upstream** — placeholder. | [xo-agents-prompts](https://github.com/sharmasuraj0123/xo-agents-prompts) |

### `content/` — static & conceptual

| Path | What it is | Source |
|---|---|---|
| [`content/xo-privacy-policy`](content/xo-privacy-policy) | The XO privacy policy (single markdown). | [xo-privacy-policy](https://github.com/sharmasuraj0123/xo-privacy-policy) |
| [`content/xo-universe`](content/xo-universe) | **"universe"** — an experimental observatory: `observe.py` takes a git snapshot every 10 min (time as the first primitive) and models *thoughts as folders*. | [xo](https://github.com/sharmasuraj0123/xo) |

> Two upstream repos (`xo-cowork`, `xo-agents-prompts`) had **no commits** when this monorepo was assembled; each is kept as a documented placeholder so the full set of 16 is represented and the structure is ready for code.

---

## How it fits together

```
   ┌───────────────── marketing / top of funnel ─────────────────┐
   │   apps/xo-landing      apps/xo-via (phone-os)                │
   └───────────────────────────────┬─────────────────────────────┘
                                    │  sign up → beta.xo.builders
                                    ▼
   ┌──────────────────────── a Workspace ────────────────────────┐
   │                                                             │
   │   apps/xo-cowork  ─┐        apps/xo-org (org / agent UI)    │
   │   (frontend,       │             │  /api/proxy + SSE        │
   │    placeholder)    │             ▼                          │
   │                    └──►  services/xo-cowork-api  ◄──────────┤
   │                          (FastAPI control plane, :5002)     │
   │                            │  brokers chat to runtimes      │
   │              ┌─────────────┼───────────────┐                │
   │              ▼             ▼               ▼                │
   │        Claude Code     OpenClaw         Codex / Hermes      │
   │                    (agents/openclaw-starterkit)             │
   └───────────────────────────────┬─────────────────────────────┘
                                    │ identity (Clerk) + usage sync
                                    ▼
                          xo-swarm-api (cloud)

   side surfaces:  services/xo-mcp-server  (deploy/manage apps via MCP)
                   apps/xo-docs · apps/xo-research · apps/xo-history
                   agents/n8n-templates · services/ethcc-hack-xo-ember
```

A fuller walkthrough — components, ports, data flow, addressing model — is in **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)**.

---

## Getting started

### Prerequisites
- **Node ≥ 20** (`.nvmrc` pins `22`) and **pnpm 11** (`corepack enable`)
- **Python ≥ 3.12** for `services/` (the MCP server uses [`uv`](https://docs.astral.sh/uv/))

### Web apps (pnpm workspace + Turborepo)

```bash
pnpm install                 # one install for all apps/* (single root lockfile)

pnpm dev                     # run every app's dev server via turbo
pnpm dev --filter xo-org     # …or just one (use the package name)
pnpm build                   # build all web apps
pnpm lint                    # lint all
pnpm typecheck               # type-check all
```

Per‑app package names (for `--filter`): `xo-landing`, `xo-phone-os` (xo-via), `xo-org`, `xo-docs`, `xo-research`, `visualizer` (xo-history), `xo-video` (demo-xo).

> Heads‑up on ports: most apps default to `3000`; **xo-via runs on `18002`**. Run apps you want concurrently with explicit ports, or one at a time.

### Python services (own toolchains, outside the JS workspace)

```bash
# Control plane
cd services/xo-cowork-api && pip install -r requirements.txt && cp .env.example .env
python server.py                              # FastAPI on :5002

# MCP server
cd services/xo-mcp-server && uv sync && uv run xo-mcp-server

# Autonomous org (hackathon)
cd services/ethcc-hack-xo-ember && pip install -r requirements.txt && python xo_agent.py
```

---

## Monorepo layout & tooling

- **Package manager:** pnpm workspaces — `apps/*` and `packages/*` are members (see [`pnpm-workspace.yaml`](pnpm-workspace.yaml)). `services/`, `agents/`, and `content/` are intentionally **not** JS workspace members; they keep their own toolchains.
- **Shared code:** [`packages/`](packages) holds `@xo/types` (platform types) and `@xo/tsconfig` (base TS config). `apps/xo-org` consumes `@xo/types` via `@/lib/xo-types` as a worked example.
- **Task runner:** [Turborepo](turbo.json) — `build`, `dev`, `start`, `lint`, `typecheck`, `format`, `clean` fan out across web apps with caching.
- **One lockfile:** the root [`pnpm-lock.yaml`](pnpm-lock.yaml) is the single source of truth; per‑app lockfiles were removed during assembly.
- **Build scripts:** native deps ship prebuilt binaries, so dependency build scripts are disabled by default for fast, deterministic installs (`allowBuilds` in `pnpm-workspace.yaml`).

Each subproject keeps its **original README** and `.claude/` config in place — start there for project‑specific detail.

- **Repo navigator:** a monorepo‑wide [`xo` skill](.claude/skills/xo/SKILL.md) routes "I want to work on X" to the right directory, run command, port, and the matching bundled project‑skill. It auto‑loads when Claude Code is rooted at the repo.

## Provenance

Assembled from 16 repositories under [`github.com/sharmasuraj0123`](https://github.com/sharmasuraj0123). Individual git histories were flattened (nested `.git` directories removed) so this is a single, self‑contained repository. See each subdirectory's README and the **Source** links above to trace anything back to its origin.
