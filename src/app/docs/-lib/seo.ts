import {
  breadcrumbJsonLd,
  noIndexHead,
  seoHead,
  techArticleJsonLd,
} from '@/shared/libs/seo';

import { findDocsPage } from './registry';

/** The head of one documentation page: its title, summary and place. */
export function docsPageHead(locale: string, section: string, page: string) {
  const location = findDocsPage(locale, section, page);
  if (!location) return noIndexHead('Documentation');

  const { group, page: docsPage, section: docsSection } = location;
  const path = `/docs/${docsSection.slug}/${docsPage.slug}`;

  return seoHead({
    title: `${docsPage.title} · ${docsSection.title}`,
    description: docsPage.summary,
    path,
    type: 'article',
    jsonLd: [
      techArticleJsonLd({
        title: docsPage.title,
        description: docsPage.summary,
        path,
        section: docsSection.title,
      }),
      breadcrumbJsonLd([
        { name: 'Documentation', path: '/docs/intro' },
        {
          name: docsSection.title,
          path: `/docs/${docsSection.slug}/${docsSection.pages[0]?.slug ?? docsPage.slug}`,
        },
        ...(group && group.page && group.page !== docsPage
          ? [
              {
                name: group.title,
                path: `/docs/${docsSection.slug}/${group.page.slug}`,
              },
            ]
          : []),
        { name: docsPage.title, path },
      ]),
    ],
  });
}
