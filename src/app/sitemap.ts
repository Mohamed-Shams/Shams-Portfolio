import type { MetadataRoute } from "next";
import { projects } from "@/lib/content";
import { absolute, getAlternates, seoConfig } from "@/seo/config";
export default function sitemap(): MetadataRoute.Sitemap {
  return (["en", "ar"] as const).flatMap((locale) => [
    { url: absolute(`/${locale}`), lastModified: seoConfig.launchLastmod,
      alternates: { languages: getAlternates(locale).languages } },
    ...projects.map((p) => ({ url: absolute(`/${locale}/projects/${p.slug}`),
      lastModified: seoConfig.launchLastmod,
      alternates: { languages: getAlternates(locale, p.slug).languages } })),
    // The /notes indexes remain noindex drafts until reviewed articles exist.
    // Excluding noindex drafts prevents intentional Search Console exclusions.
  ]);
}
