from pathlib import Path
p=Path('src/components/Portfolio.tsx');s=p.read_text(encoding='utf-8-sig')
a=s.index('export function GlobeArt()');b=s.index('export default function Portfolio()',a);s=s[:a]+s[b:]
s=s.replace('const cv =',"import {GlobeArt, Scada, TechSymbol} from './TechnicalVisuals';\nconst cv =")
s=s.replace('<div className="industrial" />','<div className="industrial" aria-hidden="true" /><div className="refinery" aria-hidden="true" />')
s=s.replace('<div className="signature">Mohamed Shams</div>','<div className="signature"><Image src="/assets/signature.webp" alt="Mohamed Shams" width={276} height={66}/></div>')
s=s.replace('src={`/assets/${p.image}.webp`}', 'src={`/assets/${p.image === "juice" ? "juice-card" : p.image}.webp`}')
s=s.replace('{skills\n                .filter', '{[...skills.filter(s=>s[0]!=="Industrial IoT"), ...skills.filter(s=>s[0]==="Industrial IoT")]\n                .filter')
s=s.replace('<span className={`tech-symbol symbol-${i % 5}`}>\n                      {s[4]}\n                    </span>', '<TechSymbol name={s[0]}/>')
s=s.replace('{c[4]}\n                </div>', '<Image src={`/assets/cert-${c[4]?.toLowerCase()}.webp`} alt={c[4]} width={88} height={88}/>\n                </div>')
s=s.replace('<div className="education">\n            <span>{t("Education", "التعليم")}</span>', '<details className="education">\n            <summary>{t("Education & languages", "التعليم واللغات")}</summary>')
s=s.replace('</div>\n        </section>\n        <section id="certifications"', '</details>\n        </section>\n        <section id="certifications"')
p.write_text(s,encoding='utf-8')
