import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
const config: NextConfig = {
  output: "standalone",
  devIndicators: false,
  // OpenNext's Cloudflare adapter reads .next/server and .next/standalone.
  // Keep the development cache independent from the production output.
  distDir: process.env.NODE_ENV === "development" ? ".next-dev" : ".next",
};
export default createNextIntlPlugin()(config);
