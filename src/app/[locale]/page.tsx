import Portfolio from "@/components/Portfolio";
import type { Metadata } from "next";
import { makeMetadata } from "@/seo/config";
import { HomeStructuredData } from "@/seo/schema";
import type { SeoLocale } from "@/seo/keywords";
export async function generateMetadata({ params }: {params: Promise<{locale: SeoLocale}>}): Promise<Metadata> {
  const { locale } = await params;
  return makeMetadata(locale);
}
export default async function Page({ params }: {params: Promise<{locale: SeoLocale}>}) {
  const { locale } = await params;
  return <><HomeStructuredData locale={locale} /><Portfolio /></>;
}
