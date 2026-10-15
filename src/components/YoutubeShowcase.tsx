import Image from "next/image";
import { ArrowUpRight, Play, Youtube } from "lucide-react";

/* Video links, titles and durations migrated from the original portfolio.
   Thumbnails are local copies of the original assets: visiting this section
   does not contact YouTube until the visitor chooses to watch a video. */
export const videos = [
  {
    id: "GE4CouSUliU",
    title: "AI-Driven SCADA Alarms",
    topic: "Ignition · n8n · Docker",
    description: {
      en: "Self-hosted AI agents and a Dockerized Ignition SCADA alarm workflow.",
      ar: "تكامل وكلاء الذكاء الاصطناعي مع إنذارات Ignition SCADA باستخدام Docker.",
    },
    duration: "1:57",
    uploadDate: "2025-06-14",
  },
  {
    id: "2ppJlu0Q-Xc",
    title: "Smart Hot Food Vending Machine Dashboard",
    topic: "Ignition SCADA · Industrial UI",
    description: {
      en: "A complete Ignition dashboard for monitoring an automated hot-food vending machine.",
      ar: "لوحة Ignition متكاملة لمراقبة ماكينة بيع الطعام الساخن الآلية.",
    },
    duration: "6:16",
    uploadDate: "2024-08-25",
  },
  {
    id: "ZLcIaFrONpU",
    title: "Siemens PLC Tags to JSON",
    topic: "Siemens PLC · Ignition Exchange",
    description: {
      en: "Convert Siemens PLC tags into a reusable JSON structure for Ignition.",
      ar: "تحويل وسوم Siemens PLC إلى صيغة JSON قابلة للاستخدام في Ignition.",
    },
    duration: "1:11",
    uploadDate: "2024-08-11",
  },
  {
    id: "JfH1uBpWu-I",
    title: "Vending Machine Admin Dashboard",
    topic: "Ignition SCADA · Main View",
    description: {
      en: "The main administration screen of an Ignition SCADA vending-machine project.",
      ar: "الواجهة الرئيسية لإدارة مشروع ماكينة البيع باستخدام Ignition SCADA.",
    },
    duration: "2:44",
    uploadDate: "2024-08-05",
  },
  {
    id: "piYA62DbKOo",
    title: "Industrial IoT Vending Dashboard",
    topic: "Node-RED · IIoT · Industry 4.0",
    description: {
      en: "Real-time Industrial IoT visualization for a smart vending machine using Node-RED.",
      ar: "مراقبة وعرض بيانات ماكينة بيع ذكية لحظيًا باستخدام Node-RED وIIoT.",
    },
    duration: "5:08",
    uploadDate: "2024-07-26",
  },
  {
    id: "HRTRF1iY6Xw",
    title: "Archived Reports with AI Analysis",
    topic: "Node-RED · PDF · CSV · AI",
    description: {
      en: "A Node-RED reporting flow that analyzes archived PDF and CSV information with AI.",
      ar: "تحليل تقارير PDF وCSV المؤرشفة بالذكاء الاصطناعي عبر Node-RED.",
    },
    duration: "3:09",
    uploadDate: "2024-07-20",
  },
] as const;

export function YoutubeShowcase({ locale }: { locale: "en" | "ar" }) {
  const ar = locale === "ar";
  const text = (en: string, arabic: string) => ar ? arabic : en;
  return (
    <section id="videos" className="section youtube-showcase" aria-labelledby="youtube-showcase-title">
      <div className="youtube-showcase-header" data-reveal-group="true">
        <div>
          <span className="eyebrow" data-reveal-item="true">
            <span aria-hidden="true" className="youtube-eyebrow-line" />
            {text("VIDEO TUTORIALS", "شروحات ومقاطع تقنية")}
          </span>
          <h2 id="youtube-showcase-title" data-reveal-item="true">
            {text("Watch My Work in Action", "شاهد مشاريعي على أرض الواقع")}
          </h2>
          <p data-reveal-item="true">
            {text(
              "SCADA walkthroughs, industrial IoT projects, and practical integration tutorials from my YouTube channel.",
              "عروض توضيحية لمشاريع SCADA وإنترنت الأشياء الصناعي، وشروحات عملية لتكامل الأنظمة من قناتي على يوتيوب.",
            )}
          </p>
        </div>
        <a
          className="youtube-channel-link"
          href="https://www.youtube.com/@MAShams1"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Youtube size={19} aria-hidden="true" />
          {text("Visit My Channel", "زيارة قناتي")}
          <ArrowUpRight size={17} aria-hidden="true" />
        </a>
      </div>
      <div className="youtube-video-grid">
        {videos.map((video, index) => (
          <a
            className="youtube-video-card"
            data-video-id={video.id}
            key={video.id}
            href={`https://www.youtube.com/watch?v=${video.id}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={text(`Watch on YouTube: ${video.title}`, `شاهد على يوتيوب: ${video.title}`)}
          >
            <div className="youtube-video-thumb">
              <Image
                src={`/assets/youtube/${video.id}.jpg`}
                alt=""
                fill
                sizes="(max-width: 650px) 92vw, (max-width: 1000px) 46vw, 360px"
                /* These small source thumbnails are already optimized JPEGs.
                   Direct delivery avoids Cloudflare's /_next/image quality
                   restrictions and keeps all six cards reliable in production. */
                unoptimized
              />
              <span className="youtube-video-number" aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="youtube-video-play" aria-hidden="true">
                <Play size={23} fill="currentColor" />
              </span>
              <span className="youtube-video-duration" aria-hidden="true">{video.duration}</span>
            </div>
            <div className="youtube-video-details">
              <span className="youtube-video-topic">{video.topic}</span>
              <time className="youtube-video-upload" dateTime={video.uploadDate}>{video.uploadDate}</time>
              <h3>{video.title}</h3>
              <p>{video.description[locale]}</p>
              <span className="youtube-video-action">
                {text("Watch on YouTube", "شاهد على يوتيوب")}
                <ArrowUpRight size={15} aria-hidden="true" />
              </span>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
