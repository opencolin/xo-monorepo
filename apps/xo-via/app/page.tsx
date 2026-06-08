import { xoApp } from "./app"

/**
 * When current === "/", DeviceFrame renders <HomeScreen/> instead of
 * the <AppView/>, so this element body is rarely shown. It exists so
 * Next builds an HTML page for "/" (SEO + direct loads).
 */
export const metadata = xoApp.metadata

export default function HomePage() {
  return (
    <div className="hidden" aria-hidden>
      XO: Workspaces for AI agents.
    </div>
  )
}
