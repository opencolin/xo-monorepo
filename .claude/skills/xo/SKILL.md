---
name: xo
description: Navigator for the XO monorepo. Use when working anywhere in this repo and you need to find the right subproject for a task, learn what an app/service/agent-kit does, how to run it, which port it uses, or which bundled project-skill applies. Routes intent like "I want to work on the docs / the agent UI / the backend / the landing page" to the correct directory under apps/, services/, agents/, packages/, or content/.
---

# XO Monorepo — Navigator

One repo for the entire **XO** agent-workspace platform: run and orchestrate
long-running AI coding agents (Claude Code, OpenClaw, Codex, Hermes) inside
portable *workspaces*, unified behind a local **control plane**. Assembled from
16 source repos, grouped by role. Full detail: [`README.md`](../../../README.md)
and [`docs/ARCHITECTURE.md`](../../../docs/ARCHITECTURE.md).

```
apps/      web surfaces (Next.js 16 / React 19; one Vite app)
services/  Python backends (FastAPI control plane, MCP server, autonomous org)
agents/    agent runtime kits, shared prompts, n8n automations
packages/  shared TS packages (@xo/types, @xo/tsconfig)
content/   static content + the "universe" observatory
```

## Route by intent

| I want to work on… | Go to | Package / run | Notes |
|---|---|---|---|
| Marketing **landing page** | [`apps/xo-landing`](../../../apps/xo-landing) | `xo-landing` | Scroll-driven, 9 scenes |
| **Phone-OS** marketing surface | [`apps/xo-via`](../../../apps/xo-via) | `xo-phone-os` | **Dev port `18002`** |
| **Agent org / workspace UI** | [`apps/xo-org`](../../../apps/xo-org) | `xo-org` | Dual-mode (`NEXT_PUBLIC_XO_MODE=org\|agent`); talks to control plane |
| **Docs** site | [`apps/xo-docs`](../../../apps/xo-docs) | `xo-docs` | Fumadocs + search + AI chat |
| **Research** briefs | [`apps/xo-research`](../../../apps/xo-research) | `xo-research` | Fumadocs; ships a writing `swarm/` |
| Git-history **visualizer** | [`apps/xo-history`](../../../apps/xo-history) | `visualizer` | Canvas "histography" |
| Vite **demo** | [`apps/demo-xo`](../../../apps/demo-xo) | `xo-video` | |
| **Control-plane backend** (chat brokering, connectors, identity) | [`services/xo-cowork-api`](../../../services/xo-cowork-api) | `python server.py` | FastAPI on **`:5002`** |
| **MCP tools** (deploy / start / stop / logs / KB) | [`services/xo-mcp-server`](../../../services/xo-mcp-server) | `uv run xo-mcp-server` | FastMCP |
| **Autonomous org** (uAgents/LangGraph) | [`services/ethcc-hack-xo-ember`](../../../services/ethcc-hack-xo-ember) | `python xo_agent.py` | ETHCC hackathon |
| **OpenClaw** runtime kit | [`agents/openclaw-starterkit`](../../../agents/openclaw-starterkit) | `./setup.sh` | Drops into `~/.openclaw` |
| **n8n** automations | [`agents/n8n-templates`](../../../agents/n8n-templates) | import JSON | Support / Leads / Social |
| **Shared TS** types & config | [`packages/types`](../../../packages/types) · [`packages/tsconfig`](../../../packages/tsconfig) | `@xo/types` · `@xo/tsconfig` | Import types via `@xo/types` |
| **Privacy policy** | [`content/xo-privacy-policy`](../../../content/xo-privacy-policy) | — | Single markdown |
| **"Universe"** observatory | [`content/xo-universe`](../../../content/xo-universe) | `python observe.py` | Thoughts-as-folders experiment |

> Placeholders: `apps/xo-cowork` and `agents/xo-agents-prompts` were **empty
> upstream** — documented stubs, no code yet.

## Run

```bash
# Web apps — pnpm workspace + Turborepo (run from repo root)
pnpm install                 # one install for all apps/*
pnpm dev                     # every app via turbo
pnpm dev --filter xo-org     # …or one, by PACKAGE name (see table above)
pnpm build | lint | typecheck

# Python services — own toolchains, NOT in the JS workspace
cd services/xo-cowork-api && pip install -r requirements.txt && cp .env.example .env && python server.py   # :5002
cd services/xo-mcp-server && uv sync && uv run xo-mcp-server
```

Gotchas: most apps default to port `3000` (run one at a time or set explicit
ports) — **except `xo-via` on `18002`**. `--filter` takes the **package name**,
which differs from the folder for `xo-via` (`xo-phone-os`), `xo-history`
(`visualizer`), and `demo-xo` (`xo-video`).

## Bundled project-skills

Each subproject ships its own `.claude/skills/` that auto-loads **only when
Claude Code is rooted in that subdirectory**. To use one, open Claude there.

| Skill | Where | For |
|---|---|---|
| `project-conventions` | `apps/xo-org` | XO Org structure, brand, OKLCH theme, code style |
| `nextjs-developer` | `apps/xo-org` | Next.js 16 App Router patterns |
| `shadcn-ui` | `apps/xo-org` | shadcn v4 base-nova + Tailwind v4 |
| `add-icon` | `apps/xo-docs`, `apps/xo-research` | Add an icon to the docs/research site |
| `xo-projects` | `services/xo-cowork-api/.agents/skills` | The on-disk XO project model |
| `agno-agentic-backend`, `code-writer`, `debugger`, `reviewer`, `default` | `services/xo-cowork-api` | FastAPI/Agno backend engineering behaviors |

When a task lands in one of these areas, **consult the matching project-skill
before writing code there** — they encode the conventions that this top-level
navigator deliberately doesn't duplicate.
