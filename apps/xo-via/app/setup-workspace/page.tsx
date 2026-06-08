import { xoApp } from "./app"
import { XOAppShell } from "@/components/XOAppShell"
import { SetupContinueLink } from "@/components/setup/SetupTransitionButton"

export const metadata = xoApp.metadata

export default function SetupWorkspacePage() {
  return (
    <XOAppShell app={xoApp}>
      <div className="space-y-3 mb-6">
        <label className="block">
          <span className="block text-white/60 text-xs uppercase tracking-wider mb-1">
            Workspace name
          </span>
          <input
            type="text"
            placeholder="e.g. xo-labs"
            className="w-full px-3 py-2.5 rounded-xl bg-phone-card2 border border-white/10 text-white text-sm placeholder:text-white/30 outline-none focus:border-amber-400/60"
          />
        </label>
        <p className="text-white/40 text-[11px] leading-relaxed">
          Your first Coworker will live here. You can add more workspaces later.
        </p>
      </div>
      <SetupContinueLink path="/setup-integrations" label="Continue" />
    </XOAppShell>
  )
}
