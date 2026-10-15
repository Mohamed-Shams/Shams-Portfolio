"use client";
import { useState } from "react";
import { Pause, Play } from "lucide-react";
import Image from "next/image";
import type { CSSProperties } from "react";

/** Original platform icons from the read-only shams-systems portfolio.
 * Additional OPC UA and PostgreSQL badges from the same source are included
 * to represent the full platform collection instead of leaving assets unused.
 */
const platformBadges = [
  { name: "AWS AI Practitioner", file: "aws-ai-practitioner.png", glow: "#ff9900", section: "certifications" },
  { name: "Dataiku", file: "dataiku-logo.png", glow: "#00b3ab", section: "certifications" },
  { name: "Scikit-Learn", file: "scikit-learn.png", glow: "#f89939", section: "skills" },
  { name: "Ignition", file: "ignition-logo.png", glow: "#f7901e", section: "certifications" },
  { name: "AVEVA", file: "aveva.png", glow: "#9b60be", section: "certifications" },
  { name: "Node-RED", file: "nodered.png", glow: "#d25252", section: "skills" },
  { name: "MQTT", file: "mqtt.svg", glow: "#a858b9", section: "skills" },
  { name: "OPC UA", file: "opcua.png", glow: "#5ec8d8", section: "skills" },
  { name: "MySQL", file: "mysql.svg", glow: "#4479a1", section: "skills" },
  { name: "MS SQL Server", file: "mssql.svg", glow: "#d2575b", section: "skills" },
  { name: "PostgreSQL", file: "postgresql.png", glow: "#4479a1", section: "skills" },
  { name: "Python", file: "python.png", glow: "#f0c45b", section: "skills" },
  { name: "Docker", file: "docker.svg", glow: "#2496ed", section: "skills" },
] as const;

export function PlatformTicker({ locale }: { locale: "en" | "ar" }) {
  const ar = locale === "ar";
  const [paused, setPaused] = useState(false);
  return (
    <div
      className="platform-ticker"
      data-paused={paused ? "true" : "false"}
      aria-label={ar ? "منصات وأدوات أعمل بها" : "Platforms and technologies I work with"}
      role="region"
      data-platform-ticker
    >
      <div className="platform-ticker-head">
        <span>{ar ? "لمحة عن المنصات" : "Platform Ecosystem"}</span>
        <div className="platform-ticker-actions">
          <small>{ar ? "المنصات تتحرك تلقائيًا" : "Auto-scrolling platforms"}</small>
          <button
            className="platform-ticker-toggle"
            type="button"
            aria-pressed={paused}
            aria-label={paused
              ? (ar ? "تشغيل حركة المنصات" : "Resume platform scrolling")
              : (ar ? "إيقاف حركة المنصات مؤقتًا" : "Pause platform scrolling")}
            onClick={() => setPaused(value => !value)}
          >
            {paused ? <Play size={13} aria-hidden="true" /> : <Pause size={13} aria-hidden="true" />}
            <span>{paused ? (ar ? "تشغيل" : "Play") : (ar ? "إيقاف" : "Pause")}</span>
          </button>
        </div>
      </div>
      <div className="platform-ticker-window" dir="ltr">
        <div className="platform-ticker-track">
          {[0, 1].map((copy) => (
            <div className="platform-ticker-set" key={copy} aria-hidden={copy === 1 ? "true" : undefined}>
              {platformBadges.map((badge) => (
                <a
                  key={badge.name}
                  className="platform-ticker-item"
                  style={{ "--ticker-glow": badge.glow } as CSSProperties}
                  href={`#${badge.section}`}
                  tabIndex={copy === 1 ? -1 : undefined}
                  title={badge.name}
                  aria-label={badge.name}
                >
                  <Image
                    src={`/assets/platforms/${badge.file}`}
                    alt=""
                    width={62}
                    height={62}
                    sizes="62px"
                    loading="eager"
                    className="platform-ticker-icon"
                  />
                  <span className="platform-ticker-label">{badge.name}</span>
                </a>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
