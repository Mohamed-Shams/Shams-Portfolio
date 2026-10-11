import { NextIntlClientProvider } from "next-intl";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "ar" }];
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    metadataBase: new URL(
      process.env.NEXT_PUBLIC_SITE_URL || "https://mohamed-shams.netlify.app",
    ),
    title:
      locale === "ar"
        ? "محمد أحمد شمس | مهندس أنظمة"
        : "Mohamed Ahmed Shams | Systems Engineer",
    description:
      locale === "ar"
        ? "هندسة أنظمة سكادا وإنترنت الأشياء الصناعي والتكامل الرقمي."
        : "Systems Engineer specializing in Ignition SCADA, Industrial IoT and intelligent industrial systems.",
    openGraph: {
      images: [{ url: "/assets/portrait.webp", width: 1200, height: 896 }],
    },
  };
}
export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!["en", "ar"].includes(locale)) notFound();
  return (
    <html
      lang={locale}
      dir={locale === "ar" ? "rtl" : "ltr"}
      suppressHydrationWarning
    >
      <body suppressHydrationWarning>
        <NextIntlClientProvider locale={locale} messages={{}}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
