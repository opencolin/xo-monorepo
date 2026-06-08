import { xoApp } from "./app"
import { XOAppShell } from "@/components/XOAppShell"
import { XOAppShellHtml } from "@/components/XOAppShellHtml"
import { loadHtmlSource } from "@/lib/html"

export const metadata = xoApp.metadata

/**
 * Resolves the HTML source for the kind: "html" app and hands it to
 * the client shell. Inline (`xoApp.html`) wins over file-backed
 * (`collection` + `slug`); if neither is set we render an error
 * inside the standard XOAppShell.
 */
export default async function HtmlDemoPage() {
  let html: string | null = null
  let error: string | null = null

  try {
    if (xoApp.html) {
      html = xoApp.html
    } else if (xoApp.collection && xoApp.slug) {
      html = await loadHtmlSource(xoApp.collection, xoApp.slug)
    } else {
      error =
        "html-kind manifest needs either 'html' (inline) " +
        "or both 'collection' and 'slug' (file-backed)."
    }
  } catch (e) {
    error = e instanceof Error ? e.message : String(e)
  }

  if (error || !html) {
    return (
      <XOAppShell app={xoApp}>
        <div className="bg-red-500/10 border border-red-500/30 text-red-200 text-sm rounded-xl p-3">
          Could not load HTML: {error}
        </div>
      </XOAppShell>
    )
  }

  return <XOAppShellHtml app={xoApp} html={html} />
}
