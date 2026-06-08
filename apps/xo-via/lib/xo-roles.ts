/**
 * Role-based access control vocabulary + pure evaluators.
 *
 * v7.0 ships with a two-role taxonomy + dev-stub backend. Phase 7.1
 * swaps the dev stub for real Clerk auth without changing this
 * module: the evaluators are pure functions over a `Role[]`, and
 * the source of those roles is the RoleContext (dev: localStorage,
 * real: Clerk session).
 *
 * See MODES_PLAN.md §16 decision 6 + Phase 7.
 *
 * Stay pure: no React, no fetch, no localStorage, no server-only
 * modules.
 */

/**
 * v7.0 role taxonomy. Stable across the dev stub and real Clerk
 * integration. Adding a new role here is a deliberate vocabulary
 * change (touch every gate site).
 */
export type Role = "signed-in"

/** All known roles (used by the dev switcher UI). */
export const ALL_ROLES: readonly Role[] = ["signed-in"] as const

/** Convenience: the anonymous role set is the empty array. */
export const ANONYMOUS: readonly Role[] = [] as const

// ---------------------------------------------------------------------------
// Evaluators
// ---------------------------------------------------------------------------

/**
 * Does the user have a specific role?
 *
 * Accepts widened `string` because the AppDef + ModeDef
 * `requiredRoles` fields are typed `readonly string[]` (loose on
 * purpose, so plugins can declare future roles without a coordinated
 * type change). Strings not in the Role taxonomy simply never match.
 */
export function hasRole(currentRoles: readonly Role[], required: string): boolean {
  return (currentRoles as readonly string[]).includes(required)
}

/**
 * Does the user have at least one of the listed roles?
 *
 *   required = undefined  → always allowed (no role required)
 *   required = []         → always allowed (no role required)
 *   required = ["..."]    → must have that role
 *   required = ["a","b"]  → must have a OR b
 */
export function hasAnyRole(
  currentRoles: readonly Role[],
  required: readonly string[] | undefined,
): boolean {
  if (!required || required.length === 0) return true
  const current = currentRoles as readonly string[]
  return required.some(r => current.includes(r))
}

/**
 * Reverse of hasAnyRole: returns the roles the user is MISSING from
 * the required set. Used by gate UI to dispatch (Sign in vs Upgrade
 * vs Request access). Empty array means the user has access.
 */
export function missingRoles(
  currentRoles: readonly Role[],
  required: readonly string[] | undefined,
): readonly string[] {
  if (!required || required.length === 0) return []
  if (hasAnyRole(currentRoles, required)) return []
  return required
}

// ---------------------------------------------------------------------------
// Friendly labels
// ---------------------------------------------------------------------------

/** Human label for a role, shown in dev switcher + gate UI. */
export function roleLabel(role: Role): string {
  switch (role) {
    case "signed-in":
      return "Signed in"
  }
}

/** Plural form for a role list, e.g. "Sign in or upgrade". */
export function rolesLabel(roles: readonly Role[]): string {
  if (roles.length === 0) return "anyone"
  return roles.map(roleLabel).join(" or ")
}
