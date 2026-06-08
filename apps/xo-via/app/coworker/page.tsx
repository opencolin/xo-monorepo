import { xoApp } from "./app"
import { XOAppShell } from "@/components/XOAppShell"

export const metadata = xoApp.metadata

export default function CoworkerPage() {
  return (
    <XOAppShell app={xoApp}>
      <Section title="Runs everywhere">
        Same image on your laptop, in Coder, in Docker, in Vercel Sandbox, or
        any container host. The trust boundary follows the workspace.
      </Section>
      <Section title="One image, full stack">
        Runtime, memory, files, tools, sessions, chat. Each Coworker is a
        complete agent operating environment in a single portable artifact.
      </Section>
      <Section title="Bring your runtime">
        Brokers OpenClaw (OSS), Claude Code, or Codex underneath one API.
        Switch runtimes per session.
      </Section>

      <a
        href="https://app.xo.builders/signup"
        className="block mt-6 text-center bg-lime-400 text-ink-900 font-semibold py-3 rounded-xl"
      >
        Start a Coworker
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
