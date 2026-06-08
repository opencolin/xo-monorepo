import { xoApp } from "./app"
import { XOAppShellIframe } from "@/components/XOAppShellIframe"

export const metadata = xoApp.metadata

export default function ExamplePage() {
  return <XOAppShellIframe app={xoApp} />
}
