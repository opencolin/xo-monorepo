import { xoApp } from "./app"
import { XOAppShell } from "@/components/XOAppShell"

export const metadata = xoApp.metadata

export default function AboutPage() {
  return (
    <XOAppShell app={xoApp}>
      <p className="text-white/60 text-sm">
        This app&apos;s content is on the roadmap. See PLAN.md, phase 2.
      </p>
    </XOAppShell>
  )
}
