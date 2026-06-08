import type { CSSProperties, SVGProps } from "react";

/**
 * BrandIcon: single entry point for every provider/tool logo on the landing.
 *
 * Two render modes:
 *   1. Inline JSX for SVGs that use fill="currentColor". These need to be
 *      part of the DOM so they pick up text color. (claude-code, codex,
 *      openclaw, hermes, mcp, linear)
 *   2. <img src="/icons/X.svg"> for SVGs with their own brand colors:
 *      Slack's 4-color, Telegram blue, WhatsApp green, Claude beige, etc.
 *
 * Sources:
 *   - xo-docs/public/icons/{claude-code,codex,hermes,openclaw,mcp}.svg
 *   - xo-main/public/logos/{github,slack,telegram,whatsapp,claude,cursor,openai}.svg
 *   - Linear: hand-drawn here (no asset in either repo)
 */

export type IconName =
  // long-running agents
  | "openclaw"
  | "claude-code"
  | "codex"
  | "hermes"
  // tools / channels / clients
  | "linear"
  | "github"
  | "jira"
  | "clickup"
  | "slack"
  | "telegram"
  | "whatsapp"
  | "discord"
  | "teams"
  | "claude"
  | "chatgpt"
  | "cursor"
  | "mcp";

const COLORED: Record<string, string> = {
  github: "/icons/github.svg",
  slack: "/icons/slack.svg",
  telegram: "/icons/telegram.svg",
  whatsapp: "/icons/whatsapp.svg",
  discord: "/icons/discord.svg",
  teams: "/icons/teams.svg",
  clickup: "/icons/clickup.svg",
  claude: "/icons/claude.svg",
  chatgpt: "/icons/openai.svg",
  cursor: "/icons/cursor.svg",
};

export function BrandIcon({
  name,
  size = 24,
  className,
  style,
}: {
  name: IconName;
  size?: number;
  className?: string;
  style?: CSSProperties;
}) {
  // Mode 1: inline currentColor SVG
  if (name === "openclaw")
    return <OpenClawSvg width={size} height={size} className={className} style={style} />;
  if (name === "claude-code")
    return <ClaudeCodeSvg width={size} height={size} className={className} style={style} />;
  if (name === "codex")
    return <CodexSvg width={size} height={size} className={className} style={style} />;
  if (name === "hermes")
    return <HermesSvg width={size} height={size} className={className} style={style} />;
  if (name === "mcp")
    return <McpSvg width={size} height={size} className={className} style={style} />;
  if (name === "linear")
    return <LinearSvg width={size} height={size} className={className} style={style} />;
  if (name === "jira")
    return <JiraSvg width={size} height={size} className={className} style={style} />;

  // Mode 2: colored brand logo as img
  const src = COLORED[name];
  if (!src) return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      width={size}
      height={size}
      alt=""
      className={className}
      style={style}
      draggable={false}
    />
  );
}

/* ---------- inline currentColor SVGs ---------- */

function ClaudeCodeSvg(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="currentColor"
      fillRule="evenodd"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      {...props}
    >
      <path
        clipRule="evenodd"
        d="M20.998 10.949H24v3.102h-3v3.028h-1.487V20H18v-2.921h-1.487V20H15v-2.921H9V20H7.488v-2.921H6V20H4.487v-2.921H3V14.05H0V10.95h3V5h17.998v5.949zM6 10.949h1.488V8.102H6v2.847zm10.51 0H18V8.102h-1.49v2.847z"
      />
    </svg>
  );
}

function CodexSvg(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="currentColor"
      fillRule="evenodd"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      {...props}
    >
      <path
        clipRule="evenodd"
        d="M8.086.457a6.105 6.105 0 013.046-.415c1.333.153 2.521.72 3.564 1.7a.117.117 0 00.107.029c1.408-.346 2.762-.224 4.061.366l.063.03.154.076c1.357.703 2.33 1.77 2.918 3.198.278.679.418 1.388.421 2.126a5.655 5.655 0 01-.18 1.631.167.167 0 00.04.155 5.982 5.982 0 011.578 2.891c.385 1.901-.01 3.615-1.183 5.14l-.182.22a6.063 6.063 0 01-2.934 1.851.162.162 0 00-.108.102c-.255.736-.511 1.364-.987 1.992-1.199 1.582-2.962 2.462-4.948 2.451-1.583-.008-2.986-.587-4.21-1.736a.145.145 0 00-.14-.032c-.518.167-1.04.191-1.604.185a5.924 5.924 0 01-2.595-.622 6.058 6.058 0 01-2.146-1.781c-.203-.269-.404-.522-.551-.821a7.74 7.74 0 01-.495-1.283 6.11 6.11 0 01-.017-3.064.166.166 0 00.008-.074.115.115 0 00-.037-.064 5.958 5.958 0 01-1.38-2.202 5.196 5.196 0 01-.333-1.589 6.915 6.915 0 01.188-2.132c.45-1.484 1.309-2.648 2.577-3.493.282-.188.55-.334.802-.438.286-.12.573-.22.861-.304a.129.129 0 00.087-.087A6.016 6.016 0 015.635 2.31C6.315 1.464 7.132.846 8.086.457zm-.804 7.85a.848.848 0 00-1.473.842l1.694 2.965-1.688 2.848a.849.849 0 001.46.864l1.94-3.272a.849.849 0 00.007-.854l-1.94-3.393zm5.446 6.24a.849.849 0 000 1.695h4.848a.849.849 0 000-1.696h-4.848z"
      />
    </svg>
  );
}

function OpenClawSvg(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="currentColor"
      fillRule="evenodd"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      {...props}
    >
      <path d="M9.046 7.104a.527.527 0 110 1.055.527.527 0 010-1.055z" />
      <path d="M15.376 7.104a.528.528 0 110 1.056.528.528 0 010-1.056z" />
      <path
        clipRule="evenodd"
        d="M16.877 1.912c.58-.27 1.14-.323 1.616-.037a.317.317 0 01-.326.542c-.227-.136-.547-.153-1.022.068-.352.165-.765.45-1.234.866 2.683 1.17 4.4 3.5 5.148 5.921a6.421 6.421 0 00-.704.184c-.578.016-1.174.204-1.502.735-.338.55-.268 1.276.072 2.069l.005.012.007.014c.523 1.045 1.318 1.91 2.2 2.284-.912 3.274-3.44 6.144-5.972 6.988v2.109h-2.11v-2.11c-1.043.417-2.086.01-2.11 0v2.11h-2.11v-2.11c-2.531-.843-5.061-3.713-5.973-6.987.882-.373 1.678-1.238 2.2-2.284l.007-.014.006-.012c.34-.793.41-1.518.071-2.069-.327-.531-.923-.719-1.503-.735a6.409 6.409 0 00-.704-.183c.749-2.421 2.466-4.751 5.149-5.922-.47-.416-.88-.701-1.234-.866-.474-.221-.794-.204-1.021-.068a.318.318 0 01-.435-.109.317.317 0 01.109-.433c.476-.286 1.036-.233 1.615.037.49.229 1.031.628 1.621 1.182A9.924 9.924 0 0112 2.568c1.199 0 2.284.19 3.256.526.59-.554 1.13-.953 1.62-1.182zM8.835 6.577a1.266 1.266 0 100 2.532 1.266 1.266 0 000-2.532zm6.33 0a1.267 1.267 0 100 2.533 1.267 1.267 0 000-2.533z"
      />
      <path d="M.395 13.118c-.966-1.932-.163-3.863 2.41-3.365v-.001l.05.01c.084.018.17.038.26.06.033.009.067.017.1.027.084.022.168.048.255.076l.09.027c.528 0 .95.158 1.16.501.212.343.212.87-.105 1.61-.085.17-.178.333-.276.489l-.01.017a4.967 4.967 0 01-.62.791l-.019.02c-1.092 1.117-2.496 1.336-3.295-.262z" />
      <path d="M21.193 9.753c2.574-.5 3.378 1.433 2.411 3.365-.58 1.159-1.476 1.361-2.342.96l-.011-.005a2.419 2.419 0 01-.114-.056l-.019-.01a2.751 2.751 0 01-.115-.067l-.023-.014c-.035-.022-.071-.044-.106-.068l-.05-.035c-.55-.388-1.062-1.007-1.44-1.76-.276-.647-.311-1.132-.174-1.472.176-.439.636-.639 1.23-.639.032-.011.066-.02.099-.03.08-.026.16-.05.238-.072l.117-.03a5.502 5.502 0 01.3-.067z" />
    </svg>
  );
}

function HermesSvg(props: SVGProps<SVGSVGElement>) {
  // The original Hermes mark is extremely detailed (illustrated bust, ~100
  // path segments). Render at 24x24 it disappears into noise. We use a
  // simplified mercury-symbol mark that reads instantly at icon size and
  // still nods to the Hermes lineage.
  return (
    <svg
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      {...props}
    >
      {/* horns */}
      <path d="M7.5 4.5c.5 1.4 1.7 2.4 3 2.6" />
      <path d="M16.5 4.5c-.5 1.4-1.7 2.4-3 2.6" />
      {/* head circle */}
      <circle cx="12" cy="10" r="3.4" />
      {/* shaft */}
      <path d="M12 13.4v6.6" />
      {/* wings */}
      <path d="M9 16h6" />
      {/* base */}
      <path d="M10 20h4" />
    </svg>
  );
}

function McpSvg(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="currentColor"
      fillRule="evenodd"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      {...props}
    >
      <path d="M15.688 2.343a2.588 2.588 0 00-3.61 0l-9.626 9.44a.863.863 0 01-1.203 0 .823.823 0 010-1.18l9.626-9.44a4.313 4.313 0 016.016 0 4.116 4.116 0 011.204 3.54 4.3 4.3 0 013.609 1.18l.05.05a4.115 4.115 0 010 5.9l-8.706 8.537a.274.274 0 000 .393l1.788 1.754a.823.823 0 010 1.18.863.863 0 01-1.203 0l-1.788-1.753a1.92 1.92 0 010-2.754l8.706-8.538a2.47 2.47 0 000-3.54l-.05-.049a2.588 2.588 0 00-3.607-.003l-7.172 7.034-.002.002-.098.097a.863.863 0 01-1.204 0 .823.823 0 010-1.18l7.273-7.133a2.47 2.47 0 00-.003-3.537z" />
      <path d="M14.485 4.703a.823.823 0 000-1.18.863.863 0 00-1.204 0l-7.119 6.982a4.115 4.115 0 000 5.9 4.314 4.314 0 006.016 0l7.12-6.982a.823.823 0 000-1.18.863.863 0 00-1.204 0l-7.119 6.982a2.588 2.588 0 01-3.61 0 2.47 2.47 0 010-3.54l7.12-6.982z" />
    </svg>
  );
}

function JiraSvg(props: SVGProps<SVGSVGElement>) {
  // Jira mark approximation. Three stacked rounded chevrons in the
  // Atlassian/Jira blue palette (#2684FF, #0065FF, #0052CC). Not the
  // official asset, recognisable as Jira at icon size.
  return (
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden {...props}>
      <path
        d="M11.571 11.513H0a5.218 5.218 0 0 0 5.232 5.215h2.13v2.057A5.215 5.215 0 0 0 12.575 24V12.518a1.005 1.005 0 0 0-1.004-1.005Z"
        fill="#2684FF"
      />
      <path
        d="M17.286 5.78H5.71a5.215 5.215 0 0 0 5.21 5.215h2.137v2.058a5.215 5.215 0 0 0 5.21 5.21V6.785a1.005 1.005 0 0 0-.98-1.005Z"
        fill="#0065FF"
      />
      <path
        d="M22.995 0H11.42a5.215 5.215 0 0 0 5.215 5.215h2.135v2.057A5.215 5.215 0 0 0 24 12.483V1.005A1.005 1.005 0 0 0 22.995 0Z"
        fill="#0052CC"
      />
    </svg>
  );
}

function LinearSvg(props: SVGProps<SVGSVGElement>) {
  // Simplified Linear mark: three angled stripes forming an "L" arrow.
  return (
    <svg
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      {...props}
    >
      <path d="M3 14L10 21" opacity="0.5" />
      <path d="M3 9L15 21" opacity="0.75" />
      <path d="M3 4L20 21" />
      <path d="M9 3L21 15" opacity="0.75" />
      <path d="M14 3L21 10" opacity="0.5" />
    </svg>
  );
}
