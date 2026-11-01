import { SITE, siteUrl } from './site';

/**
 * Schema.org descriptions of the site, for search engines' rich results and
 * for AI crawlers, which read JSON-LD to learn what a page is about.
 */

const ORGANIZATION_ID = `${SITE.url}/#organization`;
const WEBSITE_ID = `${SITE.url}/#website`;

export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': ORGANIZATION_ID,
    name: SITE.name,
    alternateName: ['dPanel', 'dNocs', 'dnocs', SITE.expansion],
    url: siteUrl('/'),
    logo: siteUrl('/logo512.png'),
    sameAs: SITE.sameAs,
  };
}

export function websiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    name: SITE.name,
    alternateName: ['dPanel', 'dNocs'],
    url: siteUrl('/'),
    description: SITE.description,
    inLanguage: ['en', 'id'],
    publisher: { '@id': ORGANIZATION_ID },
  };
}

export function softwareApplicationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: SITE.name,
    alternateName: ['dPanel', 'dNocs'],
    applicationCategory: 'DeveloperApplication',
    applicationSubCategory: 'Server and DevOps control panel',
    operatingSystem: 'Web browser; manages Ubuntu and Debian servers',
    url: siteUrl('/'),
    description: SITE.description,
    image: siteUrl(SITE.image),
    publisher: { '@id': ORGANIZATION_ID },
    featureList: [
      'Launch servers on AWS, Google Cloud, DigitalOcean and IDCloudHost',
      'Connect an existing server over SSH',
      'Install databases and language runtimes',
      'Deploy applications from GitHub',
      'Manage domains, DNS records and HTTPS load balancers',
      'Read, search and download server and application logs',
      'Team workspaces with members and roles',
    ],
  };
}

export interface BreadcrumbItem {
  name: string;
  path: string;
}

export function breadcrumbJsonLd(items: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: siteUrl(item.path),
    })),
  };
}

export interface ArticleInput {
  title: string;
  description: string;
  path: string;
  section: string;
}

/** A documentation page, as a technical article. */
export function techArticleJsonLd(input: ArticleInput) {
  return {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: input.title,
    description: input.description,
    articleSection: input.section,
    url: siteUrl(input.path),
    mainEntityOfPage: siteUrl(input.path),
    inLanguage: 'en',
    image: siteUrl(SITE.image),
    isPartOf: { '@id': WEBSITE_ID },
    publisher: { '@id': ORGANIZATION_ID },
    about: { '@type': 'SoftwareApplication', name: SITE.name },
  };
}
