import { promises as fs } from "node:fs"
import path from "node:path"

/**
 * Read an HTML source file from a content collection.
 *
 * Layout convention:
 *   content/<collection>/<slug>.html
 *
 * Same path-safety rules as `loadMdxSource`: alphanumerics, dash,
 * underscore, dot only; no `..`. A malformed XOAppHtml manifest can
 * not escape the content/ root.
 *
 * Server-only: imports `node:fs`. Pages with `kind: "html"` are
 * Server Components, so they call this directly.
 */
export async function loadHtmlSource(
  collection: string,
  slug: string,
): Promise<string> {
  if (!isSafeSegment(collection) || !isSafeSegment(slug)) {
    throw new Error(`Invalid HTML path: ${collection}/${slug}`)
  }
  const filepath = path.join(
    process.cwd(),
    "content",
    collection,
    `${slug}.html`,
  )
  return fs.readFile(filepath, "utf-8")
}

function isSafeSegment(s: string): boolean {
  return /^[A-Za-z0-9_\-.]+$/.test(s) && !s.includes("..")
}
