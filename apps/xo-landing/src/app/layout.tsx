import type { Metadata, Viewport } from "next";
import { LenisProvider } from "@/components/lenis-provider";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import "./globals.css";

// Inter from Google Fonts is the production font (matches xo-main).
// Re-enable for production deploys:
//
//   import { Inter } from "next/font/google";
//   const inter = Inter({
//     subsets: ["latin"],
//     display: "swap",
//     variable: "--font-inter",
//     weight: ["400", "500", "600", "700", "800", "900"],
//   });
//
// We fall back to a system font stack here so builds work offline.
const inter = { variable: "" } as const;

export const metadata: Metadata = {
  metadataBase: new URL("https://xo.builders"),
  title: {
    default: "XO. Workspaces for AI agents",
    template: "%s · XO",
  },
  description:
    "XO is the infrastructure layer for AI agents. Pick an agent. Click once. Get a workspace where it lives, runs, remembers, and works alongside you.",
  applicationName: "XO",
  keywords: [
    "AI agents",
    "agent infrastructure",
    "AI workspace",
    "OpenClaw",
    "Claude Code",
    "Codex",
    "agent platform",
  ],
  authors: [{ name: "XO" }],
  openGraph: {
    type: "website",
    title: "XO. Workspaces for AI agents",
    description:
      "Pick an agent. Click once. Get a workspace where it lives, runs, remembers, and works alongside you.",
    url: "https://xo.builders",
    siteName: "XO",
    images: ["/og.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "XO. Workspaces for AI agents",
    description:
      "Pick an agent. Click once. Get a workspace where it lives, runs, remembers, and works alongside you.",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  themeColor: "#08090a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className="min-h-screen bg-[var(--color-xo-charcoal)] text-white antialiased">
        <LenisProvider>
          <Nav />
          {children}
          <Footer />
        </LenisProvider>
      </body>
    </html>
  );
}
