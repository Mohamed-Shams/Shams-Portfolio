# Previous portfolio — platforms and certificate migration

Source (read-only): `Mohamed-Shams/shams-systems`, commit `1d29458`.
Destination: `Mohamed-Shams/Shams-Portfolio`, main.

## Assets migrated

- All **10** PDF files from the original `public/certificates/` folder were
  copied to the same public URL paths in this portfolio. The copied bytes were
  checked against the original source with SHA-256, and each opens as a
  one-page PDF using a PDF parser. They are presented under **Certificate
  Documents**, with direct View/Download links; matching existing
  certification/training cards also have document links.
- All **16** files from `src/assets/badges` and `src/assets/logos` were
  copied to `public/assets/platforms`. The 13 platform badges in the ticker
  reproduce the old 11-icon row and also expose the old OPC UA and
  PostgreSQL badges. Remaining source formats and issuer logos are retained.
- The old `BadgeTicker` design was adapted using CSS transforms rather
  than importing GSAP/Tailwind into the Next.js application. The carousel is
  continuous, automatically scrolls horizontally, pauses on hover/focus,
  supports keyboard focus, and keeps duplicate items out of the tab order.
- Existing content, dates, seven case studies, and the newer English/Arabic
  layout were preserved. PDF records are a separate public document library
  so the original portfolio's additional Ignition credentials and Formula
  Student certificate are not lost.

## Document inventory

The migrated files are:

1. `Ignition_Core_Certificate.pdf`
2. `Ignition_8.3_Credential_Certificate.pdf`
3. `Ignition_8.1_Credential_Certificate.pdf`
4. `AWS_Certified_AI_Practitioner.pdf`
5. `Dataiku_ML_Practitioner.pdf`
6. `Dataiku_Advanced_Designer.pdf`
7. `Dataiku_Core_Designer.pdf`
8. `Machinfy_Certification.pdf`
9. `GEN-110_Cloudera_Essentials.pdf`
10. `Formula_Student_EV_UK_2023.pdf`

## Not supplied by the old repository

The following are listed in the **new** portfolio but no matching certificate
PDF was available in the old repository; no placeholder was manufactured:

- **AVEVA Application Server** — AVEVA Learning Academy.
- **WinCC Unified Essentials** — Siemens Unified Academy.
- **IIoT: MQTT, OPC, Node-RED, PLC Integrations** — Codeandcompile.
- **Containerization & Virtualization with Docker & Kubernetes** — DataCamp.
- **Advanced & Basic Automation Courses** — HA Consulting Group.
- **Complete RAG System: From LLM Retrieval to AWS Deployment** — Udemy.

These can be linked later when the genuine proof files are available. The
current portfolio still lists those achievements without a broken PDF link.

## Verification

After deployment, run `node scripts/certificates-platforms-qa.cjs` with
`MOTION_URL` set to the public URL. The targeted browser script checks both
languages and desktop/mobile, visible logos, ticker motion/hover pause,
all 10 PDF files (HTTP 200 and PDF signature), link uniqueness, rail
scrolling, hydration/runtime errors and page overflow.
