/**
 * @xo/types — shared TypeScript types for the XO platform.
 *
 * These model concepts that recur across surfaces (the control plane
 * `services/xo-cowork-api`, the `apps/xo-org` UI, and others) so they can be
 * imported from one place instead of redeclared per app.
 */

/**
 * Coding-agent runtimes the control plane (`xo-cowork-api`) can broker chat to.
 * Claude Code, OpenClaw and Hermes are first-class; Codex is partial.
 */
export type AgentRuntime = "claude-code" | "openclaw" | "hermes" | "codex";

/**
 * Operating mode for the `xo-org` workspace UI, selected at build time via
 * `NEXT_PUBLIC_XO_MODE`. `org` = multi-agent workspace; `agent` = single agent.
 */
export type XoMode = "org" | "agent";

/**
 * How a {@link MessageEnvelope} is addressed in the `xo-org` append-only event
 * log. Mirrors the four addressing modes the product supports.
 */
export type AddressingMode =
  | { kind: "direct"; agentId: string } // one specific agent
  | { kind: "role"; role: string } // e.g. "@Engineering" — load-routed
  | { kind: "channel"; channel: string } // e.g. "#code-review" — all members
  | { kind: "broadcast" }; // "*" — everyone

/**
 * A single entry in the cursor-read event log. `cursor` is monotonically
 * increasing so consumers can resume from where they left off.
 */
export interface MessageEnvelope {
  id: string;
  cursor: number;
  from: string;
  to: AddressingMode;
  text: string;
  /** ISO 8601 timestamp. */
  createdAt: string;
}

/** Lifecycle states surfaced by the MCP server's app-management tools. */
export type AppLifecycleState = "deploying" | "running" | "stopped" | "removed";
