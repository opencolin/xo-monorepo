import { xoApp } from "./app"
import { XOAppShell } from "@/components/XOAppShell"
import { BeginSetupButton } from "@/components/setup/SetupTransitionButton"

export const metadata = xoApp.metadata

export default function SetupWelcomePage() {
  return (
    <XOAppShell app={xoApp}>
      <p className="text-white/70 text-sm leading-relaxed mb-4">
        XO is workspaces for AI agents. Setup takes about a minute
        and gets your first Coworker ready to run.
      </p>

      <ol className="space-y-3 mb-6">
        <Step n={1} title="Profile" detail="Name + handle" />
        <Step n={2} title="Workspace" detail="Pick a workspace name" />
        <Step n={3} title="Integrations" detail="Connect Linear, GitHub, Slack" />
      </ol>

      <BeginSetupButton />
    </XOAppShell>
  )
}

function Step({ n, title, detail }: { n: number; title: string; detail: string }) {
  return (
    <li className="flex items-start gap-3 bg-phone-card2 rounded-xl p-3">
      <span className="w-7 h-7 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 grid place-items-center text-sm font-semibold shrink-0">
        {n}
      </span>
      <div className="flex-1 min-w-0">
        <div className="text-white text-sm font-medium">{title}</div>
        <div className="text-white/50 text-xs mt-0.5">{detail}</div>
      </div>
    </li>
  )
}
