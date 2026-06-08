import { promises as fs } from "node:fs"
import path from "node:path"

/**
 * Read an MDX source file from a content collection.
 *
 * Layout convention:
 *   content/<collection>/<slug>.mdx
 *
 * Slug values are validated to forbid directory traversal so a
 * malformed XOAppMdx manifest cannot escape the content/ root.
 *
 * Server-only: this module imports `node:fs`. Do not import from
 * Client Components. Pages with `kind: "mdx"` are Server Components,
 * so they call this directly.
 */
export async function loadMdxSource(
  collection: string,
  slug: string,
): Promise<string> {
  if (!isSafeSegment(collection) || !isSafeSegment(slug)) {
    throw new Error(`Invalid MDX path: ${collection}/${slug}`)
  }
  const filepath = path.join(
    process.cwd(),
    "content",
    collection,
    `${slug}.mdx`,
  )
  return fs.readFile(filepath, "utf-8")
}

function isSafeSegment(s: string): boolean {
  // Disallow path separators and parent-dir tokens. Allow alphanumeric,
  // dash, underscore, and dot inside the name (e.g. "getting-started").
  return /^[A-Za-z0-9_\-.]+$/.test(s) && !s.includes("..")
}
