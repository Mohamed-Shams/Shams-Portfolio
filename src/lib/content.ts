export type Localized = { en: string; ar: string };
export const l = (en: string, ar: string): Localized => ({ en, ar });

/* One gallery artwork entry. `kind` selects the renderer in
   src/components/ProjectArt.tsx: `scene` is a project-specific site
   illustration, `flow` draws the project's verified architecture steps, and
   `ops` is a stylised operations view built from the project's own tags.
   All artwork is original vector illustration — no project photographs are
   claimed. */
export type GalleryKind = "scene" | "flow" | "ops";
export type GalleryItem = { kind: GalleryKind; caption: Localized };
export type ProjectGalleryItem =
  | GalleryItem
  | { kind: "cover"; caption: Localized };
export type ProjectCover = {
  src: string;
  alt: Localized;
  caption: Localized;
  objectPosition: string;
  illustrative: boolean;
  source: {
    provider: "Unsplash";
    creator: string;
    creatorUrl: string;
    sourcePage: string;
    license: "Unsplash License";
    licenseUrl: "https://unsplash.com/license";
    rightsNote: Localized;
  };
};
export type ProjectMedia = {
  cover: ProjectCover;
  galleryPhotos?: ProjectCover[];
};
export type Architecture = {
  nodes: [Localized, Localized, Localized, Localized];
  note: Localized;
};
export type ScaleTile = { value: string; label: Localized };

export type Project = {
  slug: string;
  title: Localized;
  sector: Localized;
  date: string;
  tags: string[];
  overview: Localized;
  responsibilities: Localized[];
  gallery: GalleryItem[];
  architecture: Architecture;
  scale: ScaleTile[];
};

/* Shared project media manifest. The cover is the single source of truth for
   homepage cards, case-study hero media and the first gallery thumbnail.
   These are licensed illustrative photographs, not photographs of the named
   client projects; the UI labels them accordingly and provenance is retained
   here and in docs/PROJECT-ASSET-SOURCES.md. */
export const projectMedia: Record<string, ProjectMedia> = {
  "dohler-cloudy-line": {
    cover: {
      src: "/assets/projects/dohler-cloudy-line/cover.webp",
      alt: l(
        "Stainless-steel process tanks, piping and control panels inside a beverage production facility",
        "خزانات معالجة من الستانلس ستيل وأنابيب ولوحات تحكم داخل منشأة لإنتاج المشروبات",
      ),
      caption: l(
        "Industrial process tanks and control equipment",
        "خزانات ومعدات تحكم لعملية صناعية",
      ),
      objectPosition: "50% 50%",
      illustrative: true,
      source: {
        provider: "Unsplash",
        creator: "Marcelo Guarnieri",
        creatorUrl: "https://unsplash.com/@marceloooo",
        sourcePage:
          "https://unsplash.com/photos/stainless-steel-industrial-machine-inside-room-AdchdCGeVyY",
        license: "Unsplash License",
        licenseUrl: "https://unsplash.com/license",
        rightsNote: l(
          "Licensed illustrative photography; not a photograph of the Döhler project.",
          "صورة توضيحية مرخصة؛ وليست صورة فعلية لمشروع دولر.",
        ),
      },
    },
  },
  "ncec-air-quality": {
    cover: {
      src: "/assets/projects/ncec-air-quality/cover.webp",
      alt: l(
        "Digital air-quality monitor displaying carbon dioxide, PM2.5, PM10, humidity and temperature readings",
        "جهاز رقمي لمراقبة جودة الهواء يعرض قراءات ثاني أكسيد الكربون وPM2.5 وPM10 والرطوبة ودرجة الحرارة",
      ),
      caption: l(
        "Air-quality monitoring instrumentation",
        "أجهزة مراقبة جودة الهواء",
      ),
      objectPosition: "50% 50%",
      illustrative: true,
      source: {
        provider: "Unsplash",
        creator: "Tim Witzdam",
        creatorUrl: "https://unsplash.com/@timwitzdam",
        sourcePage:
          "https://unsplash.com/photos/air-quality-monitor-shows-levels-of-pollutants-bJ_nhWE7Gxg",
        license: "Unsplash License",
        licenseUrl: "https://unsplash.com/license",
        rightsNote: l(
          "Licensed illustrative photography; not a photograph of an NCEC station.",
          "صورة توضيحية مرخصة؛ وليست صورة فعلية لمحطة تابعة لـ NCEC.",
        ),
      },
    },
  },
  "ground-water": {
    cover: {
      src: "/assets/projects/ground-water/cover.webp",
      alt: l(
        "Field water-pump installation serving a rural agricultural well site",
        "تركيب مضخة مياه ميدانية في موقع بئر زراعي ريفي",
      ),
      caption: l(
        "Field well and water-pump installation",
        "تركيب بئر ومضخة مياه ميدانية",
      ),
      objectPosition: "50% 52%",
      illustrative: true,
      source: {
        provider: "Unsplash",
        creator: "Mirza Zubair",
        creatorUrl: "https://unsplash.com/@mirza009",
        sourcePage:
          "https://unsplash.com/photos/water-pump-in-a-rural-field-with-trees-ugPNWn80mG4",
        license: "Unsplash License",
        licenseUrl: "https://unsplash.com/license",
        rightsNote: l(
          "Licensed illustrative photography; not a photograph of the MEWA project.",
          "صورة توضيحية مرخصة؛ وليست صورة فعلية لمشروع الوزارة.",
        ),
      },
    },
  },
  "modon-poc": {
    cover: {
      src: "/assets/projects/modon-poc/cover.webp",
      alt: l(
        "Aerial view of dense industrial infrastructure, piping and rooftop utility equipment",
        "منظر جوي لبنية تحتية صناعية كثيفة تضم الأنابيب ومعدات الخدمات أعلى المنشأة",
      ),
      caption: l(
        "Industrial-city infrastructure and connected utilities",
        "بنية تحتية وخدمات مترابطة في مدينة صناعية",
      ),
      objectPosition: "50% 50%",
      illustrative: true,
      source: {
        provider: "Unsplash",
        creator: "CHUTTERSNAP",
        creatorUrl: "https://unsplash.com/@chuttersnap",
        sourcePage:
          "https://unsplash.com/photos/aerial-view-of-industrial-factory-_EFvjSgbw1c",
        license: "Unsplash License",
        licenseUrl: "https://unsplash.com/license",
        rightsNote: l(
          "Licensed illustrative photography; not a photograph of a MODON project site.",
          "صورة توضيحية مرخصة؛ وليست صورة فعلية لموقع مشروع تابع لمدن.",
        ),
      },
    },
  },
  "drilling-equipment": {
    cover: {
      src: "/assets/projects/drilling-equipment/cover.webp",
      alt: l(
        "Land drilling rig standing in a field beneath an overcast sky",
        "جهاز حفر بري قائم في حقل تحت سماء غائمة",
      ),
      caption: l(
        "Land drilling rig and field equipment",
        "جهاز حفر بري ومعدات ميدانية",
      ),
      objectPosition: "50% 50%",
      illustrative: true,
      source: {
        provider: "Unsplash",
        creator: "Natalia Grela",
        creatorUrl: "https://unsplash.com/@natgrela",
        sourcePage:
          "https://unsplash.com/photos/a-drilling-rig-in-the-middle-of-a-field-laDsdizvnIs",
        license: "Unsplash License",
        licenseUrl: "https://unsplash.com/license",
        rightsNote: l(
          "Licensed illustrative photography; not a photograph of the tracked project equipment.",
          "صورة توضيحية مرخصة؛ وليست صورة فعلية لمعدات المشروع التي جرى تتبعها.",
        ),
      },
    },
  },
  "water-network": {
    cover: {
      src: "/assets/projects/water-network/cover.webp",
      alt: l(
        "Industrial water piping, pumps and isolation valves in a utility installation",
        "أنابيب ومضخات وصمامات عزل للمياه داخل منشأة خدمات",
      ),
      caption: l(
        "Water-network piping, pumps and valves",
        "أنابيب ومضخات وصمامات شبكة مياه",
      ),
      objectPosition: "50% 50%",
      illustrative: true,
      source: {
        provider: "Unsplash",
        creator: "Darshan Sarang",
        creatorUrl: "https://unsplash.com/@mahakaal2999",
        sourcePage:
          "https://unsplash.com/photos/industrial-pipes-and-valves-IgkjnDnaAtE",
        license: "Unsplash License",
        licenseUrl: "https://unsplash.com/license",
        rightsNote: l(
          "Licensed illustrative photography; not a photograph of an NWC DMA / DMZ field site.",
          "صورة توضيحية مرخصة؛ وليست صورة فعلية لموقع DMA / DMZ تابع لشركة المياه الوطنية.",
        ),
      },
    },
  },
  "modon-testing": {
    cover: {
      src: "/assets/projects/modon-testing/cover.webp",
      alt: l(
        "Control-room consoles and monitoring stations in an industrial operations environment",
        "وحدات تحكم ومحطات مراقبة داخل بيئة تشغيل صناعية",
      ),
      caption: l(
        "Industrial control-room interface environment",
        "بيئة واجهات غرفة تحكم صناعية",
      ),
      objectPosition: "50% 50%",
      illustrative: true,
      source: {
        provider: "Unsplash",
        creator: "Igor Saikin",
        creatorUrl: "https://unsplash.com/@alteredpoint",
        sourcePage:
          "https://unsplash.com/photos/control-room-with-monitors-and-chairs-NSlqiFRyafY",
        license: "Unsplash License",
        licenseUrl: "https://unsplash.com/license",
        rightsNote: l(
          "Licensed illustrative photography; not a screenshot or photograph of the MODON application under test.",
          "صورة توضيحية مرخصة؛ وليست لقطة شاشة أو صورة فعلية لتطبيق مدن محل الاختبار.",
        ),
      },
    },
  },
};

export const getProjectMedia = (slug: string): ProjectMedia => projectMedia[slug];
export const getProjectGallery = (project: Project): ProjectGalleryItem[] => [
  { kind: "cover", caption: getProjectMedia(project.slug).cover.caption },
  ...project.gallery,
];

export const projects: Project[] = [
  {
    slug: "ncec-air-quality",
    title: l(
      "NCEC Air Quality Monitoring System",
      "نظام مراقبة جودة الهواء NCEC",
    ),
    sector: l("Environment | Saudi Arabia", "البيئة | السعودية"),
    date: "04/2026 – Present",
    tags: ["Stream IIOT", "MSSQL"],
    overview: l(
      "Supported the implementation of the NCEC AQMS project, focusing on station data configuration, database support, platform validation and reliable visualization of air quality monitoring data.",
      "المساهمة في تنفيذ مشروع مراقبة جودة الهواء للمركز الوطني للرقابة على الالتزام البيئي، مع التركيز على تهيئة بيانات المحطات ودعم قواعد البيانات والتحقق من المنصة وعرض البيانات بشكل موثوق.",
    ),
    responsibilities: [
      l(
        "Configured and supported AQMS data on the Stream IIOT Platform.",
        "تهيئة ودعم بيانات جودة الهواء على منصة Stream IIOT.",
      ),
      l(
        "Worked with MSSQL queries and structured station and analyzer data.",
        "العمل على استعلامات MSSQL وتنظيم بيانات المحطات وأجهزة التحليل.",
      ),
      l(
        "Validated displayed values and system behavior; supported troubleshooting, testing and documentation.",
        "التحقق من القيم المعروضة وسلوك النظام ودعم استكشاف الأعطال والاختبارات والتوثيق.",
      ),
    ],
    gallery: [
      {
        kind: "scene",
        caption: l(
          "Monitoring station with analyzers and telemetry mast",
          "محطة مراقبة بأجهزة التحليل وساق القياس عن بُعد",
        ),
      },
      {
        kind: "flow",
        caption: l(
          "Station data path: analyzers → Stream IIOT → MSSQL → dashboards",
          "مسار بيانات المحطة: المحللات ← Stream IIOT ← MSSQL ← اللوحات",
        ),
      },
      {
        kind: "ops",
        caption: l(
          "Configuration, validation and support focus areas",
          "مجالات التركيز: التهيئة والتحقق والدعم",
        ),
      },
    ],
    architecture: {
      nodes: [
        l("AQMS monitoring stations", "محطات مراقبة AQMS"),
        l("Stream IIOT platform", "منصة Stream IIOT"),
        l("MSSQL queries & schema", "استعلامات ومخطط MSSQL"),
        l("Validated dashboards", "لوحات مُتحقَّق منها"),
      ],
      note: l(
        "Derived from this project's stated responsibilities: station configuration, database support and platform validation.",
        "مشتق من مسؤوليات المشروع المعلنة: تهيئة المحطات ودعم قواعد البيانات والتحقق من المنصة.",
      ),
    },
    scale: [
      { value: "AQMS", label: l("Monitoring scope", "نطاق المراقبة") },
      { value: "Stream IIOT", label: l("IIoT platform", "منصة IIoT") },
      { value: "MSSQL", label: l("Data layer", "طبقة البيانات") },
    ] as ScaleTile[],
  },
  {
    slug: "dohler-cloudy-line",
    title: l("Döhler Factory Cloudy Line", "خط كلاودي بمصنع دولر"),
    sector: l("Food & Beverage | Egypt", "الأغذية والمشروبات | مصر"),
    date: "10/2024 – 02/2026",
    tags: ["Ignition", "SCADA", "HMI", "MSSQL"],
    overview: l(
      "Developed the complete Ignition SCADA system for Döhler Egypt’s new production line producing 65 Brix cloudy juice concentrate from orange peel waste—the first of its kind in the Middle East.",
      "تطوير نظام Ignition SCADA بالكامل لخط إنتاج دولر مصر الجديد لإنتاج مركز العصير العكر بتركيز 65 بريكس من مخلفات قشر البرتقال، وهو الأول من نوعه في الشرق الأوسط.",
    ),
    responsibilities: [
      l(
        "Developed the complete SCADA system using Ignition.",
        "تطوير نظام سكادا متكامل باستخدام Ignition.",
      ),
      l(
        "Designed responsive Perspective HMIs and integrated MSSQL historians.",
        "تصميم واجهات Perspective متجاوبة وربط سجلات البيانات بـ MSSQL.",
      ),
      l(
        "Connected and monitored PLCs from 7+ package suppliers.",
        "ربط ومراقبة وحدات PLC من أكثر من 7 موردي حزم.",
      ),
      l(
        "Implemented alarms and live visualization of sensors, valves, VSDs and process parameters.",
        "تنفيذ الإنذارات والعرض اللحظي للحساسات والصمامات ومغيرات السرعة ومعلمات العملية.",
      ),
      l(
        "Supported commissioning, operator training and integration with factory digital systems.",
        "دعم التشغيل التجريبي وتدريب المشغلين والتكامل مع الأنظمة الرقمية للمصنع.",
      ),
    ],
    gallery: [
      {
        kind: "scene",
        caption: l(
          "Concentrate line: tanks, pumps and process skids",
          "خط المركز: الخزانات والمضخات ووحدات العملية",
        ),
      },
      {
        kind: "flow",
        caption: l(
          "Control path: 7+ PLC packages → Ignition → MSSQL historian → HMIs & alarms",
          "مسار التحكم: أكثر من 7 موردي PLC ← Ignition ← سجل MSSQL ← الواجهات والإنذارات",
        ),
      },
      {
        kind: "ops",
        caption: l(
          "Live view of sensors, valves, VSDs and alarms",
          "عرض لحظي للحساسات والصمامات ومغيرات السرعة والإنذارات",
        ),
      },
    ],
    architecture: {
      nodes: [
        l("7+ PLC package suppliers", "موردو أكثر من 7 حزم PLC"),
        l("Ignition Perspective", "Ignition Perspective"),
        l("MSSQL historian", "سجل MSSQL"),
        l("HMIs & alarms", "الواجهات والإنذارات"),
      ],
      note: l(
        "Data path as described in this project's responsibilities: PLC integration, responsive Perspective HMIs, MSSQL historians and alarms.",
        "مسار البيانات كما ورد في مسؤوليات المشروع: تكامل PLC وواجهات Perspective متجاوبة وسجلات MSSQL والإنذارات.",
      ),
    },
    scale: [
      { value: "65 Brix", label: l("Concentrate strength", "تركيز المركز") },
      { value: "7+", label: l("PLC package suppliers", "موردو حزم PLC") },
      {
        value: "1st",
        label: l("Of its kind in the Middle East", "من نوعه في الشرق الأوسط"),
      },
    ] as ScaleTile[],
  },
  {
    slug: "ground-water",
    title: l("Ground Water Monitoring Platform", "منصة مراقبة المياه الجوفية"),
    sector: l("Water | Saudi Arabia", "المياه | السعودية"),
    date: "09/2024 – 12/2025",
    tags: ["Ignition", "Oracle", "InfluxDB"],
    overview: l(
      "Contributed to a scalable Ignition architecture monitoring over 7,000 underground wells for real-time water consumption analysis for MEWA.",
      "المساهمة في بنية Ignition قابلة للتوسع لمراقبة أكثر من 7,000 بئر جوفية وتحليل استهلاك المياه لحظيًا لصالح وزارة البيئة والمياه والزراعة.",
    ),
    responsibilities: [
      l(
        "Participated in multi-gateway architecture, secure networking and redundancy.",
        "المشاركة في تصميم بنية متعددة البوابات وتأمين الشبكات والتكرار الاحتياطي.",
      ),
      l(
        "Assisted with Oracle schema design and configured InfluxDB as a time-series historian.",
        "المساعدة في تصميم قاعدة Oracle وتهيئة InfluxDB لسجل السلاسل الزمنية.",
      ),
      l(
        "Supported REST API integration, Active Directory and role-based access.",
        "دعم تكامل REST API وActive Directory وصلاحيات المستخدمين.",
      ),
      l(
        "Contributed to asset management and analytical dashboards.",
        "المساهمة في إدارة الأصول ولوحات التحليل.",
      ),
    ],
    gallery: [
      {
        kind: "scene",
        caption: l(
          "Well field reporting through gateways to the platform",
          "حقل آبار يرسل بياناته عبر البوابات إلى المنصة",
        ),
      },
      {
        kind: "flow",
        caption: l(
          "Multi-gateway path: wells → Ignition gateways → Oracle & InfluxDB → dashboards",
          "مسار متعدد البوابات: الآبار ← بوابات Ignition ← Oracle وInfluxDB ← اللوحات",
        ),
      },
      {
        kind: "ops",
        caption: l(
          "Real-time consumption analysis across the well estate",
          "تحليل لحظي لاستهلاك المياه عبر شبكة الآبار",
        ),
      },
    ],
    architecture: {
      nodes: [
        l("7,000+ underground wells", "أكثر من 7,000 بئر جوفي"),
        l("Multi-gateway Ignition", "Ignition متعدد البوابات"),
        l("Oracle + InfluxDB", "Oracle + InfluxDB"),
        l("REST API & dashboards", "REST API واللوحات"),
      ],
      note: l(
        "Architecture as described in this project's responsibilities: multi-gateway redundancy, Oracle schema, InfluxDB historian, REST and dashboards.",
        "البنية كما وردت في مسؤوليات المشروع: تكرار متعدد البوابات ومخطط Oracle وسجل InfluxDB وREST واللوحات.",
      ),
    },
    scale: [
      {
        value: "7,000+",
        label: l("Underground wells", "بئر جوفية"),
      },
      {
        value: "Multi-gateway",
        label: l("Redundant architecture", "بنية مكررة"),
      },
      { value: "InfluxDB", label: l("Time-series historian", "سجل زمني") },
    ] as ScaleTile[],
  },
  {
    slug: "modon-poc",
    title: l(
      "MODON Smart Cities Platform (POC)",
      "منصة مدن الذكية (إثبات مفهوم)",
    ),
    sector: l(
      "Smart Infrastructure | Saudi Arabia",
      "البنية التحتية الذكية | السعودية",
    ),
    date: "06/2024 – 11/2024",
    tags: ["Ignition", "IIoT", "MSSQL"],
    overview: l(
      "Assisted in developing a proof-of-concept Ignition platform to monitor over 10,000 smart sensors deployed across industrial cities.",
      "المساعدة في تطوير إثبات مفهوم لمنصة Ignition لمراقبة أكثر من 10,000 حساس ذكي في المدن الصناعية.",
    ),
    responsibilities: [
      l(
        "Supported All-in-One architecture with secure network configuration.",
        "دعم بنية موحدة مع إعدادات شبكة آمنة.",
      ),
      l(
        "Helped design MSSQL schemas and third-party API integration.",
        "المساعدة في تصميم قواعد MSSQL وتكامل واجهات الجهات الخارجية.",
      ),
      l(
        "Supported asset registration and data dashboards.",
        "دعم تسجيل الأصول ولوحات البيانات.",
      ),
    ],
    gallery: [
      {
        kind: "scene",
        caption: l(
          "Industrial city infrastructure instrumented with smart sensors",
          "بنية تحتية في مدينة صناعية مجهزة بحساسات ذكية",
        ),
      },
      {
        kind: "flow",
        caption: l(
          "Platform path: 10,000+ sensors → Ignition All-in-One → MSSQL → APIs & dashboards",
          "مسار المنصة: أكثر من 10,000 حساس ← Ignition All-in-One ← MSSQL ← الواجهات واللوحات",
        ),
      },
      {
        kind: "ops",
        caption: l(
          "Sensor estate and asset dashboards at a glance",
          "لمحة عن الحساسات والأصول ولوحات البيانات",
        ),
      },
    ],
    architecture: {
      nodes: [
        l("10,000+ smart sensors", "أكثر من 10,000 حساس ذكي"),
        l("Ignition All-in-One", "Ignition All-in-One"),
        l("MSSQL schemas", "مخططات MSSQL"),
        l("APIs & dashboards", "واجهات برمجية ولوحات"),
      ],
      note: l(
        "Platform path as described in this project's responsibilities: All-in-One architecture, MSSQL schemas, third-party APIs and dashboards.",
        "مسار المنصة كما ورد في مسؤوليات المشروع: بنية موحدة ومخططات MSSQL وواجهات خارجية ولوحات بيانات.",
      ),
    },
    scale: [
      {
        value: "10,000+",
        label: l("Smart sensors", "حساسات ذكية"),
      },
      { value: "POC", label: l("Proof of concept", "إثبات مفهوم") },
      {
        value: "All-in-One",
        label: l("Platform architecture", "بنية المنصة"),
      },
    ] as ScaleTile[],
  },
  {
    slug: "drilling-equipment",
    title: l("Drilling Equipment Tracking Platform", "منصة تتبع معدات الحفر"),
    sector: l("Asset Management | Saudi Arabia", "إدارة الأصول | السعودية"),
    date: "09/2024 – 12/2025",
    tags: ["Ignition", "Oracle", "InfluxDB"],
    overview: l(
      "Developed an Ignition-based governance and monitoring platform for 1,300 drilling equipment assets across underground wells.",
      "تطوير منصة حوكمة ومراقبة قائمة على Ignition لعدد 1,300 من أصول معدات حفر الآبار الجوفية.",
    ),
    responsibilities: [
      l(
        "Assisted with distributed architecture, secure communication and failover.",
        "المساعدة في البنية الموزعة والاتصال الآمن وآليات تجاوز الأعطال.",
      ),
      l(
        "Participated in Oracle schema design and configured InfluxDB historian.",
        "المشاركة في تصميم Oracle وتهيئة سجل InfluxDB.",
      ),
      l(
        "Helped build asset registration workflows and interactive dashboards.",
        "المساعدة في بناء إجراءات تسجيل الأصول ولوحات تفاعلية.",
      ),
      l(
        "Supported REST APIs, Active Directory and role-based access.",
        "دعم REST API وActive Directory والصلاحيات المبنية على الأدوار.",
      ),
    ],
    gallery: [
      {
        kind: "scene",
        caption: l(
          "Drilling rig with tracked equipment assets",
          "رافعة حفر مع أصول معدات مُتتبَّعة",
        ),
      },
      {
        kind: "flow",
        caption: l(
          "Platform path: field assets → distributed Ignition → Oracle & InfluxDB → dashboards",
          "مسار المنصة: الأصول الميدانية ← Ignition موزعة ← Oracle وInfluxDB ← اللوحات",
        ),
      },
      {
        kind: "ops",
        caption: l(
          "Asset governance and registration workflows",
          "حوكمة الأصول وإجراءات تسجيلها",
        ),
      },
    ],
    architecture: {
      nodes: [
        l("1,300 equipment assets", "1,300 أصل معدات"),
        l("Distributed Ignition", "Ignition موزعة"),
        l("Oracle + InfluxDB", "Oracle + InfluxDB"),
        l("Asset dashboards", "لوحات الأصول"),
      ],
      note: l(
        "Platform path as described in this project's responsibilities: distributed architecture with failover, Oracle schema, InfluxDB historian and dashboards.",
        "مسار المنصة كما ورد في مسؤوليات المشروع: بنية موزعة مع تجاوز الأعطال ومخطط Oracle وسجل InfluxDB واللوحات.",
      ),
    },
    scale: [
      { value: "1,300", label: l("Equipment assets", "أصل معدات") },
      {
        value: "Failover",
        label: l("Distributed architecture", "بنية موزعة"),
      },
      { value: "InfluxDB", label: l("Process historian", "سجل العملية") },
    ] as ScaleTile[],
  },
  {
    slug: "water-network",
    title: l(
      "DMAs / DMZs Network Improvement",
      "تحسين شبكات المياه DMAs / DMZs",
    ),
    sector: l("Water | Saudi Arabia", "المياه | السعودية"),
    date: "03/2026 – 07/2026",
    tags: ["SOFREL RTU", "Testing", "Commissioning"],
    overview: l(
      "RTU and testing activities for NWC’s Northwest Cluster network improvement project across Madinah, Yanbu and Tabuk.",
      "أعمال وحدات RTU والاختبارات لمشروع تحسين شبكات المياه بالتجمع الشمالي الغربي لشركة المياه الوطنية في المدينة المنورة وينبع وتبوك.",
    ),
    responsibilities: [
      l(
        "Delivered SOFREL RTU and datalogger works for field sites.",
        "تنفيذ أعمال SOFREL RTU ومسجلات البيانات للمواقع الميدانية.",
      ),
      l(
        "Validated signals, alarms and communications.",
        "التحقق من الإشارات والإنذارات والاتصالات.",
      ),
      l(
        "Prepared FAT and T&C documentation; executed testing and commissioning.",
        "إعداد وثائق FAT والاختبار والتشغيل التجريبي وتنفيذ أعمال الاختبارات والتشغيل.",
      ),
    ],
    gallery: [
      {
        kind: "scene",
        caption: l(
          "Field sites with RTUs and dataloggers in the northwest cluster",
          "مواقع ميدانية بوحدات RTU ومسجلات بيانات في التجمع الشمالي الغربي",
        ),
      },
      {
        kind: "flow",
        caption: l(
          "Delivery path: field sites → SOFREL RTU → signals & alarms → FAT / T&C records",
          "مسار التنفيذ: المواقع الميدانية ← وحدة SOFREL ← الإشارات والإنذارات ← سجلات FAT والتشغيل",
        ),
      },
      {
        kind: "ops",
        caption: l(
          "Coverage across Madinah, Yanbu and Tabuk",
          "تغطية المدينة وينبع وتبوك",
        ),
      },
    ],
    architecture: {
      nodes: [
        l(
          "Field sites · Madinah, Yanbu, Tabuk",
          "مواقع ميدانية · المدينة، ينبع، تبوك",
        ),
        l("SOFREL RTU & datalogger", "وحدة SOFREL ومسجل البيانات"),
        l("Signals, alarms & comms", "الإشارات والإنذارات والاتصالات"),
        l("FAT / T&C documentation", "وثائق FAT والتشغيل"),
      ],
      note: l(
        "Delivery path as described in this project's responsibilities: RTU works, signal validation and FAT / T&C documentation.",
        "مسار التنفيذ كما ورد في مسؤوليات المشروع: أعمال RTU والتحقق من الإشارات ووثائق FAT والتشغيل.",
      ),
    },
    scale: [
      {
        value: "3",
        label: l("Cities: Madinah, Yanbu, Tabuk", "مدن: المدينة، ينبع، تبوك"),
      },
      {
        value: "SOFREL",
        label: l("RTU & dataloggers", "وحدات RTU ومسجلات"),
      },
      {
        value: "FAT / T&C",
        label: l("Testing & commissioning", "الاختبار والتشغيل"),
      },
    ] as ScaleTile[],
  },
  {
    slug: "modon-testing",
    title: l("MODON Web & Mobile App Testing", "اختبار منصة مدن وتطبيق الهاتف"),
    sector: l("Quality Assurance | Saudi Arabia", "ضمان الجودة | السعودية"),
    date: "11/2025 – 02/2026",
    tags: ["Azure DevOps", "REST APIs", "QA"],
    overview: l(
      "Conducted end-to-end manual testing for MODON web and mobile journeys, including regression, compatibility and acceptance criteria validation.",
      "تنفيذ اختبارات يدوية شاملة لرحلات المستخدم على منصة مدن وتطبيق الهاتف، بما يشمل اختبارات الانحدار والتوافق ومعايير القبول.",
    ),
    responsibilities: [
      l(
        "Tested authentication, complaints and dashboards in Azure DevOps against acceptance criteria.",
        "اختبار المصادقة والشكاوى ولوحات المعلومات عبر Azure DevOps وفق معايير القبول.",
      ),
      l(
        "Performed cross-browser, device compatibility and regression testing.",
        "تنفيذ اختبارات عبر المتصفحات وتوافق الأجهزة واختبارات الانحدار.",
      ),
    ],
    gallery: [
      {
        kind: "scene",
        caption: l(
          "QA lab: web and mobile journeys under test",
          "مختبر ضمان الجودة: رحلات الويب والهاتف قيد الاختبار",
        ),
      },
      {
        kind: "flow",
        caption: l(
          "Testing pipeline: journeys → Azure DevOps cases → regression → acceptance",
          "مسار الاختبار: الرحلات ← حالات Azure DevOps ← الانحدار ← معايير القبول",
        ),
      },
      {
        kind: "ops",
        caption: l(
          "Cross-browser, device and regression coverage",
          "تغطية المتصفحات والأجهزة واختبارات الانحدار",
        ),
      },
    ],
    architecture: {
      nodes: [
        l("Web & mobile journeys", "رحلات الويب والهاتف"),
        l("Azure DevOps test cases", "حالات الاختبار في Azure DevOps"),
        l("Regression & compatibility", "الانحدار والتوافق"),
        l("Acceptance criteria", "معايير القبول"),
      ],
      note: l(
        "Testing pipeline as described in this project's responsibilities: criteria-based test cases, cross-browser, device and regression testing.",
        "مسار الاختبار كما ورد في مسؤوليات المشروع: حالات اختبار وفق معايير القبول واختبارات المتصفحات والأجهزة والانحدار.",
      ),
    },
    scale: [
      {
        value: "Web + Mobile",
        label: l("Journeys tested", "رحلات مختبرة"),
      },
      {
        value: "Azure DevOps",
        label: l("Test management", "إدارة الاختبارات"),
      },
      {
        value: "Regression",
        label: l("Cross-browser & device", "عبر المتصفحات والأجهزة"),
      },
    ] as ScaleTile[],
  },
];
export const skills = [
  [
    "Ignition SCADA",
    "Development & Integration",
    "التطوير والتكامل",
    "Industrial Platforms",
    "ϟ",
  ],
  [
    "AVEVA Application Server",
    "Configuration & Integration",
    "التهيئة والتكامل",
    "Industrial Platforms",
    "A",
  ],
  [
    "WinCC",
    "SCADA & HMI",
    "سكادا وواجهات التشغيل",
    "Industrial Platforms",
    "▣",
  ],
  [
    "SCADA & HMI Engineering",
    "Design & Implementation",
    "التصميم والتنفيذ",
    "Industrial Platforms",
    "◫",
  ],
  [
    "Industrial IoT",
    "Smart Infrastructure",
    "البنية التحتية الذكية",
    "Industrial Platforms",
    "⌘",
  ],
  [
    "OPC UA",
    "Industrial Protocols",
    "البروتوكولات الصناعية",
    "Connectivity",
    "⌘",
  ],
  ["MQTT", "IIoT Communication", "الاتصال الصناعي", "Connectivity", "◔"],
  ["REST APIs", "System Integration", "تكامل الأنظمة", "Connectivity", "◇"],
  ["Python", "Automation & Data", "الأتمتة والبيانات", "Programming", "Py"],
  [
    "JavaScript / HTML / CSS",
    "Web Development",
    "تطوير الويب",
    "Programming",
    "JS",
  ],
  [
    "MS SQL / MySQL / PostgreSQL",
    "Databases",
    "قواعد البيانات",
    "Databases",
    "▤",
  ],
  [
    "InfluxDB",
    "Time-series Historian",
    "سجل السلاسل الزمنية",
    "Databases",
    "◈",
  ],
  [
    "Docker / Git / n8n",
    "DevOps & Automation",
    "التطوير والأتمتة",
    "Tools & AI",
    "◉",
  ],
  [
    "Dataiku",
    "Data Analytics & ML",
    "تحليل البيانات والتعلم الآلي",
    "Tools & AI",
    "◭",
  ],
  [
    "AWS AI Services",
    "Cloud & AI Foundations",
    "أساسيات السحابة والذكاء الاصطناعي",
    "Tools & AI",
    "aws",
  ],
];
export const credentials = [
  [
    "Ignition Core Certified",
    "اعتماد Ignition Core",
    "Inductive Automation",
    "Nov 2024",
    "Ignition",
  ],
  [
    "AWS Certified AI Practitioner",
    "ممارس الذكاء الاصطناعي المعتمد من AWS",
    "Amazon Web Services",
    "Feb 2026",
    "aws",
  ],
  [
    "AVEVA Application Server",
    "خادم تطبيقات AVEVA",
    "AVEVA Learning Academy",
    "Apr 2026",
    "AVEVA",
  ],
  [
    "Dataiku Core & Advanced Designer Certified",
    "مصمم Dataiku الأساسي والمتقدم",
    "Dataiku",
    "Sep 2025",
    "dataiku",
  ],
  [
    "Dataiku ML Practitioner Certified",
    "ممارس التعلم الآلي Dataiku",
    "Dataiku",
    "Dec 2025",
    "dataiku",
  ],
];
export const training = [
  [
    "WinCC Unified Essentials",
    "أساسيات WinCC Unified",
    "Siemens Unified Academy",
    "Aug 2024",
  ],
  [
    "Data Science & AI Course",
    "علوم البيانات والذكاء الاصطناعي",
    "Machinfy",
    "Jun–Nov 2025",
  ],
  [
    "GEN-110: Cloudera Essentials",
    "أساسيات Cloudera GEN-110",
    "Cloudera",
    "Nov 2025",
  ],
  [
    "IIoT: MQTT, OPC, Node-RED, PLC Integrations",
    "إنترنت الأشياء الصناعي وتكامل PLC",
    "Codeandcompile",
    "May 2024",
  ],
  [
    "Containerization & Virtualization with Docker & Kubernetes",
    "الحاويات والافتراضية باستخدام Docker وKubernetes",
    "DataCamp",
    "May 2025",
  ],
  [
    "Advanced & Basic Automation Courses",
    "دورات الأتمتة الأساسية والمتقدمة",
    "HA Consulting Group",
    "Feb 2023",
  ],
  [
    "Complete RAG System: From LLM Retrieval to AWS Deployment",
    "نظام RAG متكامل: من الاسترجاع إلى النشر على AWS",
    "Udemy",
    "Apr 2025",
  ],
];

/* One-line, bilingual description per project technology tag. Used by the
   case-study technology section; wording describes what the technology is,
   not what any specific project did with it. */
export const techNotes: Record<string, Localized> = {
  "Stream IIOT": l(
    "Industrial IoT platform for station data configuration and visualization.",
    "منصة إنترنت الأشياء الصناعي لتهيئة بيانات المحطات وعرضها.",
  ),
  MSSQL: l(
    "Microsoft SQL Server — relational store for historians and station queries.",
    "مايكروسوفت SQL Server — قاعدة علائقية للسجلات واستعلامات المحطات.",
  ),
  Ignition: l(
    "Inductive Automation's SCADA platform for IIoT, HMI and dashboards.",
    "منصة SCADA من Inductive Automation لإنترنت الأشياء الصناعي والواجهات واللوحات.",
  ),
  SCADA: l(
    "Supervisory control and data acquisition for plant-wide monitoring and control.",
    "التحكم والإشراف والجمع اللحظي لمراقبة المصنع والتحكم فيه.",
  ),
  HMI: l(
    "Operator interfaces for monitoring and commanding the process.",
    "واجهات المشغل لمراقبة العملية والتحكم بها.",
  ),
  PostgreSQL: l(
    "Open-source relational database used for application data.",
    "قاعدة بيانات علائقية مفتوحة المصدر لبيانات التطبيقات.",
  ),
  Oracle: l(
    "Oracle Database for relational asset and schema storage.",
    "قاعدة Oracle لتخزين الأصول والمخططات العلائقية.",
  ),
  InfluxDB: l(
    "Time-series database used as the process historian.",
    "قاعدة سلاسل زمنية تُستخدم كسجل لبيانات العملية.",
  ),
  IIoT: l(
    "Industrial Internet of Things — connected sensors, gateways and analytics.",
    "إنترنت الأشياء الصناعي — حساسات وبوابات وتحليلات متصلة.",
  ),
  "10K+ Sensors": l(
    "Smart-sensor estate monitored in the proof of concept.",
    "مجموعة الحساسات الذكية المراقبة في إثبات المفهوم.",
  ),
  "SOFREL RTU": l(
    "Remote terminal units for field measurement, datalogging and supervision.",
    "وحدات تحكم عن بُعد للقياس وتسجيل البيانات والإشراف الميداني.",
  ),
  Testing: l(
    "Structured functional, signal and acceptance testing.",
    "اختبارات وظيفية وإشارات وقبول منظمة.",
  ),
  Commissioning: l(
    "Site integration, commissioning and handover.",
    "تكامل الموقع والتشغيل التجريبي والتسليم.",
  ),
  "Azure DevOps": l(
    "Microsoft's planning and test-management service for cases and runs.",
    "خدمة تخطيط وإدارة الاختبارات من مايكروسوفت لحالات الاختبار والتنفيذ.",
  ),
  "REST APIs": l(
    "HTTP-based interfaces for integrating external systems.",
    "واجهات HTTP لتكامل الأنظمة الخارجية.",
  ),
  QA: l(
    "Manual quality assurance against acceptance criteria.",
    "ضمان جودة يدوية وفق معايير القبول.",
  ),
};
