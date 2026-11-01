import {
  breadcrumbJsonLd,
  noIndexHead,
  seoHead,
  siteUrl,
  techArticleJsonLd,
} from '@/shared/libs/seo';

import { findDocsPage } from './registry';

/** The head of one documentation page: its title, summary and place. */
export function docsPageHead(locale: string, section: string, page: string) {
  const location = findDocsPage(locale, section, page);
  if (!location) return noIndexHead('Documentation');

  const { group, page: docsPage, section: docsSection } = location;
  const path = `/docs/${docsSection.slug}/${docsPage.slug}`;
  const faq = pageFaq(docsPage.markdown);

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
      ...(faq.length > 0 ? [faqPageJsonLd(faq, path)] : []),
    ],
  });
}

/** One question of a page's FAQ, and its answer as plain text. */
export interface DocsFaqEntry {
  question: string;
  answer: string;
}

/** The FAQ heading, in every language the documentation is written in. */
const FAQ_HEADING =
  /^##\s+(frequently asked questions|pertanyaan yang sering diajukan)\s*$/i;
const FENCE = /^\s*(```|~~~)/;

/**
 * The questions of a page's "Frequently asked questions" section: each `###`
 * heading, with the text up to the next one as its answer. The section ends
 * at the next `##` heading. Code blocks, images and callout markers are left
 * out of the answers, so they read as the sentences a person would quote.
 */
export function pageFaq(markdown: string): DocsFaqEntry[] {
  const entries: DocsFaqEntry[] = [];
  let inSection = false;
  let inFence = false;
  let current: { question: string; lines: string[] } | undefined;

  const close = () => {
    if (!current) return;
    const answer = plainText(current.lines.join(' '));
    if (current.question && answer) {
      entries.push({ question: current.question, answer });
    }
    current = undefined;
  };

  for (const line of markdown.split('\n')) {
    if (FENCE.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;

    if (/^##\s/.test(line)) {
      close();
      inSection = FAQ_HEADING.test(line.trim());
      continue;
    }
    if (!inSection) continue;

    const question = /^###\s+(.+?)\s*#*\s*$/.exec(line)?.[1];
    if (question) {
      close();
      current = { question: plainText(question), lines: [] };
      continue;
    }
    // A list item reads as one more sentence; its marker is dropped.
    if (current && !/^\s*:::/.test(line)) {
      current.lines.push(line.replace(/^\s*(?:[-*+]|\d+\.)\s+/, ''));
    }
  }
  close();

  return entries;
}

/** A page's FAQ as schema.org FAQPage, for answer engines and rich results. */
function faqPageJsonLd(entries: DocsFaqEntry[], path: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    url: siteUrl(path),
    mainEntity: entries.map((entry) => ({
      '@type': 'Question',
      name: entry.question,
      acceptedAnswer: { '@type': 'Answer', text: entry.answer },
    })),
  };
}

function plainText(markdown: string) {
  return markdown
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/(\*\*|__|`)/g, '')
    .replace(/(^|\s)[*_]([^*_\s][^*_]*?)[*_](?=\s|[.,;:!?)]|$)/g, '$1$2')
    .replace(/\s+/g, ' ')
    .trim();
}
