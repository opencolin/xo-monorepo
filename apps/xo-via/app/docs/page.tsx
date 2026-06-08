import { MDXRemote } from "next-mdx-remote/rsc"
import { xoApp } from "./app"
import { XOAppShell } from "@/components/XOAppShell"
import { mdxComponents } from "@/components/mdx-components"
import { loadMdxSource } from "@/lib/mdx"

export const metadata = xoApp.metadata

export default async function DocsPage() {
  let source: string | null = null
  let error: string | null = null
  try {
    source = await loadMdxSource(xoApp.collection, xoApp.slug)
  } catch (e) {
    error = e instanceof Error ? e.message : String(e)
  }

  return (
    <XOAppShell app={xoApp}>
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-200 text-sm rounded-xl p-3 mb-3">
          Could not load {xoApp.collection}/{xoApp.slug}: {error}
        </div>
      )}
      {source && (
        <MDXRemote
          source={source}
          components={mdxComponents}
          options={{ parseFrontmatter: true }}
        />
      )}
    </XOAppShell>
  )
}
