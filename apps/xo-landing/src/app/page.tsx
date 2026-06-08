import { Hero } from "@/components/hero/hero";
import { WorkforceSection } from "@/components/workforce/workforce-section";
import { DemoJourneySection } from "@/components/demo-journey/demo-journey-section";
import { PricingSection } from "@/components/pricing/pricing-section";
import { FinalCTA } from "@/components/cta/final-cta";

/**
 * Page narrative, v2.
 *
 *   1. Hero       : Promise.
 *   2. Workforce  : Who it's for + role substitution math.
 *   3. Demo       : Apple-style scroll-driven walkthrough across 6
 *                   pinned product states (Land, Pick, Brain dump,
 *                   Auto-configure, Live, Fleet). Replaces the old
 *                   per-feature explainer sections in v1.
 *   4. Pricing    : Free + paid tiers (no daily cap on paid).
 *   5. CTA        : Start free.
 */
export default function Home() {
  return (
    <main className="relative">
      <Hero />
      <WorkforceSection />
      <DemoJourneySection />
      <PricingSection />
      <FinalCTA />
    </main>
  );
}
