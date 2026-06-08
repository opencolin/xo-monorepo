import { RootProvider } from "fumadocs-ui/provider/next";
import type { Metadata } from "next";
import "./global.css";
import { Raleway } from "next/font/google";
import { appName, siteUrl } from "@/lib/shared";

const raleway = Raleway({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: appName,
    template: `%s | ${appName}`,
  },
  description:
    "Documentation for XO — deploy apps, connect AI agents, and scale with XO Launchpad, XO MCP Server, and XO Workspaces.",
  openGraph: {
    siteName: appName,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function Layout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={raleway.className} suppressHydrationWarning>
      <body className="flex flex-col min-h-screen">
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}
