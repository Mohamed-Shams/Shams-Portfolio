"use client";
import { useRef, useState, useEffect, useCallback } from "react";
import { useLocale } from "next-intl";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  ArrowRight,
  ArrowLeft,
  Download,
  Menu,
  X,
  Mail,
  Github,
  ChevronDown,
  Copy,
  Check,
  FileText,
  ExternalLink,
} from "lucide-react";
import {
  projects,
  skills,
  credentials,
  training,
  techNotes,
  getProjectGallery,
  getProjectMedia,
  Localized,
} from "@/lib/content";
import {
  certificateDocuments,
  certificateLinksByCard,
} from "@/lib/certificateDocuments";
import {
  GlobeArt,
  Scada,
  TechSymbol,
  TechIcon,
  FlowDiagram,
} from "./TechnicalVisuals";
import { ProjectArt } from "./ProjectArt";
import { PortfolioIntro } from "./PortfolioIntro";
import { PlatformTicker } from "./PlatformTicker";
import { useCountUp, RevealManager } from "./motion";
const cv = "/assets/MohamedAhmedShams_CV.pdf";

/* The CV-confirmed flagship leads the grid; the remaining projects keep their
   existing order so the first six still fill the initial grid and the seventh
   stays behind "View all". */
const FLAGSHIP_SLUG = "dohler-cloudy-line";
const orderedProjects = [
  ...projects.filter((p) => p.slug === FLAGSHIP_SLUG),
  ...projects.filter((p) => p.slug !== FLAGSHIP_SLUG),
];
const visibleProjects = (all: boolean) =>
  orderedProjects.slice(0, all ? 7 : 6);
const projectPeriod = (date: string, locale: "en" | "ar") =>
  locale === "ar" ? date.replace(/\bPresent\b/g, "حتى الآن") : date;

/* Platform marks: preserve sharp existing CC0 vectors and reuse the genuine
   issuer icons from the old portfolio for Ignition and AVEVA. */
const vectorCertMarks = new Set(["aws", "dataiku", "siemens"]);
const certMark = (brand: string) => {
  const key = brand.toLowerCase();
  if (vectorCertMarks.has(key)) return `/assets/brand/${key}.svg`;
  if (key === "ignition") return "/assets/platforms/ignition-logo.png";
  if (key === "aveva") return "/assets/platforms/aveva.png";
  return `/assets/cert-${key}.webp`;
};
export function Header() {
  const locale = useLocale();
  const ar = locale === "ar";
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const navigationRef = useRef<HTMLElement>(null);
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      setOpen(false);
      menuButtonRef.current?.focus();
    };
    const onOutside = (event: PointerEvent) => {
      if (!headerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const frame = requestAnimationFrame(() => navigationRef.current?.querySelector("a")?.focus());
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onOutside);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onOutside);
    };
  }, [open]);
  const labels = ar
    ? [
        "الرئيسية",
        "نبذة عني",
        "المشاريع",
        "المهارات",
        "الخبرات",
        "الشهادات",
        "تواصل",
      ]
    : [
        "Home",
        "About",
        "Projects",
        "Skills",
        "Experience",
        "Certifications",
        "Contact",
      ];
  return (
    <header
      ref={headerRef}
      className="header"
      onBlurCapture={(event) => {
        if (open && !event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setOpen(false);
        }
      }}
    >
      <Link
        href={`/${locale}`}
        className="brand"
        aria-label={ar ? "محمد شمس — الرئيسية" : "Mohamed Shams — Home"}
      >
        <b>MS</b>
        <small>MOHAMED SHAMS</small>
      </Link>
      <span className="brand-name">
        {ar ? "محمد أحمد شمس" : "Mohamed Ahmed Shams"}
      </span>
      <nav
        id="portfolio-main-navigation"
        ref={navigationRef}
        aria-label={ar ? "التنقل الرئيسي" : "Main navigation"}
        className={open ? "nav open" : "nav"}
      >
        {[
          "home",
          "about",
          "projects",
          "skills",
          "experience",
          "certifications",
          "contact",
        ].map((id, i) => (
          <Link
            key={id}
            href={`/${locale}#${id}`}
            aria-current={id === "home" && path === `/${locale}` ? "page" : undefined}
            onClick={() => setOpen(false)}
          >
            {labels[i]}
          </Link>
        ))}
      </nav>
      <div className="language" aria-label="Language">
        <Link
          href={path.replace(/^\/(en|ar)/, "/en")}
          aria-current={!ar ? "page" : undefined}
        >
          EN
        </Link>
        <Link
          href={path.replace(/^\/(en|ar)/, "/ar")}
          aria-current={ar ? "page" : undefined}
        >
          AR
        </Link>
      </div>
      <a href={`/${locale}#contact`} className="button small header-contact">
        {ar ? "تواصل معي" : "Get in Touch"}
      </a>
      <button
        ref={menuButtonRef}
        className="menu"
        type="button"
        aria-controls="portfolio-main-navigation"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-label={
          ar
            ? open
              ? "إغلاق القائمة"
              : "فتح القائمة"
            : open
              ? "Close menu"
              : "Open menu"
        }
      >
        {open ? <X /> : <Menu />}
      </button>
    </header>
  );
}
function PortfolioFooter({ locale, caseStudy = false }: { locale: "en" | "ar"; caseStudy?: boolean }) {
  const ar = locale === "ar";
  return (
    <footer>
      <Link href={`/${locale}`} className="brand"
        aria-label={ar ? "العودة إلى الصفحة الرئيسية" : "Return to homepage"}>
        <b>MS</b>
      </Link>
      <span>© {new Date().getFullYear()} {ar ? "محمد أحمد شمس" : "Mohamed Ahmed Shams"}</span>
      <Link href={caseStudy ? `/${locale}#projects` : "#home"}>
        {caseStudy ? (ar ? "العودة للمشاريع ↑" : "Back to Projects ↑")
          : (ar ? "العودة للأعلى ↑" : "Back to top ↑")}
      </Link>
    </footer>
  );
}
function Eyebrow({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="eyebrow"
      data-reveal-item="true"
    >
      {children}
    </div>
  );
}

/* Hero entrance choreography lives in CSS (see fidelity.css “Hero entrance”):
   the hidden pre-state applies only while the intro plays
   (html[data-intro-play]), and .motion-ready releases a staggered
   transform/opacity sequence — so it starts with the first-paint clock,
   never at hydration, and returning visitors always see the final hero. */

/* CopyEmail: small ghost CTA beside the contact mailto link. Writes the
   address to the clipboard (with a legacy fallback) and flips to a "Copied"
   state for two seconds; the label change is announced via aria-live. */
function CopyEmail({
  email,
  copy,
  copied,
}: {
  email: string;
  copy: string;
  copied: string;
}) {
  const [done, setDone] = useState(false);
  const timer = useRef<number | null>(null);
  useEffect(
    () => () => {
      if (timer.current) window.clearTimeout(timer.current);
    },
    [],
  );
  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(email);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = email;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    setDone(true);
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setDone(false), 2000);
  };
  return (
    <button
      type="button"
      className={"copy-email" + (done ? " copied" : "")}
      onClick={onCopy}
    >
      {done ? <Check size={13} /> : <Copy size={13} />}
      <span aria-live="polite">{done ? copied : copy}</span>
    </button>
  );
}

/* Animated stat: counts up once when visible, final string preserved exactly.
   Staggered start per index so the three counters do not tick in unison. */
function Stat({ value, label, index }: { value: string; label: string; index: number }) {
  const { ref, text } = useCountUp(value, 1200, index * 160);
  return (
    <div data-reveal-item="true">
      <strong>
        <span ref={ref}>{text}</span>
      </strong>
      <span>{label}</span>
    </div>
  );
}

/* Scroll progress hairline, fixed under the header. */
function ScrollProgress() {
  const progress = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const doc = document.documentElement;
        const max = doc.scrollHeight - window.innerHeight;
        const fraction = max > 0 ? Math.min(1, window.scrollY / max) : 0;
        if (progress.current) progress.current.style.transform = `scaleX(${fraction})`;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);
  return (
    <div className="scroll-progress" aria-hidden="true">
      <div ref={progress} />
    </div>
  );
}
export default function Portfolio() {
  const locale = useLocale() as "en" | "ar";
  const ar = locale === "ar";
  const t = (en: string, arabic: string) => (ar ? arabic : en);
  const heroRoles = ar
    ? ["مهندس أنظمة", "مطوّر SCADA", "متخصص إنترنت الأشياء الصناعي"]
    : ["SCADA Developer", "Industrial IoT Engineer", "Systems Engineer"];
  const tx = (v: Localized) => v[locale];
  const [category, setCategory] = useState("All");
  const [flowPaused, setFlowPaused] = useState(false);
  const [all, setAll] = useState(false);
  const [heroReady, setHeroReady] = useState(false);
  const [heroCinematic, setHeroCinematic] = useState(false);
  const [hasFiltered, setHasFiltered] = useState(false);
  // A first visit animates during the intro handoff. Return visits and deep
  // links render the complete Hero as soon as hydration finishes.
  const onIntroFinished = useCallback((ready: boolean) => {
    if (ready) {
      setHeroCinematic(document.documentElement.hasAttribute("data-intro-play"));
    }
    setHeroReady(ready);
  }, []);
  return (
    <>
      <noscript>
        <style>{".hero-copy > *, .hero-portrait { opacity: 1 !important; transform: none !important; } .scada-trace { stroke-dashoffset: 0 !important; }"}</style>
      </noscript>
      <a className="skip-link" href="#main">
        {t("Skip to content", "انتقل إلى المحتوى")}
      </a>
      <Header />
      <PortfolioIntro locale={locale} onFinished={onIntroFinished} />
      <ScrollProgress />
      <RevealManager />
      <main id="main">
        <section className={"hero" + (heroReady ? " motion-ready" : "") + (heroCinematic ? " is-cinematic" : "")} id="home">
          <div className="hero-portrait" data-hero-item="0">
            <Image
              src="/assets/portrait.webp"
              alt={t("Mohamed Ahmed Shams", "محمد أحمد شمس")}
              fill
              priority
              sizes="(max-width: 700px) 100vw, 75vw"
            />
          </div>
          <div className="industrial" aria-hidden="true" />
          <div className="refinery" aria-hidden="true" />
          <div className="hero-shade" />
          <div className="hero-instrument"><Scada /></div>
          <div className="hero-copy">
            <div className="eyebrow" data-hero-item="1">
              {t("Systems Engineer", "مهندس أنظمة")}
            </div>
            <h1 data-hero-item="2">
              {ar ? (
                <>محمد أحمد شمس</>
              ) : (
                <>
                  Mohamed <br />
                  Ahmed Shams
                </>
              )}
            </h1>
            <h2 data-hero-item="3">
              {t("Engineering Intelligent", "أطوّر أنظمة صناعية ذكية")}
              <br />
              {t("Industrial Systems.", "تربط الواقع بالتكنولوجيا.")}
            </h2>
            <p className="roles" data-hero-item="4" aria-label={heroRoles.join(" | ")}>
              {heroRoles.map((role, i) => (
                <span className="role" key={role}>
                  <bdi>{role}</bdi>
                  {i < heroRoles.length - 1 && (
                    <span className="role-divider" aria-hidden="true">|</span>
                  )}
                </span>
              ))}
            </p>
            <p className="hero-description" data-hero-item="5">
              {t(
                "I design, develop, and integrate intelligent industrial platforms — connecting real-world operations with reliable software, data, and modern digital technologies.",
                "أصمم وأطور وأكامل منصات صناعية ذكية تربط العمليات الفعلية بالمستشعرات والبيانات وأحدث التقنيات الرقمية.",
              )}
            </p>
            <div className="actions">
              <a className="button" href="#projects" data-hero-item="6">
                {t("Explore My Work", "استكشف أعمالي")}
                <ArrowRight size={17} />
              </a>
              <a
                className="button outline"
                href={cv}
                download
                data-hero-item="7"
              >
                {t("Download CV", "تحميل السيرة الذاتية")}
                <Download size={17} />
              </a>
            </div>
          </div>
          <div className="micro">
            REAL OPERATIONS
            <br />
            REAL DATA
            <br />
            SMARTER SOLUTIONS
          </div>
          <a href="#about" className="scroll">
            {t("Scroll", "اكتشف")}
            <ChevronDown size={15} />
          </a>
          <svg
            className="signal-lines"
            viewBox="0 0 1000 180"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            {[0, 12, 25, 38].map((y) => (
              <path
                key={y}
                d={`M0 ${80 + y} C220 ${5 + y},230 ${180 + y},480 ${95 + y} S700 ${15 + y},1000 ${140 + y}`}
                stroke="#1688b5"
                fill="none"
                strokeWidth=".8"
              />
            ))}
          </svg>
        </section>
        <section id="about" className="section about">
          <div className="about-copy" data-reveal-group="true">
            <Eyebrow>{t("About me", "نبذة عني")}</Eyebrow>
            <h2 data-reveal-item="true">
              {t("From Industrial", "من الأنظمة الصناعية")}
              <br />
              {t("Systems to Smarter", "إلى حلول أكثر")}
              <br />
              {t("Solutions.", "ذكاءً.")}
            </h2>
            <p data-reveal-item="true">
              {t(
                "I’m a Systems Engineer at pulse by solutions with hands-on experience in SCADA, Industrial IoT, and digital transformation projects across Egypt and Saudi Arabia. I enjoy building reliable, scalable systems that turn real-world data into meaningful insights and smarter operations.",
                "أنا مهندس أنظمة لدى pulse by solutions، ولدي خبرة عملية في SCADA وإنترنت الأشياء الصناعي ومشروعات التحول الرقمي في مصر والسعودية. أعمل على بناء أنظمة موثوقة وقابلة للتوسع تحوّل بيانات الواقع إلى رؤى مفيدة وعمليات أكثر ذكاءً.",
              )}
            </p>
            <div className="name-mark" data-reveal-item="true" aria-label={t("Mohamed Ahmed Shams", "محمد أحمد شمس")}>
              <span className="name-mark-rule" aria-hidden="true" />
              <span className="name-mark-text" lang={locale}>
                {t("Mohamed Shams", "محمد أحمد شمس")}
              </span>
              <span className="name-mark-subtitle">
                {t("Systems Engineer", "مهندس أنظمة")}
              </span>
            </div>
          </div>
          <div className="about-image" data-reveal="right">
            <Image
              src="/assets/about-real.webp"
              alt={t(
                "Black-and-white portrait of Mohamed Ahmed Shams",
                "صورة أحادية اللون لمحمد أحمد شمس",
              )}
              fill
              sizes="(max-width:700px) 80vw, 35vw"
            />
            <div className="statement">
              {t("Turning", "تحويل")}
              <br />
              {t("Industrial Data", "البيانات الصناعية")}
              <br />
              {t("Into Real Impact.", "إلى أثر حقيقي.")}
            </div>
          </div>
          <div className="stats" data-reveal-group="true">
            {[
              ["7K+", t("Underground Wells", "بئر مياه جوفية")],
              [
                "10K+",
                t("Industrial Sensors (POC)", "حساس صناعي (إثبات مفهوم)"),
              ],
              ["1.3K+", t("Drilling Equipment Assets", "أصل من معدات الحفر")],
            ].map(([n, label], i) => (
              <Stat key={n} value={n} label={label} index={i} />
            ))}
            <p>
              {t(
                "Scale of projects I contributed to as part of a team.",
                "نطاق المشروعات التي ساهمت فيها ضمن فريق عمل.",
              )}
            </p>
          </div>
        </section>
        <section id="projects" className="section">
          <div className="section-heading">
            <div data-reveal-group="true">
              <Eyebrow>{t("Featured projects", "مشاريع مختارة")}</Eyebrow>
              <h2 data-reveal-item="true">{t("Selected Work", "أعمال مختارة")}</h2>
              <p data-reveal-item="true">
                {t(
                  "A selection of industrial and government projects I’ve contributed to.",
                  "مجموعة من المشروعات الصناعية والحكومية التي ساهمت فيها.",
                )}
              </p>
            </div>
            <button
              className="text-link"
              onClick={() => setAll(!all)}
              aria-expanded={all}
            >
              {all
                ? t("Show featured", "عرض المختارة")
                : t("View All Projects", "عرض جميع المشاريع")}
              <ArrowRight size={16} />
            </button>
          </div>
          <div
            className="projects-grid"
            data-expanded={all ? "true" : undefined}
            data-reveal-group="true"
            data-reveal-each="true"
          >
            {visibleProjects(all).map((p, i) => {
              const flagship = !all && i === 0;
              const media = getProjectMedia(p.slug);
              return (
                <Link
                  className={"project-card" + (flagship ? " featured" : "")}
                  key={p.slug}
                  href={`/${locale}/projects/${p.slug}`}
                  data-reveal-item="true"
                >
                  <div className="card-image">
                    <Image
                      className="project-cover-image"
                      src={media.cover.src}
                      alt={tx(media.cover.alt)}
                      fill
                      quality={75}
                      style={{ objectPosition: media.cover.objectPosition }}
                      sizes={
                        flagship
                          ? "(max-width: 850px) 92vw, 749px"
                          : "(max-width: 600px) 92vw, (max-width: 850px) 46vw, 363px"
                      }
                    />
                    {flagship && (
                      <span className="featured-flag">
                        {t("Flagship project", "المشروع الأبرز")}
                      </span>
                    )}
                    {media.cover.illustrative && (
                      <span className="image-label">
                        {t("Licensed illustrative photo", "صورة توضيحية مرخصة")}
                      </span>
                    )}
                  </div>
                  <div className="card-copy">
                    <h3>{tx(p.title)}</h3>
                    <span className="circle-arrow">
                      <ArrowRight size={flagship ? 19 : 17} />
                    </span>
                    <p>{tx(p.sector)}</p>
                    {flagship && <p className="card-note">{tx(p.overview)}</p>}
                    <div className="tags">
                      {(flagship ? p.tags : p.tags.slice(0, 3)).map((tag) => (
                        <span key={tag}>{tag}</span>
                      ))}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
        <section id="skills" className="section">
          <div className="tech-panel">
            <div data-reveal-group="true">
            <Eyebrow>{t("Technical expertise", "الخبرات التقنية")}</Eyebrow>
            <h2 data-reveal-item="true">{t("Tools & Technologies", "الأدوات والتقنيات")}</h2>
            <p data-reveal-item="true">
              {t(
                "The technologies and tools I work with to build industrial and digital solutions.",
                "التقنيات والأدوات التي أستخدمها لبناء الحلول الصناعية والرقمية.",
              )}
            </p>
            </div>
            <div className="flow-wrap flow-showcase" data-reveal="up"
              data-paused={flowPaused ? "true" : "false"}
              role="region"
              aria-label={t("Industrial data flow", "مسار البيانات الصناعية")}>
              <div className="flow-showcase-heading">
                <span className="flow-showcase-indicator" aria-hidden="true" />
                <span>{t("INDUSTRIAL DATA FLOW", "مسار البيانات الصناعية")}</span>
                <span className="flow-showcase-caption">
                  {t("A live illustration of system integration", "تصوّر متحرك لتكامل الأنظمة")}
                </span>
                <button type="button" className="flow-showcase-toggle"
                  aria-pressed={flowPaused}
                  aria-label={flowPaused
                    ? t("Resume industrial data flow", "استئناف حركة تدفق البيانات")
                    : t("Pause industrial data flow", "إيقاف حركة تدفق البيانات مؤقتًا")}
                  onClick={() => setFlowPaused(value => !value)}>
                  {flowPaused ? t("Play", "تشغيل") : t("Pause", "إيقاف")}
                </button>
              </div>
              <FlowDiagram
                paused={flowPaused}
                labels={{
                  from: t("PLC / Sensors", "PLC / الحساسات"),
                  via: t("OPC UA · MQTT", "OPC UA · MQTT"),
                  to: t("Ignition SCADA", "Ignition SCADA"),
                  db: t("Databases", "قواعد البيانات"),
                  dash: t("Dashboards", "لوحات المعلومات"),
                }}
              />
              <small className="flow-note">
                {t(
                  "Illustrative integration example — the data path I build with; it does not describe every project.",
                  "مثال توضيحي لمسار البيانات الذي أبنيه؛ لا يصف كل المشروعات.",
                )}
              </small>
            </div>
            <div className="filters">
              {[
                "All",
                "Industrial Platforms",
                "Connectivity",
                "Programming",
                "Databases",
                "Tools & AI",
              ].map((c, i) => (
                <button
                  key={c}
                  aria-pressed={category === c}
                  onClick={() => {
                    if (category !== c) {
                      setHasFiltered(true);
                      setCategory(c);
                    }
                  }}
                  className={category === c ? "active" : ""}
                >
                  {ar
                    ? [
                        "الكل",
                        "المنصات الصناعية",
                        "الاتصال",
                        "البرمجة",
                        "قواعد البيانات",
                        "الأدوات والذكاء الاصطناعي",
                      ][i]
                    : c}
                </button>
              ))}
            </div>
            <div className="skills-grid" data-reveal-group="true" data-reveal-each="true" data-filtered={hasFiltered ? "true" : "false"}>
              {[
                ...skills.filter((s) => s[0] !== "Industrial IoT"),
                ...skills.filter((s) => s[0] === "Industrial IoT"),
              ]
                .filter((s) => category === "All" || s[3] === category)
                .map((s, i) => (
                  /* The umbrella capability is already sorted last; letting it span
                     two columns makes 15 tools fill a 2- or 4-column grid exactly
                     instead of leaving a dangling cell. */
                  <div
                    className={
                      s[0] === "Industrial IoT"
                        ? "skill-tile umbrella"
                        : "skill-tile"
                    }
                    key={`${category}-${s[0]}`}
                    data-reveal-item="true"
                    style={{ "--ri": Math.min(i, 7) } as React.CSSProperties}
                  >
                    <TechSymbol name={s[0]} />
                    <div>
                      <h3>{s[0]}</h3>
                      <small>{s[ar ? 2 : 1]}</small>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </section>
        <section id="experience" className="section journey">
          <div data-reveal-group="true">
          <Eyebrow>{t("Professional experience", "الخبرة المهنية")}</Eyebrow>
          <h2 data-reveal-item="true">{t("My Journey", "مسيرتي المهنية")}</h2>
          <p data-reveal-item="true">
            {t(
              "Key projects and responsibilities throughout my career.",
              "أبرز المشروعات والمسؤوليات خلال مسيرتي المهنية.",
            )}
          </p>
          </div>
          <div className="timeline" data-reveal-group="true">
            <span className="timeline-progress" aria-hidden="true" />
            <div className="employer" data-reveal-item="true">
              pulse<small>by solutions</small>
            </div>
            <div className="career" data-reveal-item="true">
              <div className="career-title">
                <div>
                  <h3>{t("Systems Engineer", "مهندس أنظمة")}</h3>
                  <span>pulse by solutions</span>
                </div>
                <time>{t("Sep 2024 – Present", "سبتمبر 2024 – حتى الآن")}</time>
              </div>
              <ul>
                {projects.map((p) => (
                  <li key={p.slug} data-reveal="up">
                    <Link href={`/${locale}/projects/${p.slug}`}>
                      {tx(p.title)}
                    </Link>
                    <span dir="ltr">
                      {ar ? p.date.replace("Present", "حتى الآن") : p.date}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <details className="education">
            <summary>{t("Education & languages", "التعليم واللغات")}</summary>
            <p>
              {t(
                "B.Sc., Electrical Engineering · Menoufia University · July 2024",
                "بكالوريوس الهندسة الكهربائية · جامعة المنوفية · يوليو 2024",
              )}
            </p>
            <p>
              {t(
                "Arabic: Native · English: Very good",
                "العربية: اللغة الأم · الإنجليزية: جيد جدًا",
              )}
            </p>
          </details>
        </section>
        <section id="certifications" className="section">
          <div data-reveal-group="true">
          <Eyebrow>{t("Certifications", "الشهادات")}</Eyebrow>
          <h2 data-reveal-item="true">{t("Continuous Learning", "تعلّم مستمر")}</h2>
          <p data-reveal-item="true">
            {t(
              "Professional certifications and key training courses.",
              "شهادات مهنية ودورات تدريبية متخصصة.",
            )}
          </p>
          </div>
          <PlatformTicker locale={locale} />
          <h3 className="featured-credentials-heading">{t("Selected Credentials", "شهادات مختارة")}</h3>
          <div className="cert-grid featured-credentials-grid" data-reveal-group="true" data-reveal-each="true">
            {credentials.filter((c) => c[0] !== "Dataiku ML Practitioner Certified").map((c) => (
              <article className="cert-card" key={c[0]} data-reveal-item="true">
                <div className={`cert-brand ${c[4]?.toLowerCase()}`}>
                  <Image
                    src={certMark(c[4]!)}
                    alt={c[4]}
                    width={96}
                    height={96}
                  />
                </div>
                <div>
                  <h3>{c[ar ? 1 : 0]}</h3>
                  <p>{c[2]}</p>
                  <time>{c[3]}</time>
                  {certificateLinksByCard[c[0]]?.length > 0 && (
                    <div className="cert-pdf-links">
                      {certificateLinksByCard[c[0]].map((id) => {
                        const doc = certificateDocuments.find((item) => item.id === id);
                        if (!doc) return null;
                        return (
                          <a key={id} href={doc.pdf} target="_blank" rel="noopener noreferrer"
                            aria-label={`${t("View PDF", "عرض الشهادة")}: ${ar ? doc.titleAr : doc.title}`}>
                            <FileText size={13} />
                            {id === "dataiku-core"
                              ? t("Core PDF", "الشهادة الأساسية")
                              : id === "dataiku-advanced"
                                ? t("Advanced PDF", "الشهادة المتقدمة")
                                : t("View PDF", "عرض الشهادة")}
                          </a>
                        );
                      })}
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
          <div className="certificate-library" id="certificate-library">
            <div className="certificate-library-heading">
              <div>
                <h3>{t("Certificate Library", "مكتبة الشهادات")}</h3>
                <p>{t(
                  "Browse all 10 available original documents, including additional credentials and training.",
                  "تصفّح ١٠ ملفات أصلية متاحة، تشمل اعتمادات ودورات تدريبية إضافية.",
                )}</p>
              </div>
              <span className="certificate-library-count">
                {certificateDocuments.length} {t("PDFs", "ملفات PDF")}
              </span>
            </div>
            <div className="certificate-library-rail" aria-label={t("Browse certificate PDFs", "استعراض ملفات الشهادات")}>
              {certificateDocuments.map((doc) => (
                <article className="certificate-document" key={doc.id}>
                  <div className="certificate-document-top">
                    <span className="certificate-document-icon">
                      {doc.brand ? (
                        <Image src={certMark(doc.brand)} alt="" width={40} height={40} />
                      ) : <FileText size={25} />}
                    </span>
                    <small>PDF</small>
                  </div>
                  <h4>{ar ? doc.titleAr : doc.title}</h4>
                  <p>{doc.issuer}</p>
                  <div className="certificate-document-actions">
                    <a href={doc.pdf} target="_blank" rel="noopener noreferrer">
                      <ExternalLink size={14} />
                      {t("View", "عرض")}
                    </a>
                    <a href={doc.pdf} download aria-label={`${t("Download PDF", "تنزيل الشهادة")}: ${ar ? doc.titleAr : doc.title}`}>
                      <Download size={14} />
                      {t("Download", "تنزيل")}
                    </a>
                  </div>
                </article>
              ))}
            </div>
            <p className="certificate-library-hint">
              {t("Scroll horizontally to explore all documents.", "مرّر أفقياً لاستعراض جميع الملفات.")}
            </p>
          </div>
          <details className="training">
            <summary>
              {t(
                "All additional training courses",
                "جميع الدورات التدريبية الإضافية",
              )}
            </summary>
            <div className="cert-grid">
              {training.map((c) => (
                <article className="cert-card" key={c[0]}>
                  <div>
                    <h3>{c[ar ? 1 : 0]}</h3>
                    <p>{c[2]}</p>
                    <time>{c[3]}</time>
                    {certificateLinksByCard[c[0]]?.map((id) => {
                      const doc = certificateDocuments.find((item) => item.id === id);
                      if (!doc) return null;
                      return <a key={id} className="training-pdf-link" href={doc.pdf} target="_blank" rel="noopener noreferrer">
                        <FileText size={14} /> {t("View certificate PDF", "عرض شهادة PDF")}
                      </a>;
                    })}
                  </div>
                </article>
              ))}
            </div>
          </details>
        </section>
        <section id="contact" className="section contact">
          <div className="contact-copy" data-reveal-group="true">
            <Eyebrow>{t("Contact", "تواصل معي")}</Eyebrow>
            <h2 data-reveal-item="true">
              {t(
                "Let’s Build Something Intelligent.",
                "لنصنع معًا حلولًا أكثر ذكاءً.",
              )}
            </h2>
            <p data-reveal-item="true">
              {t(
                "I’m always open to discussing new opportunities, interesting projects, or ideas related to SCADA, IIoT, and industrial systems.",
                "يسعدني مناقشة الفرص الجديدة والمشروعات والأفكار المتعلقة بأنظمة SCADA وإنترنت الأشياء الصناعي والأنظمة الصناعية.",
              )}
            </p>
            <a href="mailto:mohamed.ah.shams@gmail.com" data-reveal-item="true">
              <Mail size={19} />
              <span dir="ltr">mohamed.ah.shams@gmail.com</span>
            </a>
            <div data-reveal-item="true">
            <CopyEmail
              email="mohamed.ah.shams@gmail.com"
              copy={t("Copy", "نسخ")}
              copied={t("Copied", "تم النسخ")}
            />
            </div>
            <a
              href="https://github.com/Mohamed-Shams"
              target="_blank"
              rel="noreferrer"
              data-reveal-item="true"
            >
              <Github size={19} />
              {t("GitHub profile", "ملف GitHub")}
            </a>
            <a href={cv} download className="button outline" data-reveal-item="true">
              {t("Download CV", "تحميل السيرة الذاتية")}
              <Download size={17} />
            </a>
          </div>
          <GlobeArt locale={locale} />
        </section>
      </main>
      <PortfolioFooter locale={locale} />
    </>
  );
}
export function CaseStudy({ slug }: { slug: string }) {
  const locale = useLocale() as "ar" | "en";
  const ar = locale === "ar";
  const p = projects.find((p) => p.slug === slug)!;
  const t = (a: string, b: string) => (ar ? b : a);
  const media = getProjectMedia(p.slug);
  const gallery = getProjectGallery(p);
  const total = gallery.length;
  const [idx, setIdx] = useState(0);
  const item = gallery[idx];
  const next = projects[(projects.indexOf(p) + 1) % projects.length];
  const go = (delta: number) => setIdx((i) => (i + delta + total) % total);
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      go(ar ? 1 : -1);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      go(ar ? -1 : 1);
    }
  };
  return (
    <>
      <a href="#main" className="skip-link">
        {t("Skip to content", "انتقل إلى المحتوى")}
      </a>
      <Header />
      <RevealManager />
      <main id="main" className="case section">
        <Link className="back-link" href={`/${locale}#projects`}>
          {ar ? <ArrowRight size={16} /> : <ArrowLeft size={16} />}
          {t("Back to Projects", "العودة للمشاريع")}
        </Link>
        <div className="case-heading" data-reveal="up">
          <div>
            <Eyebrow>{t("Project case study", "دراسة حالة")}</Eyebrow>
            <h1>{p.title[locale]}</h1>
            <div className="tags">
              {p.tags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
          </div>
          <p className="case-meta">
            <bdi dir={ar ? "auto" : "ltr"}>{projectPeriod(p.date, locale)}</bdi>
            <span>{p.sector[locale]}</span>
          </p>
        </div>

        {/* Gallery — shared cover photograph first, followed by the three
            original vector plates (site scene, architecture path, operations
            view). Arrow keys work when the stage has focus. */}
        <figure className="case-hero" data-reveal="up">
          <div
            className="case-stage"
            role="group"
            tabIndex={0}
            onKeyDown={onKey}
            aria-label={t("Project gallery", "معرض المشروع")}
          >
            {item.kind === "cover" ? (
              <Image
                key="cover"
                className="case-cover-image project-cover-image"
                src={media.cover.src}
                alt={media.cover.alt[locale]}
                fill
                priority
                quality={75}
                sizes="(max-width: 850px) 94vw, 1180px"
                style={{ objectPosition: media.cover.objectPosition }}
              />
            ) : (
              <ProjectArt
                key={item.kind}
                project={p}
                kind={item.kind}
                title={p.title[locale]}
                label={item.caption[locale]}
                locale={locale}
              />
            )}
            <div className="case-controls">
              <button
                type="button"
                className="case-nav"
                onClick={() => go(-1)}
                aria-label={t("Previous image", "الصورة السابقة")}
              >
                {ar ? <ArrowRight size={18} /> : <ArrowLeft size={18} />}
              </button>
              <span className="case-counter" aria-live="polite" dir="ltr">
                {idx + 1} / {total}
              </span>
              <button
                type="button"
                className="case-nav"
                onClick={() => go(1)}
                aria-label={t("Next image", "الصورة التالية")}
              >
                {ar ? <ArrowLeft size={18} /> : <ArrowRight size={18} />}
              </button>
            </div>
          </div>
          <figcaption className="case-caption">
            <span className="case-caption-text">{item.caption[locale]}</span>
            <span className="case-illustrative">
              {item.kind === "cover"
                ? media.cover.source.rightsNote[locale]
                : t(
                    "Original illustrative artwork — not a project photograph.",
                    "عمل فني توضيحي أصلي — وليس صورة فعلية للمشروع.",
                  )}
            </span>
          </figcaption>
          <div
            className="thumbnails"
            role="group"
            aria-label={t("Gallery thumbnails", "مصغّرات المعرض")}
          >
            {gallery.map((g, i) => (
              <button
                key={g.kind}
                type="button"
                aria-pressed={idx === i}
                aria-label={`${t("View image", "عرض الصورة")} ${i + 1} — ${
                  g.caption[locale]
                }`}
                onClick={() => setIdx(i)}
              >
                <span className="thumb-art" aria-hidden="true">
                  {g.kind === "cover" ? (
                    <Image
                      className="thumb-cover-image project-cover-image"
                      src={media.cover.src}
                      alt=""
                      fill
                      quality={75}
                      sizes="(max-width: 600px) 22vw, 270px"
                      style={{ objectPosition: media.cover.objectPosition }}
                    />
                  ) : (
                    <ProjectArt
                      project={p}
                      kind={g.kind}
                      title={p.title[locale]}
                      label=""
                      locale={locale}
                      slice
                    />
                  )}
                </span>
                <span className="thumb-index" aria-hidden="true">{i + 1}</span>
              </button>
            ))}
          </div>
        </figure>

        <div className="case-overview" data-reveal="up">
          <section className="case-summary">
            <h2>{t("Project Overview", "نظرة عامة")}</h2>
            <p className="case-lead">{p.overview[locale]}</p>
          </section>
          <aside
            className="case-facts"
            aria-label={t("At a glance", "لمحة سريعة")}
          >
            <h3>{t("At a glance", "لمحة سريعة")}</h3>
            <dl>
              <div>
                <dt>{t("Period", "الفترة")}</dt>
                <dd><bdi dir={ar ? "auto" : "ltr"}>{projectPeriod(p.date, locale)}</bdi></dd>
              </div>
              <div>
                <dt>{t("Sector", "القطاع")}</dt>
                <dd>{p.sector[locale]}</dd>
              </div>
              {p.scale.map((s) => (
                <div key={s.value}>
                  <dt>{s.label[locale]}</dt>
                  <dd dir="ltr">{s.value}</dd>
                </div>
              ))}
            </dl>
          </aside>
        </div>

        <div className="case-columns" data-reveal="up">
          <section className="case-resp">
            <h2>{t("My Responsibilities", "مسؤولياتي")}</h2>
            <ol>
              {p.responsibilities.map((r, i) => (
                <li key={i}>
                  <span className="resp-num" aria-hidden="true">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span>{r[locale]}</span>
                </li>
              ))}
            </ol>
          </section>
          <section className="case-tech" aria-labelledby="case-tech-h">
            <h2 id="case-tech-h">{t("Technology", "التقنيات")}</h2>
            <div className="case-tools">
              {p.tags.map((tag) => {
                const note = techNotes[tag];
                return (
                  <div className="case-tool" key={tag}>
                    <span className="tool-icon">
                      <TechIcon name={tag} size={23} />
                    </span>
                    <div>
                      <h3>{tag}</h3>
                      {note && <p>{note[locale]}</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        {/* Architecture — only the four steps recorded in content.ts, drawn
            wide for desktop and re-rendered as a text ladder on small screens
            so no diagram type ever scales below legibility. */}
        <section className="case-arch" data-reveal="up">
          <h2>{t("Architecture", "البنية المعمارية")}</h2>
          <div className="arch-frame">
            <div className="arch-svg">
              <ProjectArt
                project={p}
                kind="flow"
                title={t("Architecture", "البنية المعمارية")}
                label={p.architecture.note[locale]}
                locale={locale}
              />
            </div>
            <ol className="arch-steps">
              {p.architecture.nodes.map((n, i) => (
                <li
                  key={i}
                  className={
                    i === 0 || i === p.architecture.nodes.length - 1
                      ? "accent"
                      : ""
                  }
                >
                  <span className="arch-num" aria-hidden="true">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span>{n[locale]}</span>
                </li>
              ))}
            </ol>
          </div>
          <p className="arch-note">{p.architecture.note[locale]}</p>
        </section>

        <div className="next-project" data-reveal="up" data-reveal-delay="1">
          <Link className="text-link" href={`/${locale}/projects/${next.slug}`}>
            {t("Next project", "المشروع التالي")}
            <span className="next-title">{next.title[locale]}</span>
            {ar ? <ArrowLeft size={18} /> : <ArrowRight size={18} />}
          </Link>
        </div>
      </main>
      <PortfolioFooter locale={locale} caseStudy />
    </>
  );
}
