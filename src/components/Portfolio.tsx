"use client";
import { useRef, useState, useEffect } from "react";
import { useLocale } from "next-intl";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  ArrowLeft,
  Download,
  Menu,
  X,
  Mail,
  Globe,
  Activity,
  Database,
  Radio,
  ChevronDown,
  Copy,
  Check,
} from "lucide-react";
import {
  projects,
  skills,
  credentials,
  training,
  Localized,
} from "@/lib/content";
import { GlobeArt, Scada, TechSymbol, FlowDiagram } from "./TechnicalVisuals";
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

/* Card art is a display-resolution re-render of the same supplied illustration
   (see docs/STAGE1-VISUAL-AUDIT.md); no subjects were replaced. */
const cardArt = (image: string) => `/assets/card/card-${image}.webp`;
export function Header() {
  const locale = useLocale();
  const ar = locale === "ar";
  const path = usePathname();
  const [open, setOpen] = useState(false);
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
    <header className="header">
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
        className="menu"
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
function Eyebrow({
  children,
  reveal,
  delay,
}: {
  children: React.ReactNode;
  reveal?: boolean;
  delay?: "1" | "2" | "3";
}) {
  return (
    <div
      className="eyebrow"
      {...(reveal ? { "data-reveal": "up", "data-reveal-delay": delay } : {})}
    >
      {children}
    </div>
  );
}

/* One-shot hero entrance: opacity/transform only, so nothing shifts layout.
   `useReducedMotion` short-circuits it to the final state. */
const heroEase: [number, number, number, number] = [0.22, 0.61, 0.36, 1];
const heroItem = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: heroEase } },
};
const heroStagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.085, delayChildren: 0.05 } },
};
const heroActions = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};

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

/* Animated stat: counts up once when visible, final string preserved exactly. */
function Stat({ value, label }: { value: string; label: string }) {
  const { ref, text } = useCountUp(value);
  return (
    <div>
      <strong>
        <span ref={ref}>{text}</span>
      </strong>
      <span>{label}</span>
    </div>
  );
}

/* Scroll progress hairline, fixed under the header. */
function ScrollProgress() {
  const [pct, setPct] = useState(0);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const doc = document.documentElement;
        const max = doc.scrollHeight - window.innerHeight;
        setPct(max > 0 ? Math.min(100, (window.scrollY / max) * 100) : 0);
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
      <div style={{ width: pct + "%" }} />
    </div>
  );
}
export default function Portfolio() {
  const locale = useLocale() as "en" | "ar";
  const ar = locale === "ar";
  const t = (en: string, arabic: string) => (ar ? arabic : en);
  const tx = (v: Localized) => v[locale];
  const [category, setCategory] = useState("All");
  const [all, setAll] = useState(false);
  const reduced = useReducedMotion();
  return (
    <>
      <a className="skip-link" href="#main">
        {t("Skip to content", "انتقل إلى المحتوى")}
      </a>
      <Header />
      <ScrollProgress />
      <RevealManager />
      <main id="main">
        <section className="hero" id="home">
          <div className="hero-portrait">
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
          <Scada />
          <motion.div
            className="hero-copy"
            variants={heroStagger}
            initial={reduced ? false : "hidden"}
            animate="show"
          >
            <motion.div className="eyebrow" variants={heroItem}>
              {t("Systems Engineer", "مهندس أنظمة")}
            </motion.div>
            <motion.h1 variants={heroItem}>
              {ar ? (
                <>محمد أحمد شمس</>
              ) : (
                <>
                  Mohamed <br />
                  Ahmed Shams
                </>
              )}
            </motion.h1>
            <motion.h2 variants={heroItem}>
              {t("Engineering Intelligent", "أطوّر أنظمة صناعية ذكية")}
              <br />
              {t("Industrial Systems.", "تربط الواقع بالتكنولوجيا.")}
            </motion.h2>
            <motion.p className="roles" variants={heroItem}>
              {t(
                "SCADA Developer | Industrial IoT Engineer | Systems Engineer",
                "مهندس أنظمة | مطوّر SCADA | متخصص إنترنت الأشياء الصناعي",
              )}
            </motion.p>
            <motion.p className="hero-description" variants={heroItem}>
              {t(
                "I design, develop, and integrate intelligent industrial platforms — connecting real-world operations with reliable software, data, and modern digital technologies.",
                "أصمم وأطور وأكامل منصات صناعية ذكية تربط العمليات الفعلية بالمستشعرات والبيانات وأحدث التقنيات الرقمية.",
              )}
            </motion.p>
            <motion.div className="actions" variants={heroActions}>
              <motion.a className="button" href="#projects" variants={heroItem}>
                {t("Explore My Work", "استكشف أعمالي")}
                <ArrowRight size={17} />
              </motion.a>
              <motion.a
                className="button outline"
                href={cv}
                download
                variants={heroItem}
              >
                {t("Download CV", "تحميل السيرة الذاتية")}
                <Download size={17} />
              </motion.a>
            </motion.div>
          </motion.div>
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
          <div className="about-copy">
            <Eyebrow reveal>{t("About me", "نبذة عني")}</Eyebrow>
            <h2 data-reveal="up" data-reveal-delay="1">
              {t("From Industrial", "من الأنظمة الصناعية")}
              <br />
              {t("Systems to Smarter", "إلى حلول أكثر")}
              <br />
              {t("Solutions.", "ذكاءً.")}
            </h2>
            <p data-reveal="up" data-reveal-delay="2">
              {t(
                "I’m a Systems Engineer at pulse by solutions with hands-on experience in SCADA, Industrial IoT, and digital transformation projects across Egypt and Saudi Arabia. I enjoy building reliable, scalable systems that turn real-world data into meaningful insights and smarter operations.",
                "أنا مهندس أنظمة لدى pulse by solutions، ولدي خبرة عملية في SCADA وإنترنت الأشياء الصناعي ومشروعات التحول الرقمي في مصر والسعودية. أعمل على بناء أنظمة موثوقة وقابلة للتوسع تحوّل بيانات الواقع إلى رؤى مفيدة وعمليات أكثر ذكاءً.",
              )}
            </p>
            <div className="signature" data-reveal="up" data-reveal-delay="3">
              <Image
                src="/assets/signature.webp"
                alt="Mohamed Shams"
                width={276}
                height={66}
              />
            </div>
          </div>
          <div className="about-image" data-reveal="up">
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
          <div className="stats" data-reveal="up">
            {[
              ["7K+", t("Underground Wells", "بئر مياه جوفية")],
              [
                "10K+",
                t("Industrial Sensors (POC)", "حساس صناعي (إثبات مفهوم)"),
              ],
              ["1.3K+", t("Drilling Equipment Assets", "أصل من معدات الحفر")],
            ].map(([n, label]) => (
              <Stat key={n} value={n} label={label} />
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
            <div data-reveal="up">
              <Eyebrow>{t("Featured projects", "مشاريع مختارة")}</Eyebrow>
              <h2>{t("Selected Work", "أعمال مختارة")}</h2>
              <p>
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
            className={"projects-grid" + (all ? " expanded" : "")}
            data-reveal="up"
          >
            {visibleProjects(all).map((p, i) => {
              const flagship = !all && i === 0;
              return (
                <Link
                  className={"project-card" + (flagship ? " featured" : "")}
                  key={p.slug}
                  href={`/${locale}/projects/${p.slug}`}
                >
                  <div className="card-image">
                    <Image
                      src={cardArt(p.image)}
                      alt=""
                      fill
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
                    <span className="image-label">
                      {t("Illustrative image", "صورة توضيحية")}
                    </span>
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
            <Eyebrow reveal>{t("Technical expertise", "الخبرات التقنية")}</Eyebrow>
            <h2 data-reveal="up" data-reveal-delay="1">{t("Tools & Technologies", "الأدوات والتقنيات")}</h2>
            <p data-reveal="up" data-reveal-delay="2">
              {t(
                "The technologies and tools I work with to build industrial and digital solutions.",
                "التقنيات والأدوات التي أستخدمها لبناء الحلول الصناعية والرقمية.",
              )}
            </p>
            <div className="flow-wrap" data-reveal="up">
              <FlowDiagram
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
                  onClick={() => setCategory(c)}
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
            <div className="skills-grid" data-reveal="up">
              {[
                ...skills.filter((s) => s[0] !== "Industrial IoT"),
                ...skills.filter((s) => s[0] === "Industrial IoT"),
              ]
                .filter((s) => category === "All" || s[3] === category)
                .map((s) => (
                  /* The umbrella capability is already sorted last; letting it span
                     two columns makes 15 tools fill a 2- or 4-column grid exactly
                     instead of leaving a dangling cell. */
                  <div
                    className={
                      s[0] === "Industrial IoT"
                        ? "skill-tile umbrella"
                        : "skill-tile"
                    }
                    key={s[0]}
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
          <Eyebrow reveal>{t("Professional experience", "الخبرة المهنية")}</Eyebrow>
          <h2 data-reveal="up" data-reveal-delay="1">{t("My Journey", "مسيرتي المهنية")}</h2>
          <p data-reveal="up" data-reveal-delay="2">
            {t(
              "Key projects and responsibilities throughout my career.",
              "أبرز المشروعات والمسؤوليات خلال مسيرتي المهنية.",
            )}
          </p>
          <div className="timeline" data-reveal="up">
            <div className="employer">
              pulse<small>by solutions</small>
            </div>
            <div className="career">
              <div className="career-title">
                <div>
                  <h3>{t("Systems Engineer", "مهندس أنظمة")}</h3>
                  <span>pulse by solutions</span>
                </div>
                <time>{t("Sep 2024 – Present", "سبتمبر 2024 – حتى الآن")}</time>
              </div>
              <ul>
                {projects.map((p) => (
                  <li key={p.slug}>
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
          <Eyebrow reveal>{t("Certifications", "الشهادات")}</Eyebrow>
          <h2 data-reveal="up" data-reveal-delay="1">{t("Continuous Learning", "تعلّم مستمر")}</h2>
          <p data-reveal="up" data-reveal-delay="2">
            {t(
              "Professional certifications and key training courses.",
              "شهادات مهنية ودورات تدريبية متخصصة.",
            )}
          </p>
          <div className="cert-grid" data-reveal="up">
            {[...credentials, [...training[0], "SIEMENS"]].map((c) => (
              <article className="cert-card" key={c[0]}>
                <div className={`cert-brand ${c[4]?.toLowerCase()}`}>
                  <Image
                    src={`/assets/cert-${c[4]?.toLowerCase()}.webp`}
                    alt={c[4]}
                    width={88}
                    height={88}
                  />
                </div>
                <div>
                  <h3>{c[ar ? 1 : 0]}</h3>
                  <p>{c[2]}</p>
                  <time>{c[3]}</time>
                  {c[4] === "SIEMENS" && (
                    <small>{t("Training course", "دورة تدريبية")}</small>
                  )}
                </div>
              </article>
            ))}
          </div>
          <details className="training">
            <summary>
              {t(
                "All additional training courses",
                "جميع الدورات التدريبية الإضافية",
              )}
            </summary>
            <div className="cert-grid">
              {training.slice(1).map((c) => (
                <article className="cert-card" key={c[0]}>
                  <div>
                    <h3>{c[ar ? 1 : 0]}</h3>
                    <p>{c[2]}</p>
                    <time>{c[3]}</time>
                  </div>
                </article>
              ))}
            </div>
          </details>
        </section>
        <section id="contact" className="section contact" data-reveal="fade">
          <div className="contact-copy">
            <Eyebrow>{t("Contact", "تواصل معي")}</Eyebrow>
            <h2>
              {t(
                "Let’s Build Something Intelligent.",
                "لنصنع معًا حلولًا أكثر ذكاءً.",
              )}
            </h2>
            <h3 lang="ar" dir="rtl">
              خلينا نبني حاجة ذكية مع بعض
            </h3>
            <p>
              {t(
                "I’m always open to discussing new opportunities, interesting projects, or ideas related to SCADA, IIoT, and industrial systems.",
                "يسعدني مناقشة الفرص الجديدة والمشروعات والأفكار المتعلقة بأنظمة SCADA وإنترنت الأشياء الصناعي والأنظمة الصناعية.",
              )}
            </p>
            <a href="mailto:mohamed.ah.shams@gmail.com">
              <Mail size={19} />
              <span dir="ltr">mohamed.ah.shams@gmail.com</span>
            </a>
            <CopyEmail
              email="mohamed.ah.shams@gmail.com"
              copy={t("Copy", "نسخ")}
              copied={t("Copied", "تم النسخ")}
            />
            <a
              href="https://mohamed-shams.netlify.app/"
              target="_blank"
              rel="noreferrer"
            >
              <Globe size={19} />
              {t("Professional portfolio", "الموقع المهني")}
            </a>
            <a href={cv} download className="button outline">
              {t("Download CV", "تحميل السيرة الذاتية")}
              <Download size={17} />
            </a>
          </div>
          <GlobeArt />
        </section>
      </main>
      <footer>
        <Link href={`/${locale}`} className="brand">
          <b>MS</b>
        </Link>
        <span>
          © {new Date().getFullYear()}{" "}
          {t("Mohamed Ahmed Shams", "محمد أحمد شمس")}
        </span>
        <a href="#home">{t("Back to top ↑", "العودة للأعلى ↑")}</a>
      </footer>
    </>
  );
}
export function CaseStudy({ slug }: { slug: string }) {
  const locale = useLocale() as "ar" | "en";
  const ar = locale === "ar";
  const p = projects.find((p) => p.slug === slug)!;
  const [photo, setPhoto] = useState(p.image);
  const t = (a: string, b: string) => (ar ? b : a);
  return (
    <>
      <Header />
      <RevealManager />
      <main className="case section">
        <Link className="back-link" href={`/${locale}#projects`}>
          <ArrowLeft size={16} />
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
          <p dir="ltr">
            {p.date}
            <br />
            {p.sector[locale]}
          </p>
        </div>
        <div className="case-grid" data-reveal="up">
          <div>
            <div className="case-photo">
              <Image
                src={`/assets/${photo}.webp`}
                alt={t(
                  "Illustrative industrial scene from the supplied design reference; not an actual project photograph.",
                  "مشهد صناعي توضيحي من المرجع التصميمي المقدم، وليس صورة فعلية للمشروع.",
                )}
                fill
                priority
                sizes="(max-width:700px) 90vw, 55vw"
              />
            </div>
            <p className="caption">
              {t(
                "Reference imagery · Illustrative, not actual project photography",
                "صور مرجعية توضيحية · ليست صورًا فعلية للمشروع",
              )}
            </p>
            <div className="thumbnails">
              {[p.image, "plant", "city"].map((img, i) => (
                <button
                  key={i}
                  aria-label={`${t("View image", "عرض الصورة")} ${i + 1}`}
                  aria-pressed={photo === img}
                  onClick={() => setPhoto(img)}
                >
                  <Image
                    src={`/assets/${img}.webp`}
                    alt=""
                    fill
                    sizes="160px"
                  />
                </button>
              ))}
            </div>
          </div>
          <div className="case-text">
            <h2>{t("Project Overview", "نظرة عامة")}</h2>
            <p>{p.overview[locale]}</p>
            <h2>{t("My Responsibilities", "مسؤولياتي")}</h2>
            <ul>
              {p.responsibilities.map((r, i) => (
                <li key={i}>{r[locale]}</li>
              ))}
            </ul>
            <h2>{t("Key Technologies", "التقنيات الرئيسية")}</h2>
            <div className="case-tools">
              {p.tags.map((tag, i) => (
                <div key={tag}>
                  {i % 3 === 0 ? (
                    <Activity />
                  ) : i % 3 === 1 ? (
                    <Database />
                  ) : (
                    <Radio />
                  )}
                  <span>{tag}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="next-project" data-reveal="up" data-reveal-delay="1">
          <Link
            className="text-link"
            href={`/${locale}/projects/${projects[(projects.indexOf(p) + 1) % projects.length].slug}`}
          >
            {t("Next project", "المشروع التالي")}
            <ArrowRight size={18} />
          </Link>
        </div>
      </main>
    </>
  );
}
