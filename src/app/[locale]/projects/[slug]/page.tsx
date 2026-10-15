import { CaseStudy } from "@/components/Portfolio";
import { projects } from "@/lib/content";
import { notFound } from "next/navigation";
import { makeMetadata } from "@/seo/config";
import { ProjectStructuredData } from "@/seo/schema";
import { projectKeywords, type SeoLocale, type SeoProjectSlug } from "@/seo/keywords";
import type { Metadata } from "next";
export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}
export async function generateMetadata({ params }: {
  params: Promise<{ slug: string; locale: SeoLocale }>;
}): Promise<Metadata> {
  const { slug, locale } = await params;
  if (!(slug in projectKeywords)) return { robots: { index: false } };
  return makeMetadata(locale, slug as SeoProjectSlug);
}
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string; locale: SeoLocale }>;
}) {
  const { slug, locale } = await params;
  if (!projects.some((p) => p.slug === slug)) notFound();
  return <><ProjectStructuredData locale={locale} slug={slug as SeoProjectSlug} /><CaseStudy slug={slug} /></>;
}
