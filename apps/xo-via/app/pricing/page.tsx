import { xoApp } from "./app"
import { XOAppShell } from "@/components/XOAppShell"

export const metadata = xoApp.metadata

export default function PricingPage() {
  return (
    <XOAppShell app={xoApp}>
      <Plan
        name="Free"
        price="$0"
        features={["1 workspace", "Community support", "All runtimes"]}
      />
      <Plan
        name="Pro"
        price="$20 / mo + usage"
        features={["Unlimited workspaces", "Team sharing", "MCP integrations"]}
        highlighted
      />
      <Plan
        name="Scale"
        price="Custom"
        features={["SSO + audit logs", "Dedicated infra", "Priority support"]}
      />

      <a
        href="https://app.xo.builders/signup"
        className="block mt-6 text-center bg-lime-400 text-ink-900 font-semibold py-3 rounded-xl"
      >
        Start free
      </a>
    </XOAppShell>
  )
}

function Plan({
  name,
  price,
  features,
  highlighted,
}: {
  name: string
  price: string
  features: string[]
  highlighted?: boolean
}) {
  return (
    <section
      className={[
        "rounded-xl p-4 mb-3 border",
        highlighted
          ? "border-lime-400 bg-lime-400/10"
          : "border-white/10 bg-phone-card2",
      ].join(" ")}
    >
      <div className="flex items-baseline justify-between mb-2">
        <h2 className="text-white font-semibold">{name}</h2>
        <span className="text-lime-300 text-sm">{price}</span>
      </div>
      <ul className="space-y-1 text-sm text-white/80">
        {features.map(f => (
          <li key={f}>{f}</li>
        ))}
      </ul>
    </section>
  )
}
