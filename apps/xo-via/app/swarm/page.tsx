import { xoApp } from "./app"
import { XOAppShell } from "@/components/XOAppShell"

export const metadata = xoApp.metadata

export default function SwarmPage() {
  return (
    <XOAppShell app={xoApp}>
      <Section title="Provider-agnostic launchpad">
        Coder today, Docker and Vercel Sandbox next. Same launchpad model
        across hosts.
      </Section>
      <Section title="Identity + billing built in">
        Clerk auth, project + share ledger, S3, Postgres, usage telemetry.
      </Section>
      <Section title="Tool integrations">
        Linear, GitHub, Slack, WhatsApp, custom MCP servers. Configure once,
        run everywhere.
      </Section>
      <Section title="Templates">
        Eliza, Gaia, n8n, or custom characters. Spin up a fleet from one
        definition.
      </Section>

      <a
        href="https://app.xo.builders/signup"
        className="block mt-6 text-center bg-lime-400 text-ink-900 font-semibold py-3 rounded-xl"
      >
        Launch on Swarm
      </a>
    </XOAppShell>
  )
}

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="bg-phone-card2 rounded-xl p-4 mb-3">
      <h2 className="text-white text-base font-semibold mb-1">{title}</h2>
      <p className="text-white/70 text-sm leading-relaxed">{children}</p>
    </section>
  )
}
