import type { NextConfig } from "next"
import path from "node:path"

const nextConfig: NextConfig = {
  // cacheComponents intentionally left off (defaults to false).
  // Storybook 9 + Next 16 has cleanest compat when Cache Components is
  // disabled; turn this on later if we want PPR/streaming, but only
  // after auditing each page for "use cache" placement.
  output: "standalone",
  reactCompiler: false,
  devIndicators: {
    position: "bottom-right",
  },
  images: {
    remotePatterns: [
      // add allowed image hosts as we wire them up
    ],
  },
  // Pin Turbopack to this project's root so a stray lockfile higher up
  // the filesystem does not confuse workspace detection.
  turbopack: {
    root: path.resolve(__dirname),
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "100mb",
    },
  },
}

export default nextConfig
