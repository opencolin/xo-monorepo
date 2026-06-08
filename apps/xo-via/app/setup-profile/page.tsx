import { xoApp } from "./app"
import { XOAppShell } from "@/components/XOAppShell"
import { SetupContinueLink } from "@/components/setup/SetupTransitionButton"

export const metadata = xoApp.metadata

export default function SetupProfilePage() {
  return (
    <XOAppShell app={xoApp}>
      <div className="space-y-3 mb-6">
        <Field label="Name" placeholder="e.g. Suraj" />
        <Field label="Handle" placeholder="e.g. @suraj" />
      </div>
      <SetupContinueLink path="/setup-workspace" label="Continue" />
    </XOAppShell>
  )
}

function Field({ label, placeholder }: { label: string; placeholder: string }) {
  return (
    <label className="block">
      <span className="block text-white/60 text-xs uppercase tracking-wider mb-1">
        {label}
      </span>
      <input
        type="text"
        placeholder={placeholder}
        className="w-full px-3 py-2.5 rounded-xl bg-phone-card2 border border-white/10 text-white text-sm placeholder:text-white/30 outline-none focus:border-amber-400/60"
      />
    </label>
  )
}
