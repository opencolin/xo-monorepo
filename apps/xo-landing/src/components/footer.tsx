import { XOMark } from "./brand/xo-mark";

export function Footer() {
  return (
    <footer className="border-t border-white/5 bg-[var(--color-xo-charcoal)] py-14 text-sm text-white/60">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div>
          <div className="flex items-center gap-2 text-white">
            <XOMark size={28} />
            <span className="text-base font-semibold tracking-tight">XO</span>
          </div>
          <p className="mt-4 max-w-sm text-white/55">
            Workspaces for AI agents. The infrastructure layer underneath every
            coding agent, every research agent, every custom agent, so they
            can run.
          </p>
        </div>

        <FooterCol
          title="Product"
          links={[
            { label: "Workforce", href: "#workforce" },
            { label: "Demo", href: "#demo" },
            { label: "Pricing", href: "#pricing" },
          ]}
        />
        <FooterCol
          title="Build"
          links={[
            { label: "Documentation", href: "https://docs.xo.builders" },
            { label: "OpenClaw", href: "https://docs.xo.builders/agents/openclaw" },
            { label: "Claude Code", href: "https://docs.xo.builders/agents/claude-code" },
            { label: "Hermes", href: "https://docs.xo.builders/agents/hermes" },
            { label: "MCP Server", href: "https://docs.xo.builders/more/xo-mcp-server" },
          ]}
        />
        <FooterCol
          title="Company"
          links={[
            { label: "Mission", href: "https://xo.builders" },
            { label: "Blog", href: "https://xo.builders/blog" },
            { label: "Showcase", href: "https://xo.builders/showcase" },
            { label: "Contact", href: "https://xo.builders/contact" },
          ]}
        />
      </div>

      <div className="mx-auto mt-12 flex max-w-7xl flex-col gap-3 border-t border-white/5 px-6 pt-6 text-xs text-white/40 md:flex-row md:items-center md:justify-between">
        <span>© {new Date().getFullYear()} XO. The agentic economy is on the rise.</span>
        <span className="flex gap-5">
          <a href="https://xo.builders/terms" className="hover:text-white/70">
            Terms
          </a>
          <a href="https://xo.builders/privacy" className="hover:text-white/70">
            Privacy
          </a>
        </span>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div>
      <div className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-white/40">
        {title}
      </div>
      <ul className="space-y-2">
        {links.map((l) => (
          <li key={l.label}>
            <a href={l.href} className="transition hover:text-white">
              {l.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
