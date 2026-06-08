import { xoApp } from "./app"
import { XOAppShell } from "@/components/XOAppShell"
import { FinishSetupButton } from "@/components/setup/SetupTransitionButton"

export const metadata = xoApp.metadata

export default function SetupIntegrationsPage() {
  return (
    <XOAppShell app={xoApp}>
      <p className="text-white/60 text-xs mb-3">
        Pick what you use. Each one can be wired later from Settings.
      </p>
      <div className="space-y-2 mb-6">
        <IntegrationRow label="Linear" detail="Issues, projects, cycles" />
        <IntegrationRow label="GitHub" detail="Repos, PRs, issues" />
        <IntegrationRow label="Slack" detail="Channels, DMs" />
      </div>
      <FinishSetupButton />
    </XOAppShell>
  )
}

function IntegrationRow({ label, detail }: { label: string; detail: string }) {
  return (
    <label className="flex items-center gap-3 bg-phone-card2 rounded-xl p-3 cursor-pointer">
      <input
        type="checkbox"
        className="w-5 h-5 rounded accent-amber-400"
      />
      <div className="flex-1 min-w-0">
        <div className="text-white text-sm font-medium">{label}</div>
        <div className="text-white/45 text-[11px]">{detail}</div>
      </div>
    </label>
  )
}
