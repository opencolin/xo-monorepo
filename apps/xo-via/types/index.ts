import type { ReactNode } from "react"
import type { ResolvedXOApp } from "@/lib/xo-app"

/**
 * App definition has moved to `lib/xo-app.ts` (XOApp / ResolvedXOApp).
 * Re-exported here for any legacy import paths that still reach for it.
 */
export type AppDef = ResolvedXOApp

export interface PhoneStatus {
  time: string
  charge: number // 0..1
  wifi: boolean
}

export interface AppViewProps {
  element: ReactNode
  app: ResolvedXOApp
}
