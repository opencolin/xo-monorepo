/**
 * Shared XO platform types, re-exported from the monorepo's `@xo/types`
 * package so app code can import them via the local `@/lib/xo-types` alias.
 *
 * This is the wiring point that proves the workspace package resolves; import
 * platform types from here (or directly from `@xo/types`).
 */
export type {
  AddressingMode,
  AgentRuntime,
  AppLifecycleState,
  MessageEnvelope,
  XoMode,
} from "@xo/types";
