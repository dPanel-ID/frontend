import { SITE, siteUrl } from './site';

type JsonLd = Record<string, unknown>;

export interface SeoHeadInput {
  /** The page's own title; the brand is appended unless `exactTitle`. */
  title: string;
  /** One or two sentences, ideally 70–160 characters. */
  description: string;
  /** The page's path, such as `/docs/intro`; becomes the canonical URL. */
  path: string;
  type?: 'website' | 'article';
  /** Uses `title` as is, for the home page, which leads with the brand. */
  exactTitle?: boolean;
  /** Absolute path or URL of a share image; the site image by default. */
  image?: string;
  /** Schema.org objects for this page, rendered as JSON-LD. */
  jsonLd?: JsonLd[];
}

interface HeadMeta {
  title?: string;
  name?: string;
  property?: string;
  content?: string;
}

/**
 * The head of a public, indexable page: title, description, canonical URL,
 * Open Graph and Twitter cards, and structured data. Pass it straight to a
 * route's `head`.
 */
export function seoHead(input: SeoHeadInput) {
  const {
    description,
    exactTitle,
    image = SITE.image,
    jsonLd = [],
    path,
    title,
    type = 'website',
  } = input;

  const fullTitle = exactTitle ? title : `${title} | ${SITE.name}`;
  const url = siteUrl(path);
  const imageUrl = /^https?:\/\//.test(image) ? image : siteUrl(image);

  const meta: HeadMeta[] = [
    { title: fullTitle },
    { name: 'description', content: description },
    { name: 'robots', content: 'index, follow, max-image-preview:large' },
    { property: 'og:type', content: type },
    { property: 'og:site_name', content: SITE.name },
    { property: 'og:locale', content: SITE.locale },
    { property: 'og:title', content: fullTitle },
    { property: 'og:description', content: description },
    { property: 'og:url', content: url },
    { property: 'og:image', content: imageUrl },
    { property: 'og:image:width', content: '1200' },
    { property: 'og:image:height', content: '630' },
    { property: 'og:image:alt', content: SITE.imageAlt },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: fullTitle },
    { name: 'twitter:description', content: description },
    { name: 'twitter:image', content: imageUrl },
  ];

  return {
    meta,
    links: [{ rel: 'canonical', href: url }],
    scripts: jsonLd.map((data) => ({
      type: 'application/ld+json',
      children: JSON.stringify(data),
    })),
  };
}

/**
 * The head of a page that must stay out of search results: the signed-in
 * app, the sign-in callback, redirects. Search engines still follow its
 * links, but never list the page itself.
 */
export function noIndexHead(title: string) {
  return {
    meta: [
      { title: `${title} | ${SITE.name}` },
      { name: 'robots', content: 'noindex, follow' },
    ] satisfies HeadMeta[],
  };
}
