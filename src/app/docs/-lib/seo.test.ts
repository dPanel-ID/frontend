import { describe, expect, it } from 'vitest';

import { docsSections } from './registry';
import { docsPageHead, pageFaq } from './seo';

describe('pageFaq', () => {
  it.each([
    {
      name: 'questions and their answers as plain text',
      markdown: [
        '## Frequently asked questions',
        '',
        '### Is dPanel **free**?',
        '',
        'Yes. See [Servers](../servers/overview.md) and `dnocs` for _more_.',
        '',
        '### Which providers?',
        '- AWS',
        '- Google Cloud',
      ].join('\n'),
      faq: [
        {
          question: 'Is dPanel free?',
          answer: 'Yes. See Servers and dnocs for more.',
        },
        { question: 'Which providers?', answer: 'AWS Google Cloud' },
      ],
    },
    {
      name: 'the Indonesian heading',
      markdown: '## Pertanyaan yang sering diajukan\n### Gratis?\nYa.',
      faq: [{ question: 'Gratis?', answer: 'Ya.' }],
    },
    {
      name: 'only the FAQ section, which ends at the next level 2 heading',
      markdown: [
        '### Not a question',
        'Intro.',
        '## Frequently asked questions',
        '### Asked?',
        'Answered.',
        '## What happens next',
        '### Also not a question',
        'Later.',
      ].join('\n'),
      faq: [{ question: 'Asked?', answer: 'Answered.' }],
    },
    {
      name: 'answers without code, images or callout markers',
      markdown: [
        '## Frequently asked questions',
        '### How?',
        'Run this:',
        '```bash',
        '### not a heading',
        '```',
        '![A screenshot](../../assets/a.webp)',
        ':::tip',
        'Keep it short.',
        ':::',
      ].join('\n'),
      faq: [{ question: 'How?', answer: 'Run this: Keep it short.' }],
    },
    {
      name: 'nothing when a question has no answer',
      markdown: '## Frequently asked questions\n### Empty?\n',
      faq: [],
    },
    {
      name: 'nothing on a page without the section',
      markdown: '## Steps\n### One\nDo it.',
      faq: [],
    },
  ])('reads $name', ({ faq, markdown }) => {
    expect(pageFaq(markdown)).toEqual(faq);
  });
});

describe('docsPageHead', () => {
  /** The JSON-LD types a page's head carries. */
  function jsonLdTypes(section: string, page: string) {
    // A missing page gets a noindex head, which has no scripts.
    const head = docsPageHead('en', section, page);
    const scripts = 'scripts' in head ? head.scripts : [];
    return scripts.map(
      (script) => (JSON.parse(script.children) as { '@type': string })['@type'],
    );
  }

  it('adds FAQPage only to pages with a FAQ section', () => {
    const pages = docsSections('en').flatMap((section) =>
      section.pages.map((page) => ({ section: section.slug, page })),
    );
    const withFaq = pages.filter(({ page }) => pageFaq(page.markdown).length);

    expect(withFaq.length).toBeGreaterThan(0);
    for (const { page, section } of pages) {
      const hasFaq = withFaq.some((entry) => entry.page === page);
      expect(jsonLdTypes(section, page.slug).includes('FAQPage')).toBe(hasFaq);
    }
  });
});
