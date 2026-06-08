"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { useRoles } from "@/context/RoleContext"
import {
  GLASS_PANEL_CLASS,
  GlassHighlight,
  GlassInnerGlow,
  GlassSpecular,
} from "@/components/gestures/glass"
import type { ResolvedXOApp } from "@/lib/xo-app"

/**
 * XO-styled sign-in screen. Renders as a full-bleed overlay inside
 * an app's scroll container when the app requires sign-in and the
 * current user is anonymous.
 *
 * v7.0: the "Sign in" CTA simply grants the `signed-in` role via
 * the dev stub. v7.1 replaces the CTA with a real Clerk sign-in
 * flow without changing this component's surface.
 *
 * Style matches the other slide-down panels (glass morphism + the
 * shared highlight / glow / specular helpers).
 */
export function SignInGate({ app }: { app: ResolvedXOApp }) {
  const { grant, devModeEnabled } = useRoles()

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center p-6">
      {/* Background scrim, slight darken so the overlay separates
          from the app body underneath. */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-md" aria-hidden />

      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={`${app.label} requires sign in`}
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className={`relative w-full max-w-sm px-6 pt-10 pb-7 ${GLASS_PANEL_CLASS}`}
        style={{ borderRadius: "28px" }}
      >
        <GlassSpecular />
        <GlassInnerGlow />
        <GlassHighlight />

        {/* App icon echoes the app's tile so the user knows what
            they were trying to open. */}
        <div className="relative flex flex-col items-center text-center">
          <div
            className={[
              "w-16 h-16 rounded-2xl grid place-items-center font-bold text-xl mb-4 shadow-lg",
              app.tile,
            ].join(" ")}
            aria-hidden
          >
            {app.glyph}
          </div>

          <h2 className="text-white text-xl font-semibold tracking-tight mb-1">
            Sign in to use {app.label}
          </h2>
          <p className="text-white/60 text-sm leading-relaxed mb-6">
            {app.description ??
              "This part of XO requires a free account."}{" "}
            Sign in to continue.
          </p>

          <button
            type="button"
            onClick={() => grant("signed-in")}
            className="w-full px-5 py-3 rounded-2xl bg-lime-400 text-ink-900 font-semibold text-sm hover:brightness-105 active:brightness-95 transition-[filter]"
          >
            Sign in
          </button>

          <p className="text-white/40 text-[11px] mt-4 max-w-[26ch]">
            Don&apos;t have an account?{" "}
            <a
              href="https://app.xo.builders/signup"
              target="_blank"
              rel="noopener noreferrer"
              className="text-lime-300 hover:text-lime-200 underline underline-offset-2"
            >
              Get started
            </a>
            .
          </p>

          {devModeEnabled && (
            <div className="mt-5 px-3 py-2 rounded-lg bg-amber-400/10 border border-amber-400/30 text-amber-300 text-[10px] uppercase tracking-wider font-medium">
              Dev mode: button flips role only
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
