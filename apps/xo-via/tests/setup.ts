/**
 * Vitest setup: extends `expect` with the jest-dom matchers
 * (`toBeInTheDocument`, `toHaveAttribute`, etc.) for component
 * tests starting in Phase 3.
 *
 * Pure-logic tests (Phase 1) do not depend on jest-dom but loading
 * it globally is cheap and removes per-file boilerplate.
 */
import "@testing-library/jest-dom/vitest"
