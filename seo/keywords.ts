/** Search-intent map. Keep phrasing human-readable; not a meta keywords dump. */
export type SeoLocale = "en" | "ar";
export type KeywordSet = { primary: string; secondary: readonly string[] };
export const homeKeywords: Record<SeoLocale, KeywordSet> = {
  en: {
    primary: "Mohamed Ahmed Shams",
    secondary: [
      "Ignition SCADA developer", "Systems Engineer SCADA Industrial IoT",
      "industrial IoT engineer", "SCADA engineer Egypt",
      "SCADA engineer Saudi Arabia", "OPC UA MQTT integration",
      "Ignition Core certified", "Mohamed Shams SCADA", "Mohamed A. Shams engineer",
    ],
  },
  ar: {
    primary: "محمد أحمد شمس",
    secondary: [
      "مهندس سكادا", "مهندس أنظمة SCADA", "مهندس إنترنت الأشياء الصناعي",
      "نظام Ignition SCADA", "أنظمة المراقبة والتحكم الصناعي",
      "مهندس سكادا مصر", "مهندس سكادا السعودية",
    ],
  },
};
export const projectKeywords = {
  "dohler-cloudy-line": {
    en: { primary: "Ignition SCADA food and beverage", secondary: ["SCADA for juice concentrate production line", "Ignition HMI MSSQL"] },
    ar: { primary: "سكادا خطوط إنتاج العصائر", secondary: ["Ignition SCADA للصناعات الغذائية", "مراقبة خطوط الإنتاج في مصر"] },
  },
  "ncec-air-quality": {
    en: { primary: "air quality monitoring system SCADA", secondary: ["environmental monitoring IIoT Saudi Arabia", "Stream IIoT"] },
    ar: { primary: "نظام مراقبة جودة الهواء", secondary: ["المراقبة البيئية في السعودية", "منصة Stream IIoT"] },
  },
  "ground-water": {
    en: { primary: "groundwater monitoring platform", secondary: ["well monitoring SCADA", "Ignition Oracle InfluxDB"] },
    ar: { primary: "مراقبة الآبار والمياه الجوفية", secondary: ["نظام متابعة استهلاك المياه", "منصة Ignition في السعودية"] },
  },
  "modon-poc": {
    en: { primary: "smart cities IIoT proof of concept", secondary: ["industrial city monitoring Saudi Arabia", "Ignition MSSQL"] },
    ar: { primary: "إنترنت الأشياء للمدن الصناعية", secondary: ["إثبات مفهوم المدن الذكية", "منصة مدن السعودية"] },
  },
  "drilling-equipment": {
    en: { primary: "drilling equipment tracking platform", secondary: ["asset tracking Ignition", "monitoring drilling assets"] },
    ar: { primary: "تتبع معدات حفر الآبار", secondary: ["مراقبة أصول الحفر", "حوكمة الأصول باستخدام Ignition"] },
  },
  "water-network": {
    en: { primary: "DMA water network monitoring", secondary: ["water network SCADA", "SOFREL RTU commissioning"] },
    ar: { primary: "مراقبة شبكات المياه DMA", secondary: ["اختبار وحدات SOFREL RTU", "تطوير شبكات المياه السعودية"] },
  },
  "modon-testing": {
    en: { primary: "industrial web and mobile app testing", secondary: ["MODON QA", "Azure DevOps acceptance testing"] },
    ar: { primary: "اختبار تطبيقات مدن الصناعية", secondary: ["اختبارات قبول تطبيقات الويب والجوال", "ضمان جودة البرمجيات السعودية"] },
  },
} as const satisfies Record<string, Record<SeoLocale, KeywordSet>>;
export type SeoProjectSlug = keyof typeof projectKeywords;
