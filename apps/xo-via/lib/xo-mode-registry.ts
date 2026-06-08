import type { ModeId, ResolvedMode } from "./xo-mode"

/**
 * Mode registry singleton.
 *
 * Per MODES_PLAN.md §5.2: modes can be added at runtime by any code
 * that imports this module. Built-in modes register from
 * `data/modes.ts` during module init. Plugins / A/B tests can call
 * `registry.register()` from their own bundles to add custom modes.
 *
 * `subscribe` / `list` are shaped for React's `useSyncExternalStore`:
 *
 *   - `subscribe(fn)` returns an unsubscribe function and fires `fn`
 *     after every register / unregister.
 *   - `list()` returns the same array reference until the registry
 *     mutates, so React's snapshot equality check passes between
 *     unrelated renders.
 *
 * Sort order: descending by `precedence` (default 0), then by
 * insertion order for ties.
 */

type Listener = () => void

class ModeRegistry {
  private modes = new Map<ModeId, ResolvedMode>()
  private listeners = new Set<Listener>()
  private cachedList: readonly ResolvedMode[] | null = null

  /** Add or replace a mode by id. Idempotent: re-registering with the
   *  same id replaces the previous definition (useful for HMR + tests). */
  register(mode: ResolvedMode): void {
    this.modes.set(mode.id, mode)
    this.invalidate()
  }

  /** Remove a mode. No-op if id is not registered. */
  unregister(id: ModeId): void {
    if (this.modes.delete(id)) this.invalidate()
  }

  has(id: ModeId): boolean {
    return this.modes.has(id)
  }

  get(id: ModeId): ResolvedMode | undefined {
    return this.modes.get(id)
  }

  /** Snapshot. Reference-stable until the registry changes. */
  list(): readonly ResolvedMode[] {
    if (this.cachedList === null) {
      this.cachedList = Array.from(this.modes.values()).sort((a, b) => {
        const pa = a.precedence ?? 0
        const pb = b.precedence ?? 0
        return pb - pa
      })
    }
    return this.cachedList
  }

  /** React-friendly subscription. Returns an unsubscribe function. */
  subscribe = (fn: Listener): (() => void) => {
    this.listeners.add(fn)
    return () => {
      this.listeners.delete(fn)
    }
  }

  private invalidate(): void {
    this.cachedList = null
    this.listeners.forEach(fn => {
      try {
        fn()
      } catch {
        // Listener exceptions must not break siblings.
      }
    })
  }
}

/** Singleton instance. */
export const modeRegistry = new ModeRegistry()
