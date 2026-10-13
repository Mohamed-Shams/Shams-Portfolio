import { defineCloudflareConfig } from "@opennextjs/cloudflare";

export default {
  ...defineCloudflareConfig(),
  // Keep the Cloudflare-facing `npm run build` as the full OpenNext build
  // while avoiding recursive calls when OpenNext compiles the Next.js app.
  buildCommand: "npm run build:next",
};
