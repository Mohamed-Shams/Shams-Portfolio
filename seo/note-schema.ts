import { absolute } from "./config";
import type { SeoLocale } from "./keywords";
/** Article schema template for when an MDX draft is actually published. */
export function publishedArticleSchema(data: {
  slug: string; locale: SeoLocale; title: string; description: string;
  published: string; modified?: string; image: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: data.title,
    description: data.description,
    inLanguage: data.locale,
    mainEntityOfPage: absolute(`/${data.locale}/notes/${data.slug}`),
    image: absolute(data.image),
    datePublished: data.published,
    ...(data.modified ? { dateModified: data.modified } : {}),
    author: { "@type": "Person", name: "Mohamed Ahmed Shams",
      url: absolute(`/${data.locale}`) },
  };
}
