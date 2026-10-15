import { credentials, projects } from "@/lib/content";
import { faqs } from "./content";
import { absolute, localePath, projectSeo, seoConfig } from "./config";
import { projectKeywords, type SeoLocale, type SeoProjectSlug } from "./keywords";
import { videos } from "@/components/YoutubeShowcase";

type JsonLd = Record<string, unknown>;
export function JsonLdScript({ data }: { data: JsonLd | JsonLd[] }) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
export function personSchema(locale: SeoLocale): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": absolute("/#person"),
    name: seoConfig.name,
    alternateName: ["Mohamed Shams", "Mohamed A. Shams", seoConfig.arabicName],
    jobTitle: seoConfig.role,
    description: locale === "ar"
      ? "محمد أحمد شمس مهندس أنظمة يعمل على حلول Ignition SCADA وإنترنت الأشياء الصناعي في مصر والسعودية."
      : "Mohamed Ahmed Shams, Systems Engineer specializing in Ignition SCADA and Industrial IoT projects in Egypt and Saudi Arabia.",
    url: absolute(localePath(locale)),
    image: absolute("/assets/portrait.webp"),
    worksFor: { "@type": "Organization", name: seoConfig.organization },
    alumniOf: { "@type": "CollegeOrUniversity", name: "Menoufia University" },
    knowsAbout: [
      "Ignition SCADA", "Industrial IoT", "OPC UA", "MQTT",
      "AVEVA", "WinCC", "Python", "InfluxDB", "Oracle", "MSSQL",
    ],
    hasCredential: credentials.map(([title, , issuer]) => ({
      "@type": "EducationalOccupationalCredential",
      name: title,
      credentialCategory: /Certified|Practitioner/.test(title)
        ? "Professional certification" : "Vendor training",
      recognizedBy: { "@type": "Organization", name: issuer },
    })),
    sameAs: [seoConfig.profiles.linkedin, seoConfig.profiles.youtube],
  };
}
export function breadcrumbs(locale: SeoLocale, slug?: SeoProjectSlug): JsonLd {
  const home = { "@type": "ListItem", position: 1,
    name: locale === "ar" ? "الرئيسية" : "Home", item: absolute(localePath(locale)) };
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: slug
      ? [home, { "@type": "ListItem", position: 2,
          name: projects.find(p => p.slug === slug)?.title[locale],
          item: absolute(localePath(locale, slug)) }]
      : [home],
  };
}
export function notesBreadcrumbs(locale: SeoLocale): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: locale === "ar" ? "الرئيسية" : "Home",
        item: absolute(localePath(locale)) },
      { "@type": "ListItem", position: 2,
        name: locale === "ar" ? "ملاحظات تقنية" : "Engineering Notes",
        item: absolute(`/${locale}/notes`) },
    ],
  };
}
export function homeSchema(locale: SeoLocale): JsonLd[] {
  const person = personSchema(locale);
  const homeUrl = absolute(localePath(locale));
  return [
    person,
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": absolute("/#website"),
      name: seoConfig.name,
      url: seoConfig.origin,
      inLanguage: ["en", "ar"],
      publisher: { "@id": absolute("/#person") },
    },
    {
      "@context": "https://schema.org",
      "@type": "ProfilePage",
      "@id": homeUrl + "#profile",
      url: homeUrl,
      inLanguage: locale,
      mainEntity: { "@id": absolute("/#person") },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "@id": homeUrl + "#faq",
      mainEntity: faqs[locale].map(({ question, answer }) => ({
        "@type": "Question", name: question,
        acceptedAnswer: { "@type": "Answer", text: answer },
      })),
    },
    ...videos.map(video => ({
      "@context": "https://schema.org",
      "@type": "VideoObject",
      "@id": `https://www.youtube.com/watch?v=${video.id}`,
      name: video.title,
      description: video.description[locale],
      thumbnailUrl: absolute(`/assets/youtube/${video.id}.jpg`),
      uploadDate: video.uploadDate,
      embedUrl: `https://www.youtube-nocookie.com/embed/${video.id}`,
      // The YouTube watch URL is not a direct video file; contentUrl omitted.
    })),
  ];
}
export function projectSchema(locale: SeoLocale, slug: SeoProjectSlug): JsonLd[] {
  const p = projects.find(project => project.slug === slug)!;
  const url = absolute(localePath(locale, slug));
  return [
    {
      "@context": "https://schema.org",
      "@type": "CreativeWork",
      "@id": url + "#project",
      url,
      inLanguage: locale,
      headline: p.title[locale],
      description: projectSeo[slug][locale].description,
      author: { "@id": absolute("/#person"), "@type": "Person", name: seoConfig.name },
      about: { "@type": "Thing", name: projectKeywords[slug][locale].primary },
      keywords: [projectKeywords[slug][locale].primary, ...projectKeywords[slug][locale].secondary],
      image: absolute(`/assets/og/${slug}.png`),
      // Project timeline is not the publication/modification date.
    },
    breadcrumbs(locale, slug),
  ];
}
export function HomeStructuredData({ locale }: { locale: SeoLocale }) {
  return <JsonLdScript data={homeSchema(locale)} />;
}
export function ProjectStructuredData({ locale, slug }: { locale: SeoLocale; slug: SeoProjectSlug }) {
  return <JsonLdScript data={projectSchema(locale, slug)} />;
}
