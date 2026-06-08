import { defineConfig } from "vitest/config"
import react from "@vitejs/plugin-react"
import path from "node:path"

/**
 * Vitest config for xo-phone-os.
 *
 * Phase 0 of TESTING_PLAN.md: scaffolding only. Later phases reuse
 * this config as-is; the React plugin + happy-dom environment are
 * already set up for component tests (Phase 3+).
 */
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
  test: {
    globals: true,
    environment: "happy-dom",
    setupFiles: ["./tests/setup.ts"],
    include: [
      "tests/unit/**/*.test.{ts,tsx}",
      "tests/components/**/*.test.{ts,tsx}",
      "tests/integration/**/*.test.{ts,tsx}",
      "tests/api/**/*.test.{ts,tsx}",
    ],
    // Playwright e2e tests live in tests/e2e/ and run via a separate
    // command (Phase 6); explicitly exclude them so Vitest does not
    // try to run them.
    exclude: [
      "node_modules/**",
      ".next/**",
      "tests/e2e/**",
    ],
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      include: [
        "lib/**/*.{ts,tsx}",
        "context/**/*.{ts,tsx}",
        "components/**/*.{ts,tsx}",
        "app/api/**/*.{ts,tsx}",
      ],
      exclude: [
        "node_modules/**",
        ".next/**",
        "tests/**",
        "**/*.config.*",
        "**/*.d.ts",
        "lib/agent/server.ts",     // Claude SDK glue; integration-tested separately
        "lib/agent/transport.ts",  // ditto
      ],
    },
  },
})
