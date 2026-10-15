import type { Metadata } from "next";
import Link from "next/link";
import { makeNotesMetadata, noteIdeas } from "@/seo/config";
import type { SeoLocale } from "@/seo/keywords";
import { JsonLdScript, notesBreadcrumbs } from "@/seo/schema";

export async function generateMetadata({ params }: {params: Promise<{locale: SeoLocale}>}): Promise<Metadata> {
  const { locale } = await params;
  return makeNotesMetadata(locale);
}
export default async function NotesPage({ params }: {params: Promise<{locale: SeoLocale}>}) {
  const { locale } = await params;
  const ar = locale === "ar";
  return (
    <>
    <JsonLdScript data={notesBreadcrumbs(locale)} />
    <main className="seo-notes-page">
      <nav className="seo-breadcrumbs" aria-label={ar ? "مسار الصفحة" : "Breadcrumb"}>
        <Link href={`/${locale}`}>{ar ? "الرئيسية" : "Home"}</Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">{ar ? "ملاحظات تقنية" : "Engineering Notes"}</span>
      </nav>
      <h1>{ar ? "ملاحظات عن سكادا وإنترنت الأشياء الصناعي" : "Industrial SCADA & IIoT Engineering Notes"}</h1>
      <p>{ar
        ? "الموضوعات التالية قيد الإعداد. لم تُنشر مقالات تفصيلية بعد، وستُضاف بعد مراجعة محتواها الفني."
        : "These are topics in preparation, not published tutorials. Technical details will be added only after review."}</p>
      <h2>{ar ? "موضوعات مقترحة" : "Upcoming technical topics"}</h2>
      <ul>{noteIdeas.map(item => <li key={item.slug}>{item[locale]}</li>)}</ul>
      <Link href={`/${locale}#projects`}>{ar ? "استعرض مشروعات سكادا" : "Explore documented SCADA projects"}</Link>
    </main>
    </>
  );
}
