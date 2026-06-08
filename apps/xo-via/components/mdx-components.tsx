import * as React from "react"

/**
 * Component map injected into the MDX renderer for kind: "mdx" pages.
 * Each entry overrides a default HTML element with phone-OS-themed
 * markup (dark surface, lime accents, monospace code, etc).
 *
 * To add a custom MDX shortcode, add an entry here keyed by the
 * uppercased name; authors then write `<Callout>` in their .mdx.
 *
 * Typed loosely as a record so we do not depend on `mdx/types`
 * (not bundled with next-mdx-remote). MDXRemote validates the shape
 * at the call site.
 */
type P<T extends keyof React.JSX.IntrinsicElements> = React.ComponentPropsWithoutRef<T>

// MDXRemote accepts a record of React components keyed by tag name.
// We type each entry individually below; the export is intentionally
// loose so MDXRemote's component map prop accepts it without conflicts.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const mdxComponents: Record<string, React.ComponentType<any>> = {
  h1: (props: P<"h1">) => (
    <h1
      className="text-2xl font-semibold tracking-tight text-white mb-3"
      {...props}
    />
  ),
  h2: (props: P<"h2">) => (
    <h2
      className="text-xl font-semibold tracking-tight text-white mt-6 mb-2"
      {...props}
    />
  ),
  h3: (props: P<"h3">) => (
    <h3
      className="text-base font-semibold text-white mt-4 mb-2"
      {...props}
    />
  ),
  p: (props: P<"p">) => (
    <p className="text-white/70 text-sm leading-relaxed mb-3" {...props} />
  ),
  a: ({ href, children, ...rest }: P<"a">) => {
    const isExternal = typeof href === "string" && /^https?:\/\//.test(href)
    return (
      <a
        href={href}
        className="text-lime-300 hover:text-lime-200 underline underline-offset-2"
        {...(isExternal
          ? { target: "_blank", rel: "noopener noreferrer" }
          : {})}
        {...rest}
      >
        {children}
      </a>
    )
  },
  strong: (props: P<"strong">) => (
    <strong className="font-semibold text-white" {...props} />
  ),
  em: (props: P<"em">) => <em className="italic text-white/90" {...props} />,
  ul: (props: P<"ul">) => (
    <ul
      className="list-disc pl-5 space-y-1 text-white/70 text-sm mb-3"
      {...props}
    />
  ),
  ol: (props: P<"ol">) => (
    <ol
      className="list-decimal pl-5 space-y-1 text-white/70 text-sm mb-3"
      {...props}
    />
  ),
  li: (props: P<"li">) => <li className="text-white/70" {...props} />,
  hr: () => <hr className="my-6 border-phone-divider" />,
  blockquote: (props: P<"blockquote">) => (
    <blockquote
      className="border-l-2 border-lime-400 pl-3 text-white/60 text-sm italic mb-3"
      {...props}
    />
  ),
  code: (props: P<"code">) => (
    <code
      className="bg-phone-card2 px-1.5 py-0.5 rounded text-[11px] font-mono text-lime-200"
      {...props}
    />
  ),
  pre: (props: P<"pre">) => (
    <pre
      className="bg-phone-card2 p-3 rounded-xl text-[11px] font-mono text-white/80 overflow-auto mb-3"
      {...props}
    />
  ),
  table: (props: P<"table">) => (
    <div className="overflow-x-auto mb-3">
      <table
        className="w-full text-left text-xs text-white/70 border-collapse"
        {...props}
      />
    </div>
  ),
  thead: (props: P<"thead">) => <thead {...props} />,
  tbody: (props: P<"tbody">) => <tbody {...props} />,
  tr: (props: P<"tr">) => <tr {...props} />,
  th: (props: P<"th">) => (
    <th
      className="border-b border-phone-divider px-2 py-1 font-semibold text-white"
      {...props}
    />
  ),
  td: (props: P<"td">) => (
    <td className="border-b border-phone-divider/60 px-2 py-1" {...props} />
  ),
}
