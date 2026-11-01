/**
 * Who the public pages say we are. Search engines and AI crawlers read these
 * on every page, so the brand is spelled the same way everywhere.
 */
export const SITE = {
  /** Where the public pages live; canonical links and the sitemap use it. */
  url: 'https://dnocs.devetek.app',
  name: 'dPanel - dNocs',
  shortName: 'dNocs',
  /** What dNocs stands for. */
  expansion: 'distributed Node & Operations Control system',
  description:
    'dPanel - dNocs (distributed Node & Operations Control system) is a control panel that launches servers at your cloud provider or connects ones you already run, installs software, deploys your applications from Git, and manages domains, load balancers and logs.',
  /** 1200×630 preview shown when a page is shared. */
  image: '/og-image.png',
  imageAlt: 'dPanel - dNocs, the distributed Node & Operations Control system',
  locale: 'en_US',
  themeColor: '#0284c7',
  publisher: 'Devetek',
  sameAs: ['https://github.com/dPanel-ID'],
} as const;

/** `path` on the public site, as an absolute URL. */
export function siteUrl(path = '/') {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${SITE.url}${normalized === '/' ? '/' : normalized.replace(/\/+$/, '')}`;
}
