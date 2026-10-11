import { CaseStudy } from "@/components/Portfolio";
import { projects } from "@/lib/content";
import { notFound } from "next/navigation";
export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; locale: "en" | "ar" }>;
}) {
  const { slug, locale } = await params;
  const p = projects.find((p) => p.slug === slug);
  return {
    title: p ? `${p.title[locale]} | Mohamed Shams` : "Project",
    description: p?.overview[locale],
  };
}
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!projects.some((p) => p.slug === slug)) notFound();
  return <CaseStudy slug={slug} />;
}
