import type { ResolvedXOApp } from "@/lib/xo-app"

import { xoApp as home }      from "@/app/app"
import { xoApp as coworker }  from "@/app/coworker/app"
import { xoApp as swarm }     from "@/app/swarm/app"
import { xoApp as pricing }   from "@/app/pricing/app"
import { xoApp as customers } from "@/app/customers/app"
import { xoApp as demo }      from "@/app/demo/app"
import { xoApp as docs }      from "@/app/docs/app"
import { xoApp as talk }      from "@/app/talk-to-a-human/app"
import { xoApp as about }     from "@/app/about/app"
import { xoApp as changelog } from "@/app/changelog/app"
import { xoApp as handbook }  from "@/app/handbook/app"
import { xoApp as settings }  from "@/app/settings/app"
import { xoApp as example }   from "@/app/example/app"
import { xoApp as apiDemo }   from "@/app/api-demo/app"
import { xoApp as htmlDemo }  from "@/app/html-demo/app"
import { xoApp as ask }       from "@/app/ask/app"
import { xoApp as signup }    from "@/app/signup-external/app"
import { xoApp as setupWelcome }     from "@/app/setup-welcome/app"
import { xoApp as setupProfile }     from "@/app/setup-profile/app"
import { xoApp as setupWorkspace }   from "@/app/setup-workspace/app"
import { xoApp as setupIntegrations } from "@/app/setup-integrations/app"

/**
 * Home-screen icon registry. Each entry's source of truth is its
 * sibling `app/<route>/app.ts`. Order here is the home-screen order.
 *
 * Both Server Components (XOAppShell, route pages) and Client
 * Components (HomeScreen, DeviceFrame, AppIcon) import from this
 * file. It is safe to bundle in either tree because every imported
 * `xoApp` is plain data (no React, no JSX, no server-only modules).
 */
export const apps: readonly ResolvedXOApp[] = [
  home,
  coworker,
  swarm,
  pricing,
  customers,
  demo,
  docs,
  talk,
  about,
  changelog,
  handbook,
  settings,
  example,
  apiDemo,
  htmlDemo,
  ask,     // dock: true → appears as the 4th dock pin (Chat)
  signup,  // dock: false; reachable via the agent
  setupWelcome,
  setupProfile,
  setupWorkspace,
  setupIntegrations,
]

export function findApp(path: string): ResolvedXOApp | undefined {
  return apps.find(a => a.path === path)
}

export function dockApps(): ResolvedXOApp[] {
  return apps.filter(a => a.dock)
}
