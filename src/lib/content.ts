export type Localized = { en: string; ar: string };
export const l = (en: string, ar: string): Localized => ({ en, ar });
export const projects = [
  {
    slug: "ncec-air-quality",
    title: l(
      "NCEC Air Quality Monitoring System",
      "نظام مراقبة جودة الهواء NCEC",
    ),
    sector: l("Environment | Saudi Arabia", "البيئة | السعودية"),
    image: "air",
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
  },
  {
    slug: "dohler-cloudy-line",
    title: l("Döhler Factory Cloudy Line", "خط كلاودي بمصنع دولر"),
    sector: l("Food & Beverage | Egypt", "الأغذية والمشروبات | مصر"),
    image: "juice",
    date: "10/2024 – 02/2026",
    tags: ["Ignition", "SCADA", "HMI", "PostgreSQL"],
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
  },
  {
    slug: "ground-water",
    title: l("Ground Water Monitoring Platform", "منصة مراقبة المياه الجوفية"),
    sector: l("Water | Saudi Arabia", "المياه | السعودية"),
    image: "wells",
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
    image: "city",
    date: "06/2024 – 11/2024",
    tags: ["Ignition", "IIoT", "10K+ Sensors"],
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
  },
  {
    slug: "drilling-equipment",
    title: l("Drilling Equipment Tracking Platform", "منصة تتبع معدات الحفر"),
    sector: l("Asset Management | Saudi Arabia", "إدارة الأصول | السعودية"),
    image: "drilling",
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
  },
  {
    slug: "water-network",
    title: l(
      "DMAs / DMZs Network Improvement",
      "تحسين شبكات المياه DMAs / DMZs",
    ),
    sector: l("Water | Saudi Arabia", "المياه | السعودية"),
    image: "water",
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
  },
  {
    slug: "modon-testing",
    title: l("MODON Web & Mobile App Testing", "اختبار منصة مدن وتطبيق الهاتف"),
    sector: l("Quality Assurance | Saudi Arabia", "ضمان الجودة | السعودية"),
    image: "city",
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
