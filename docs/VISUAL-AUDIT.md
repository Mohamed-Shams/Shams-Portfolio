# Strict visual fidelity audit

The supplied 1536×1024 board is the appearance reference. Each panel was cropped and compared independently with real Chrome screenshots; the board was not treated as a page layout. Desktop captures use 1440×900; mobile captures use 390×844 and 360×800. Regression coverage also includes 1280×800 and 768×1024 in both languages. Comparisons preserve aspect ratios and normalize panel widths. Overlays are supplied for the heroes, but no numerical fidelity percentage is claimed.

## Ten most noticeable differences, ranked

| Rank / severity | Before                                                                                                                                   | Direct correction                                                                                                                                                                                                                                                  | Remaining limit                                                                                                |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------- |
| 1 — Critical    | Industrial imagery was stretched into a blurred band over the lower portrait; right-side refinery was missing.                           | Restricted the lower plant to the left 45%, added the matching right refinery crop from the supplied board, and applied horizontal/vertical edge masks. Preserved the original portrait pixels and face.                                                           | The board crops cannot provide high-resolution source photography or recover the original layered composition. |
| 2 — High        | Arabic mobile portrait was too small; copy started too low, text was undersized, language control order and CTA icon placement differed. | Portrait container 385→455px; copy offset 305→280px; Arabic name 30→up to 34px, headline 24→up to 28px, body 12→14px. Matched AR/EN order, removed the primary CTA arrow on mobile, and placed the download icon on the reference side.                            | Original photo lighting/pose differs from the reference composite. The supplied face is retained.              |
| 3 — High        | About was too shallow and its image/statement hierarchy was wrong.                                                                       | Panel 1200×759→1120×979px at the desktop capture. Portrait width 407→351px; explicit portrait height 565px; taller editorial copy, larger statistics, larger overlapping statement, corner accents, and original reference signature crop.                         | Secondary portrait/signature sharpness is limited by the board.                                                |
| 4 — High        | Section text was much smaller relative to cards than in the corresponding reference panels; large outer padding diluted the hierarchy.   | Desktop section headings 38→44px, supporting text 15→19px; About heading 43→54px and paragraph 15→23px. Reduced panel top padding to reference proportions. Matched case-study typography and removed its extra eyebrow. Retained all CV-derived responsibilities. | Longer verified case-study copy takes more vertical space than the abbreviated board copy.                     |
| 5 — High        | SCADA was a small single chart rather than the wider two-part technical panel.                                                           | Rebuilt as a 340×265px panel (previously 230×225), with an inset chart, controls, dashed secondary trace, and separate IIoT/Data/Automation/Analytics/AI column. Kept it hidden on mobile.                                                                         | Fine chart paths are recreated SVG, not original source artwork.                                               |
| 6 — Medium/high | Project card typography was too small, the juice-line crop was different, and second-row images were too tall.                           | Used the actual project-card juice crop, matched first-row 160:76 and second-row 160:54 image ratios, increased titles/tags, adjusted arrow diameter and padding. Preserved six initial cards plus the seventh under View All.                                     | Images remain illustrative low-resolution board crops.                                                         |
| 7 — Medium/high | Tools panel had an extra inset frame, undersized tiles and symbols, and an incorrect technology sequence.                                | Removed nested framing; restored the reference order of the first 14 tools; tile height 91→126px and label size 12→17px. Added stable, category-colored technical SVG symbols. Preserved Industrial IoT as an additional last tile.                                | Symbols are close functional equivalents; original brand icon assets are unavailable.                          |
| 8 — Medium      | Journey was a widely spaced two-column list with no secondary rail.                                                                      | Restored employer/title/project columns, amber markers, secondary dark rail and employer text treatment. Timeline height 299→216px. Moved education/languages into an accessible disclosure so the compact reference composition remains intact.                   | Full verified project titles remain longer than some board abbreviations.                                      |
| 9 — Medium      | Certification logos were generic text and tiles/text were too small.                                                                     | Used matching board-derived brand identifiers; tile height 110→139px; logo area 68→86px wide; larger titles, issuers and dates. Preserved five certifications and distinct training courses.                                                                       | Clean vector/high-resolution credential artwork is still needed for sharp large displays.                      |
| 10 — Medium     | Contact used a sparse central wireframe rather than a cropped, dense blue hemisphere.                                                    | Rebuilt the lightweight SVG with projected geographic contours, triangulated grid, amber nodes, signal arcs and pin; matched the right crop and increased contact hierarchy.                                                                                       | Exact globe/SCADA art needs the original vector or layered files.                                              |

## Browser comparison evidence

Every image below shows **reference / before / after**, left to right:

- [Desktop hero](../screenshots/audit/comparisons/desktop-hero.jpg)
- [Arabic mobile](../screenshots/audit/comparisons/arabic-mobile.jpg)
- [About](../screenshots/audit/comparisons/about.jpg)
- [Selected Work](../screenshots/audit/comparisons/projects.jpg)
- [Tools & Technologies](../screenshots/audit/comparisons/skills.jpg)
- [Journey](../screenshots/audit/comparisons/experience.jpg)
- [Certifications](../screenshots/audit/comparisons/certifications.jpg)
- [Contact](../screenshots/audit/comparisons/contact.jpg)
- [Case study](../screenshots/audit/comparisons/case.jpg)

Raw screenshots and measured element bounds are preserved under `screenshots/audit/before` and `screenshots/audit/after`. Hero overlays are in the comparisons directory. These are visual inspection aids, not similarity scores. The composite panel widths do not establish the original website viewport dimensions.

## Correction loop and integrity

The first pass was recaptured and reviewed. The second pass corrected refinery/plant crop seams, statement placement, mobile SCADA visibility and CTA icon direction. SVG projected coordinates were rounded to eliminate server/browser floating-point hydration differences. A separate existing reduced-motion hydration mismatch was fixed by making the hero's initial rendered state consistent. No warning overlay is hidden with CSS.

No project, employer, date, certification or contact information was invented or removed. All seven project routes per locale, filters, gallery, menu, language switching, training disclosure, education disclosure and CV download remain functional. The original supplied portrait is still the hero image; industrial imagery remains labeled illustrative.

Color samples from the reference's dark areas were approximately RGB(8,11,15) and RGB(10,12,17), close to the existing #080D12 token. The dark/amber/blue palette was retained; no new visual theme was introduced.

## Assets needed for a closer match

1. Original high-resolution industrial images, especially the hero refinery and lower facility layers.
2. Original secondary portrait and signature artwork.
3. Clean technology and credential logo files.
4. Original globe/SCADA vectors or layered hero composition for exact fine-detail reproduction.

These limitations do not block navigation or bilingual functionality; they prevent an honest claim of pixel-identical artwork.
