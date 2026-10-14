import { NextIntlClientProvider } from "next-intl";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
const INTRO_BOOTSTRAP =
  "(function(){try{var d=document.documentElement;if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;" +
  "var p=new URLSearchParams(location.search).get('motionPreview')==='1',s=false;" +
  "try{s=!!sessionStorage.getItem('shams-portfolio-intro-v5')}catch(e){}" +
  "if(p||(!s&&!location.hash)){d.setAttribute('data-intro-play','');d.setAttribute('data-intro-t0',String(Date.now()));" +
  "d.classList.add('intro-lock');try{sessionStorage.setItem('shams-portfolio-intro-v5','seen')}catch(e){}" +
  "setTimeout(function(){d.classList.remove('intro-lock')},3600)}}catch(e){}})();";
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
        <script dangerouslySetInnerHTML={{ __html: INTRO_BOOTSTRAP }} />
        <NextIntlClientProvider locale={locale} messages={{}}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
