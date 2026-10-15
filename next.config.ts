import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import createMDX from "@next/mdx";
const withMDX = createMDX({});
const config: NextConfig = {
  output: "standalone",
  devIndicators: false,
  // Let middleware own canonical URL redirects so they return 301 rather
  // than Next.js's default trailing-slash 308.
  skipTrailingSlashRedirect: true,
  // OpenNext's Cloudflare adapter reads .next/server and .next/standalone.
  // Keep the development cache independent from the production output.
  distDir: process.env.NODE_ENV === "development" ? ".next-dev" : ".next",
  pageExtensions: ["ts", "tsx", "md", "mdx"],
  async headers() {
    return [{ source: "/:path*", headers: [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
    ] }];
  },
};
export default createNextIntlPlugin()(withMDX(config));
