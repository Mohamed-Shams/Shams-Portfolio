import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
const config: NextConfig = {
  output: "standalone",
  devIndicators: false,
  distDir:
    process.env.NODE_ENV === "development" ? ".next-dev" : ".next-production",
};
export default createNextIntlPlugin()(config);
