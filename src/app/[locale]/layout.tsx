import { NextIntlClientProvider } from "next-intl";
import { notFound } from "next/navigation";
import { seoConfig } from "@/seo/config";
import type { Metadata } from "next";
import { homeSeo } from "@/seo/config";
import type { SeoLocale } from "@/seo/keywords";
export async function generateMetadata({ params }: {params: Promise<{locale: SeoLocale}>}): Promise<Metadata> {
  const { locale } = await params;
  return {
    metadataBase: new URL(seoConfig.origin),
    title: { default: homeSeo[locale].title, template: "%s | Mohamed Ahmed Shams" },
  };
}
const INTRO_BOOTSTRAP =
  "(function(){try{var d=document.documentElement;" +
  "var home=['/en','/ar','/en/','/ar/'].includes(location.pathname);" +
  "if(home){d.setAttribute('data-intro-play','');d.setAttribute('data-intro-t0',String(Date.now()));" +
  "d.classList.add('intro-lock');" +
  "setTimeout(function(){d.classList.remove('intro-lock');d.removeAttribute('data-intro-play')},4500)}}catch(e){}})();";
const FONT_BOOTSTRAP =
  "(function(){var l=document.getElementById('portfolio-font-styles');if(!l)return;" +
  "function ready(){l.media='all'};l.addEventListener('load',ready,{once:true});" +
  "if(l.sheet)ready()})();";
export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "ar" }];
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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          id="portfolio-font-styles"
          rel="stylesheet"
          media="print"
          href="https://fonts.googleapis.com/css2?family=Alexandria:wght@300;400;500;600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&family=Space+Grotesk:wght@400;500;600;700&display=swap"
        />
        <noscript>
          <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Alexandria:wght@300;400;500;600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&family=Space+Grotesk:wght@400;500;600;700&display=swap" />
        </noscript>
      </head>
      <body suppressHydrationWarning>
        <script dangerouslySetInnerHTML={{ __html: INTRO_BOOTSTRAP }} />
        <script dangerouslySetInnerHTML={{ __html: FONT_BOOTSTRAP }} />
        {seoConfig.analyticsToken && (
          <script defer src="https://static.cloudflareinsights.com/beacon.min.js"
            data-cf-beacon={JSON.stringify({ token: seoConfig.analyticsToken })} />
        )}
        <NextIntlClientProvider locale={locale} messages={{}}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
