/* Static HTML SEO gate: crawler-visible pages only, no browser JS. */
const fs = require("node:fs");
const path = require("node:path");
const sharp = require("sharp");
const ROOT = path.join(__dirname, "..");
const OUT = path.join(ROOT, ".next", "server", "app");
const ORIGIN = "https://shams-portfolio.mshams0174.workers.dev";
const SLUGS = ["dohler-cloudy-line", "ncec-air-quality", "ground-water",
  "modon-poc", "drilling-equipment", "water-network", "modon-testing"];
const routes = ["en", "ar"].flatMap(locale => [
  { locale, route: "/" + locale, file: path.join(OUT, locale + ".html") },
  ...SLUGS.map(slug => ({
    locale, route: "/" + locale + "/projects/" + slug,
    file: path.join(OUT, locale, "projects", slug + ".html"),
  })),
  { locale, route: "/" + locale + "/notes", file: path.join(OUT, locale, "notes.html") },
]);
const errors = [], titles = new Map(), descriptions = new Map();
function check(condition, message) { if (!condition) errors.push(message); }
function nodes(root, type) {
  const result = [];
  function visit(node) {
    if (node.tagName === type) result.push(node);
    for (const child of node.childNodes || []) visit(child);
  }
  visit(root);
  return result;
}
function attr(node, key) { return node?.attrs?.find(a => a.name === key)?.value; }
function content(node) {
  return node?.childNodes?.map(n => n.nodeName === "#text" ? n.value : content(n)).join("") || "";
}
function match(doc, tag, key, value) {
  return nodes(doc, tag).find(n => attr(n, key) === value);
}
function schemaCheck(item, route) {
  const type = item?.["@type"];
  check(item?.["@context"] === "https://schema.org", route + " wrong schema context");
  check(typeof type === "string", route + " missing JSON-LD type");
  if (type === "Person")
    check(item.name && item.jobTitle && item.worksFor && Array.isArray(item.sameAs), route + " incomplete Person");
  if (type === "CreativeWork")
    check(item.author && item.about && item.image, route + " incomplete CreativeWork");
  if (type === "BreadcrumbList")
    check(Array.isArray(item.itemListElement) && item.itemListElement.length > 0,
      route + " empty breadcrumbs");
  if (type === "FAQPage")
    check(Array.isArray(item.mainEntity) && item.mainEntity.length >= 5, route + " incomplete FAQ");
  if (type === "VideoObject")
    check(item.name && item.description && item.thumbnailUrl && item.embedUrl && item.uploadDate,
      route + " incomplete video");
}
async function main() {
  const { parse } = await import("parse5");
  for (const item of routes) {
    if (!fs.existsSync(item.file)) { errors.push("Missing static HTML: " + item.file); continue; }
    const doc = parse(fs.readFileSync(item.file, "utf8"));
    const title = content(nodes(doc, "title")[0]).trim();
    const desc = attr(match(doc, "meta", "name", "description"), "content");
    const canonical = attr(match(doc, "link", "rel", "canonical"), "href");
    const langs = Object.fromEntries(nodes(doc, "link")
      .filter(n => attr(n, "rel") === "alternate")
      .map(n => [attr(n, "hreflang"), attr(n, "href")]));
    const h1 = nodes(doc, "h1");
    const og = attr(match(doc, "meta", "property", "og:image"), "content");
    const ogAlt = attr(match(doc, "meta", "property", "og:image:alt"), "content");
    check(!!title && title.length <= 60, item.route + " title >60/missing: " + title);
    check(!!desc && desc.length <= 160, item.route + " description >160/missing: " + desc?.length);
    check(h1.length === 1, item.route + " H1 count: " + h1.length);
    check(canonical === ORIGIN + item.route, item.route + " canonical: " + canonical);
    const suffix = item.route.replace(/^\/(?:en|ar)/, "");
    for (const loc of ["en", "ar"]) {
      check(langs[loc] === ORIGIN + "/" + loc + suffix, item.route + " missing hreflang " + loc);
    }
    check(langs["x-default"] === ORIGIN + "/en" + suffix, item.route + " missing x-default");
    check(!!og && og.startsWith(ORIGIN + "/assets/og/"), item.route + " missing OG image");
    check(!!ogAlt, item.route + " missing OG image alt");
    check(attr(match(doc, "meta", "name", "twitter:card"), "content") === "summary_large_image",
      item.route + " missing Twitter card");
    check(!titles.has(title), item.route + " duplicate title with " + titles.get(title));
    check(!descriptions.has(desc), item.route + " duplicate desc with " + descriptions.get(desc));
    titles.set(title, item.route); descriptions.set(desc, item.route);
    const schemaScripts = nodes(doc, "script").filter(n => attr(n, "type") === "application/ld+json");
    let schemas = [];
    for (const script of schemaScripts) {
      try {
        const parsed = JSON.parse(content(script));
        schemas.push(...(Array.isArray(parsed) ? parsed : [parsed]));
      } catch (error) { errors.push(item.route + " invalid JSON-LD syntax " + error.message); }
    }
    check(schemas.length > 0, item.route + " missing JSON-LD");
    schemas.forEach(s => schemaCheck(s, item.route));
    if (suffix.endsWith("/notes")) {
      check(schemas.some(s => s["@type"] === "BreadcrumbList"),
        item.route + " notes breadcrumb schema missing");
    } else if (suffix.startsWith("/projects/")) {
      for (const type of ["CreativeWork", "BreadcrumbList"])
        check(schemas.some(s => s["@type"] === type), item.route + " missing " + type);
    } else if (!suffix) {
      for (const type of ["Person", "WebSite", "ProfilePage", "FAQPage"])
        check(schemas.some(s => s["@type"] === type), item.route + " missing " + type);
      check(schemas.filter(s => s["@type"] === "VideoObject").length === 6,
        item.route + " missing 6 VideoObjects");
    }
    for (const img of nodes(doc, "img"))
      check(attr(img, "alt") !== undefined, item.route + " img tag missing alt attribute");
    const internal = new Set(routes.map(r => r.route));
    for (const anchor of nodes(doc, "a")) {
      const href = attr(anchor, "href");
      if (!href?.startsWith("/")) continue;
      const target = href.split(/[?#]/)[0] || item.route;
      if (target.startsWith("/assets/") || target.startsWith("/_next/") || target === "/") continue;
      if (/\.(pdf|png|webp|jpe?g|svg|avif|ico)$/i.test(target)) {
        check(fs.existsSync(path.join(ROOT, "public", target)),
          item.route + " missing linked static asset " + href);
        continue;
      }
      check(internal.has(target), item.route + " broken internal route " + href);
    }
    if (og?.startsWith(ORIGIN)) {
      const file = path.join(ROOT, "public", og.slice(ORIGIN.length));
      check(fs.existsSync(file), item.route + " OG file missing " + file);
      if (fs.existsSync(file)) {
        const meta = await sharp(file).metadata();
        check(meta.width === 1200 && meta.height === 630, item.route + " OG size not 1200x630");
      }
    }
    console.log("SEO", item.route, "title:", title.length, "description:", desc?.length,
      "H1:", h1.length, "schema:", schemas.length);
  }
  if (errors.length) {
    console.error("SEO CHECK FAILED:", errors.length);
    errors.forEach(e => console.error(" -", e));
    process.exitCode = 1;
  } else console.log("SEO CHECK PASSED:", routes.length, "SSG pages");
}
main().catch(e => { console.error(e); process.exitCode = 1; });
