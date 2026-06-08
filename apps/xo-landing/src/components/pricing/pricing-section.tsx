"use client";

import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";
import { SectionHeader } from "@/components/stack/stack-section";

/**
 * PricingSection: six plans across two segments.
 * Source of truth: xo-room/content/docs/pricing.mdx.
 *
 * Individual: Starter $10 (with 14-day free trial), Pro $20, Max $100.
 * Business: Solo $50, Startup $500, Enterprise (custom).
 *
 * Live today. No roadmap-only tiers shown.
 */

type Tier = {
  name: string;
  price: string;
  cadence?: string;
  tagline: string;
  features: string[];
  cta: string;
  ctaHref: string;
  highlight?: boolean;
  free?: boolean;
};

const INDIVIDUAL: Tier[] = [
  {
    name: "Free",
    price: "$0",
    cadence: "/forever",
    tagline: "1 workspace · 4 hours of agent time / day",
    features: [
      "1 Medium workspace",
      "4 hours of agent time per day",
      "All agent tools & SDKs",
      "Basic launchpad templates",
      "Community support",
    ],
    cta: "Start free",
    ctaHref: "https://beta.xo.builders/",
    free: true,
  },
  {
    name: "Starter",
    price: "$10",
    cadence: "/mo",
    tagline: "1 Medium workspace · always on",
    features: [
      "1 Medium workspace (1 CPU / 4 GB burst)",
      "Unlimited agent time",
      "All agent tools & SDKs",
      "Basic launchpad templates",
      "Community support",
    ],
    cta: "Start with Starter",
    ctaHref: "https://beta.xo.builders/",
  },
  {
    name: "Pro",
    price: "$20",
    cadence: "/mo",
    tagline: "3 workspaces, 1 Large + 2 Medium",
    features: [
      "1 Large + 2 Medium workspaces",
      "Unlimited agent time",
      "Full launchpad library",
      "All agent tools & SDKs",
      "Community support",
    ],
    cta: "Start with Pro",
    ctaHref: "https://beta.xo.builders/",
    highlight: true,
  },
  {
    name: "Max",
    price: "$100",
    cadence: "/mo",
    tagline: "15 workspaces · dedicated VM 24/7",
    features: [
      "15 workspaces (Large/Medium mix)",
      "Unlimited agent time",
      "Dedicated VM running 24/7",
      "2 seats",
      "Priority support",
    ],
    cta: "Start with Max",
    ctaHref: "https://beta.xo.builders/",
  },
];

const BUSINESS: Tier[] = [
  {
    name: "Solo",
    price: "$50",
    cadence: "/mo",
    tagline: "10 Medium workspaces · 1 seat",
    features: [
      "10 Medium workspaces",
      "Unlimited agent time",
      "Standard availability",
      "Docs + community support",
      "Agent tools & SDKs",
    ],
    cta: "Start with Solo",
    ctaHref: "https://beta.xo.builders/",
  },
  {
    name: "Startup",
    price: "$500",
    cadence: "/mo",
    tagline: "100 workspaces · unlimited seats",
    features: [
      "100 workspaces (Large/Medium mix)",
      "Unlimited agent time",
      "Dedicated VM running 24/7",
      "Unlimited seats, no per-seat cost",
      "White-label · SSO/SAML",
      "Email + Slack support · 600 min on-call/mo",
    ],
    cta: "Start with Startup",
    ctaHref: "https://beta.xo.builders/",
    highlight: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    tagline: "Self-host, SOC 2, custom SLAs",
    features: [
      "Custom workspace allocation",
      "Unlimited agent time",
      "Dedicated VM 24/7 · 24/7 + SLA",
      "Unlimited seats · SSO/SAML",
      "Custom white-label",
      "Dedicated support + SLA",
    ],
    cta: "Contact sales",
    ctaHref: "https://xo.builders/contact",
  },
];

export function PricingSection() {
  const [tab, setTab] = useState<"individual" | "business">("individual");
  const tiers = tab === "individual" ? INDIVIDUAL : BUSINESS;

  return (
    <section
      id="pricing"
      className="relative isolate w-full overflow-hidden py-32"
    >
      <div className="haze pointer-events-none absolute inset-0 -z-10 opacity-50" />

      <div className="mx-auto max-w-7xl px-6">
        <SectionHeader
          align="center"
          eyebrow="Pricing"
          title={
            <>
              Plans that fit.
              <br />
              <span className="text-white/55">Undercut every alternative.</span>
            </>
          }
          subtitle="Free forever to get started, with 4 hours of agent time per day. Every paid plan removes the cap and undercuts every alternative on the market."
        />

        {/* Toggle */}
        <div className="mt-10 flex justify-center">
          <div className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.03] p-1 backdrop-blur">
            <TabButton
              active={tab === "individual"}
              onClick={() => setTab("individual")}
            >
              Individual
            </TabButton>
            <TabButton
              active={tab === "business"}
              onClick={() => setTab("business")}
            >
              Business
            </TabButton>
          </div>
        </div>

        {/* Tier grid. Column count tracks the active tab so 4-tier
            Individual fills cleanly and 3-tier Business doesn't leave
            a hanging slot. */}
        <div
          className={`relative mt-12 grid gap-5 sm:grid-cols-2 ${
            tiers.length === 4 ? "lg:grid-cols-4" : "lg:grid-cols-3"
          }`}
        >
          {/*
           * `mode="popLayout"` is correct for animating multiple children
           * at once when the parent key set changes (tab toggle here).
           * `mode="wait"` is for one-at-a-time swaps and produces the
           * "animate multiple children" warning when used with .map().
           */}
          <AnimatePresence mode="popLayout">
            {tiers.map((tier, i) => (
              <motion.div
                key={`${tab}-${tier.name}`}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ delay: i * 0.06, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              >
                <PricingCard {...tier} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* fine print */}
        <div className="mx-auto mt-10 max-w-3xl text-center text-[12px] text-white/45">
          Business plans bill on active concurrent workspaces. Pause workspaces
          to stop the meter. Hourly support add-ons available; see{" "}
          <a
            href="https://xo.builders/pricing"
            className="underline decoration-white/20 underline-offset-4 hover:text-white/70"
          >
            full pricing
          </a>
          .
        </div>
      </div>
    </section>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative rounded-full px-5 py-1.5 text-sm font-medium transition ${
        active ? "text-black" : "text-white/65 hover:text-white"
      }`}
    >
      {active && (
        <motion.span
          layoutId="pricing-tab-bg"
          className="absolute inset-0 rounded-full bg-[var(--color-xo-lime)]"
          transition={{ type: "spring", duration: 0.5 }}
        />
      )}
      <span className="relative z-10">{children}</span>
    </button>
  );
}

function PricingCard({
  name,
  price,
  cadence,
  tagline,
  features,
  cta,
  ctaHref,
  highlight,
  free,
}: Tier) {
  return (
    <div
      className={`group relative flex h-full flex-col overflow-hidden rounded-2xl border p-6 transition sm:p-6 lg:p-6 ${
        highlight
          ? "border-[var(--color-xo-lime)]/40 bg-gradient-to-br from-[var(--color-xo-lime)]/[0.08] to-transparent"
          : free
            ? "border-white/15 bg-white/[0.03]"
            : "border-white/8 bg-white/[0.02]"
      }`}
    >
      {/* glow on highlight */}
      {highlight && (
        <div
          aria-hidden
          className="absolute -right-16 -top-16 size-48 rounded-full opacity-50 blur-3xl"
          style={{
            background:
              "radial-gradient(closest-side, hsla(92,66%,53%,0.7), transparent 70%)",
          }}
        />
      )}

      {/* free flag */}
      {free && (
        <div className="relative mb-3 inline-flex w-fit items-center gap-1.5 rounded-full bg-white/[0.08] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white/85">
          <span className="size-1 rounded-full bg-white/85" />
          Free forever
        </div>
      )}

      {!free && highlight && (
        <div className="relative mb-3 inline-flex w-fit items-center gap-1.5 rounded-full bg-white/[0.04] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white/70">
          most popular
        </div>
      )}

      <div className="relative text-[12px] font-semibold uppercase tracking-[0.18em] text-white/45">
        {name}
      </div>

      <div className="relative mt-3 flex items-baseline gap-1">
        <span className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
          {price}
        </span>
        {cadence && (
          <span className="text-sm text-white/45 sm:text-base">{cadence}</span>
        )}
      </div>

      <div className="relative mt-2 text-[12.5px] text-white/65">{tagline}</div>

      <ul className="relative mt-5 flex-1 space-y-2 text-[13px] text-white/70">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2">
            <Check />
            <span>{f}</span>
          </li>
        ))}
      </ul>

      <a
        href={ctaHref}
        className={`relative mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
          highlight
            ? "bg-[var(--color-xo-lime)] text-black hover:bg-[hsl(92,66%,60%)]"
            : free
              ? "bg-white text-black hover:bg-white/90"
              : "border border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.06]"
        }`}
      >
        {cta}
      </a>
    </div>
  );
}

function Check() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      className="mt-0.5 shrink-0"
      aria-hidden
    >
      <circle cx="7" cy="7" r="6" stroke="hsla(92,66%,53%,0.4)" strokeWidth="1" />
      <path
        d="M4 7l2 2 4-4"
        stroke="var(--color-xo-lime)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
