import { xoApp } from "./app"
import { XOAppShell } from "@/components/XOAppShell"
import { LockSettingsGroup } from "@/components/LockSettingsGroup"
import { ModeSettingsGroup } from "@/components/ModeSettingsGroup"
import { RoleSettingsGroup } from "@/components/RoleSettingsGroup"

export const metadata = xoApp.metadata

export default function SettingsPage() {
  return (
    <XOAppShell app={xoApp} className="px-0 pt-3">
      <Group title="Account">
        <Row label="Sign in" value="Not signed in" trailing="›" />
      </Group>

      <ModeSettingsGroup />

      <RoleSettingsGroup />

      <Group title="Appearance">
        <Row label="Theme" value="Dark" trailing="›" />
        <Row label="Wallpaper" value="XO chevron" trailing="›" />
      </Group>

      <LockSettingsGroup />

      <Group title="About">
        <Row label="Version" value="0.0.1" />
        <Row label="License" value="XO Labs" />
      </Group>
    </XOAppShell>
  )
}

function Group({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="mt-2">
      <div className="px-5 mb-1 text-xs uppercase tracking-wider text-white/40">
        {title}
      </div>
      <div className="bg-phone-card2 mx-3 rounded-xl divide-y divide-phone-divider">
        {children}
      </div>
    </section>
  )
}

function Row({
  label,
  value,
  trailing,
}: {
  label: string
  value?: string
  trailing?: string
}) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <span className="text-white text-sm">{label}</span>
      <span className="text-white/50 text-sm flex items-center gap-1">
        {value}
        {trailing && <span className="text-white/30">{trailing}</span>}
      </span>
    </div>
  )
}
