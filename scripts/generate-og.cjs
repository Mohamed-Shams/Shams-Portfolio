/* Reproducible 1200x630 Open Graph cards with no externally loaded assets. */
const sharp = require("sharp");
const path = require("path");
const fs = require("fs");
const output = path.join(__dirname, "..", "public", "assets", "og");
fs.mkdirSync(output, { recursive: true });
const cards = {
  home: ["Mohamed Ahmed Shams", "Ignition SCADA · Industrial IoT"],
  "dohler-cloudy-line": ["Döhler Cloudy Line", "Ignition SCADA · Food & Beverage"],
  "ncec-air-quality": ["NCEC Air Quality Monitoring", "Environmental monitoring · Saudi Arabia"],
  "ground-water": ["Groundwater Monitoring", "Ignition · Oracle · InfluxDB"],
  "modon-poc": ["MODON Industrial Cities POC", "Smart infrastructure · IIoT"],
  "drilling-equipment": ["Drilling Equipment Tracking", "Ignition · Asset Monitoring"],
  "water-network": ["DMA Water Network Monitoring", "SOFREL RTU · Testing & Commissioning"],
  "modon-testing": ["MODON Web & Mobile QA", "Software testing · Saudi Arabia"],
};
function xml(value) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
async function main() {
  for (const [id, [title, detail]] of Object.entries(cards)) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
      <defs>
        <linearGradient id="bg" x1="0" x2="1"><stop stop-color="#09141f"/><stop offset="1" stop-color="#122d3e"/></linearGradient>
        <radialGradient id="glow"><stop stop-color="#17769d" stop-opacity=".28"/><stop offset="1" stop-color="#17769d" stop-opacity="0"/></radialGradient>
      </defs>
      <rect width="1200" height="630" fill="url(#bg)"/>
      <circle cx="890" cy="220" r="480" fill="url(#glow)"/>
      <g stroke="#2b6986" stroke-opacity=".17">
        ${Array.from({length:14},(_,i)=>`<path d="M0 ${i*52}H1200"/>`).join("")}
        ${Array.from({length:24},(_,i)=>`<path d="M${i*52} 0V630"/>`).join("")}
      </g>
      <rect x="76" y="92" width="52" height="4" fill="#efa849"/>
      <text x="146" y="102" fill="#f0b56c" font-family="Arial,sans-serif" font-size="23" letter-spacing="3">INDUSTRIAL SYSTEMS · SCADA · IIoT</text>
      <text x="76" y="275" fill="#f5f7fb" font-weight="bold" font-family="Arial,sans-serif" font-size="${title.length > 29 ? 48 : 61}">${xml(title)}</text>
      <text x="76" y="349" fill="#b9d0de" font-family="Arial,sans-serif" font-size="30">${xml(detail)}</text>
      <line x1="76" y1="482" x2="1124" y2="482" stroke="#496d81" opacity=".6"/>
      <text x="76" y="541" fill="#f1b96e" font-family="Arial,sans-serif" font-size="30">MOHAMED AHMED SHAMS</text>
      <text x="1124" y="543" text-anchor="end" fill="#a2bac9" font-family="Arial,sans-serif" font-size="21">Systems Engineer</text>
    </svg>`;
    await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile(path.join(output, id + ".png"));
    console.log("OG", id, "1200x630");
  }
}
main().catch(e=>{console.error(e);process.exitCode=1;});
