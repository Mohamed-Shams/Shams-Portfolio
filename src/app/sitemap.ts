import type { MetadataRoute } from "next";
import { projects } from "@/lib/content";
export default function sitemap(): MetadataRoute.Sitemap {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL || "https://mohamed-shams.netlify.app";
  return ["en", "ar"].flatMap((locale) => [
    { url: `${base}/${locale}` },
    ...projects.map((p) => ({ url: `${base}/${locale}/projects/${p.slug}` })),
  ]);
}
