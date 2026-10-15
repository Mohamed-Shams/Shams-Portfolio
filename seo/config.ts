import type { Metadata } from "next";
import { homeKeywords, projectKeywords, type SeoLocale, type SeoProjectSlug } from "./keywords";
import { projects } from "@/lib/content";

export const seoConfig = {
  origin: "https://shams-portfolio.mshams0174.workers.dev",
  name: "Mohamed Ahmed Shams",
  arabicName: "محمد أحمد شمس",
  role: "Systems Engineer",
  organization: "pulse by solutions",
  country: ["Egypt", "Saudi Arabia"],
  profiles: {
    linkedin: "https://www.linkedin.com/in/mashams",
    youtube: "https://www.youtube.com/@MAShams1",
  },
  defaultLocale: "en" as SeoLocale,
  launchLastmod: "2026-10-15", // TODO: replace with publication dates from Git on updates.
  siteImage: "/assets/og/home.png",
  analyticsToken: process.env.NEXT_PUBLIC_CF_WEB_ANALYTICS_TOKEN || "",
} as const;

export const homeSeo = {
  en: {
    title: "Mohamed Ahmed Shams | Ignition SCADA & IIoT Engineer",
    description: "Systems Engineer building Ignition SCADA, OPC UA and MQTT solutions for water, environment and industrial sectors across Egypt and Saudi Arabia.",
  },
  ar: {
    title: "محمد أحمد شمس | مهندس سكادا وإنترنت الأشياء الصناعي",
    description: "محمد أحمد شمس مهندس أنظمة متخصص في Ignition SCADA وربط البيانات الصناعية. يعمل في مشروعات المياه والبيئة والصناعة في مصر والسعودية.",
  },
} as const;

/** Shortened where necessary to respect 60-character title length limit. */
export const projectSeo: Record<SeoProjectSlug, Record<SeoLocale, { title: string; description: string }>> = {
  "dohler-cloudy-line": {
    en: { title: "Döhler | Ignition SCADA | Mohamed Ahmed Shams", description: "Ignition SCADA and MSSQL HMI for a beverage production line in Egypt, supporting monitoring of cloudy juice concentrate processes." },
    ar: { title: "خط عصائر دولر | سكادا Ignition | محمد أحمد شمس", description: "تطوير واجهات تشغيل ومراقبة لخط إنتاج مركزات العصير بمصر باستخدام Ignition SCADA وMSSQL لخدمة قطاع الصناعات الغذائية." },
  },
  "ncec-air-quality": {
    en: { title: "Air Quality SCADA | Mohamed Ahmed Shams", description: "Air quality station monitoring in Saudi Arabia: configuration, platform validation and MSSQL data support using Stream IIoT." },
    ar: { title: "مراقبة جودة الهواء بالسعودية | محمد أحمد شمس", description: "دعم ربط بيانات محطات جودة الهواء والتحقق من منصة Stream IIoT وقواعد MSSQL لمشروع مراقبة البيئة في السعودية." },
  },
  "ground-water": {
    en: { title: "Groundwater Monitoring | Mohamed Ahmed Shams", description: "Ignition groundwater monitoring in Saudi Arabia with Oracle and InfluxDB, supporting real-time water-use analysis across wells." },
    ar: { title: "مراقبة الآبار الجوفية | محمد أحمد شمس", description: "منصة لمتابعة بيانات الآبار واستهلاك المياه في السعودية باستخدام Ignition وOracle وInfluxDB لدعم المراقبة اللحظية." },
  },
  "modon-poc": {
    en: { title: "Smart City IIoT POC | Mohamed Ahmed Shams", description: "Industrial city monitoring proof of concept in Saudi Arabia using Ignition and MSSQL to visualize connected sensor data." },
    ar: { title: "إنترنت الأشياء بمدن الصناعية | محمد أحمد شمس", description: "إثبات مفهوم لمتابعة حساسات المدن الصناعية في السعودية باستخدام Ignition وMSSQL لعرض بيانات التشغيل على منصة موحدة." },
  },
  "drilling-equipment": {
    en: { title: "Drilling Asset Tracking | Mohamed Ahmed Shams", description: "Ignition-based drilling asset monitoring in Saudi Arabia using Oracle and InfluxDB for equipment oversight and governance." },
    ar: { title: "تتبع معدات الحفر بالسعودية | محمد أحمد شمس", description: "منصة حوكمة ومتابعة معدات حفر الآبار في السعودية باستخدام Ignition وOracle وInfluxDB لدعم إدارة الأصول." },
  },
  "water-network": {
    en: { title: "DMA Water Network | Mohamed Ahmed Shams", description: "SOFREL RTU testing and commissioning for water network improvement in Madinah, Yanbu and Tabuk, Saudi Arabia." },
    ar: { title: "مراقبة شبكات المياه DMA | محمد أحمد شمس", description: "اختبارات وتشغيل وحدات SOFREL RTU ضمن تحسين شبكات المياه في المدينة المنورة وينبع وتبوك بالسعودية." },
  },
  "modon-testing": {
    en: { title: "MODON App Testing | Mohamed Ahmed Shams", description: "Manual QA for industrial web and mobile journeys in Saudi Arabia: regression, compatibility and acceptance testing with Azure DevOps." },
    ar: { title: "اختبار تطبيقات مدن | محمد أحمد شمس", description: "اختبارات قبول وتوافق وانحدار لمنصة مدن وتطبيق الهاتف في السعودية، مع توثيق الجودة باستخدام Azure DevOps." },
  },
};

export function absolute(path: string): string {
  return seoConfig.origin + (path.startsWith("/") ? path : "/" + path);
}
export function localePath(locale: SeoLocale, slug?: string): string {
  return `/${locale}${slug ? "/projects/" + slug : ""}`;
}
export function getAlternates(locale: SeoLocale, slug?: string) {
  return {
    canonical: absolute(localePath(locale, slug)),
    languages: {
      en: absolute(localePath("en", slug)),
      ar: absolute(localePath("ar", slug)),
      "x-default": absolute(localePath("en", slug)),
    },
  };
}
export function makeMetadata(locale: SeoLocale, slug?: SeoProjectSlug): Metadata {
  const entry = slug ? projectSeo[slug][locale] : homeSeo[locale];
  const title = entry.title;
  const description = entry.description;
  const image = absolute(slug ? `/assets/og/${slug}.png` : seoConfig.siteImage);
  const alt = slug
    ? `${projects.find(p => p.slug === slug)?.title[locale]} — ${seoConfig.name}, project overview`
    : `${seoConfig.name} — Systems Engineer, Ignition SCADA and Industrial IoT`;
  return {
    metadataBase: new URL(seoConfig.origin),
    title: { absolute: title },
    description,
    alternates: getAlternates(locale, slug),
    robots: { index: true, follow: true },
    openGraph: {
      type: slug ? "article" : "profile",
      title,
      description,
      url: absolute(localePath(locale, slug)),
      siteName: seoConfig.name,
      locale: locale === "ar" ? "ar_EG" : "en_US",
      alternateLocale: [locale === "ar" ? "en_US" : "ar_EG"],
      images: [{ url: image, width: 1200, height: 630, alt }],
    },
    twitter: { card: "summary_large_image", title, description, images: [image] },
    other: { "content-language": locale },
  };
}
export const notesSeo = {
  en: { title: "Industrial SCADA Notes | Mohamed Ahmed Shams", description: "Planned technical notes on Ignition SCADA, Siemens PLC tags, Node-RED and Industrial IoT integration by Mohamed Ahmed Shams." },
  ar: { title: "ملاحظات تقنية عن سكادا | محمد أحمد شمس", description: "موضوعات تقنية قيد الإعداد عن Ignition SCADA وتكامل PLC وNode-RED وإنترنت الأشياء الصناعي من محمد أحمد شمس." },
};
export function makeNotesMetadata(locale: SeoLocale): Metadata {
  const details = notesSeo[locale];
  const url = absolute(`/${locale}/notes`);
  return {
    metadataBase: new URL(seoConfig.origin),
    title: { absolute: details.title },
    description: details.description,
    robots: { index: false, follow: true },
    alternates: {
      canonical: url,
      languages: { en: absolute("/en/notes"), ar: absolute("/ar/notes"),
        "x-default": absolute("/en/notes") },
    },
    openGraph: {
      type: "website", title: details.title, description: details.description,
      url, locale: locale === "ar" ? "ar_EG" : "en_US",
      alternateLocale: [locale === "ar" ? "en_US" : "ar_EG"],
      images: [{ url: absolute(seoConfig.siteImage), width: 1200, height: 630,
        alt: "Mohamed Ahmed Shams — industrial SCADA engineering notes" }],
    },
    twitter: { card: "summary_large_image", title: details.title,
      description: details.description, images: [absolute(seoConfig.siteImage)] },
  };
}
export const noteIdeas = [
  { slug: "siemens-plc-tags-ignition-json", en: "How to connect Siemens PLC tags to Ignition using JSON", ar: "ربط وسوم Siemens PLC بمنصة Ignition باستخدام JSON" },
  { slug: "ignition-alarms-n8n-docker", en: "Ignition SCADA alarm notifications with n8n and Docker", ar: "تكامل إنذارات Ignition SCADA مع n8n وDocker" },
  { slug: "node-red-vs-ignition-iiot", en: "Node-RED vs Ignition for Industrial IoT dashboards", ar: "متى تختار Node-RED أو Ignition للوحات بيانات IIoT؟" },
] as const;
export const seoKeywords = { homeKeywords, projectKeywords };
