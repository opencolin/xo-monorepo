"use client"

import * as React from "react"
import { Via } from "@/components/via"

/**
 * Section A stub.
 *
 * The v0 AgentSurface (Claude Agent SDK, MCP servers, SSE bridge) has
 * been removed. The real implementation is rebuilt in Section D as the
 * expanded state of the dock Chat button, against the Section K mock
 * stream first, then swapped to the real cowork-api stream in Section B.
 *
 * Until then this surface renders a calm placeholder so /ask still has
 * something to render and the typecheck stays clean.
 */
export function AgentSurface() {
  return (
    <div className="flex flex-col items-center justify-center h-full px-6 text-center gap-6 text-white">
      <Via expression="thinking" animation="pulse" size={96} label="Via, rewiring" />
      <div className="space-y-2">
        <h2 className="text-xl font-semibold tracking-tight">Chat is moving home.</h2>
        <p className="text-white/60 text-sm leading-relaxed max-w-[28ch]">
          The Anthropic-SDK backend is gone. Chat is being rebuilt as the dock button across every mode. Back soon.
        </p>
      </div>
      <code className="text-[11px] text-white/40 font-mono">section A stub &middot; rewiring in Section D</code>
    </div>
  )
}
