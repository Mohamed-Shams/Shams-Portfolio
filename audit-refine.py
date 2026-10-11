from pathlib import Path
p=Path('src/components/TechnicalVisuals.tsx');s=p.read_text();s=s.replace('x: 240 + 215 * (x * Math.cos(tilt) - y * Math.sin(tilt)),','x: Number((240 + 215 * (x * Math.cos(tilt) - y * Math.sin(tilt))).toFixed(3)),').replace('y: 240 + 215 * (x * Math.sin(tilt) + y * Math.cos(tilt)),','y: Number((240 + 215 * (x * Math.sin(tilt) + y * Math.cos(tilt))).toFixed(3)),').replace('opacity={0.15 + p.z * 0.28}','opacity={Number((0.15 + p.z * 0.28).toFixed(3))}')
p.write_text(s)
p=Path('src/app/globals.css');s=p.read_text();s=s.replace("@import './fidelity.css';",'');p.write_text(s)
p=Path('src/app/layout.tsx');s=p.read_text();s=s.replace('import "./globals.css";','import "./globals.css";\nimport "./fidelity.css";');p.write_text(s)
