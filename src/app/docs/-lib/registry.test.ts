import { describe, expect, it } from 'vitest';

import { DOCS_LOCALES } from '../-rules/content';

import {
  docsImageUrl,
  docsLinkTarget,
  docsLocaleFor,
  docsSections,
  findDocsPage,
  firstDocsPageSlug,
} from './registry';

/** Every page of the documentation, in every language. */
const PAGES = DOCS_LOCALES.flatMap((locale) =>
  docsSections(locale).flatMap((section) =>
    section.pages.map((page) => ({ locale, section, page })),
  ),
);

/** Markdown with fenced code removed, so examples are not read as links. */
function prose(markdown: string) {
  return markdown.replace(/```[\s\S]*?```/g, '').replace(/`[^`]*`/g, '');
}

describe('docs registry', () => {
  it('loads the documentation from Markdown', () => {
    expect(docsSections('en').length).toBeGreaterThan(0);
    expect(PAGES.length).toBeGreaterThan(0);
  });

  it('serves the same sections and pages, in the same order, in every language', () => {
    const [reference, ...others] = DOCS_LOCALES.map((locale) =>
      docsSections(locale).map((section) => ({
        slug: section.slug,
        app: section.app?.href,
        pages: section.pages.map((page) => page.slug),
      })),
    );

    for (const other of others) {
      // A reader switching language has to land on the page they were on.
      expect(other).toEqual(reference);
    }
  });

  it('falls back to English for a locale with no translation', () => {
    expect(docsLocaleFor('id')).toBe('id');
    expect(docsLocaleFor('en-GB')).toBe('en');
    expect(docsLocaleFor('fr')).toBe('en');
    expect(docsLocaleFor('')).toBe('en');
  });

  it('keeps the server guide where the app links to it', () => {
    // The servers page header links to /docs/servers/overview.
    const first = findDocsPage('en', 'servers', 'overview');
    expect(first?.previous).toBeUndefined();
    expect(first?.next).toBeDefined();
    expect(firstDocsPageSlug('en', 'servers')).toBe('overview');
  });

  it('links each page to its neighbours', () => {
    for (const section of docsSections('en')) {
      const slugs = section.pages.map((page) => page.slug);
      const last = slugs.at(-1) ?? '';

      expect(findDocsPage('en', section.slug, last)?.next).toBeUndefined();
      if (slugs.length > 1) {
        expect(findDocsPage('en', section.slug, last)?.previous?.slug).toBe(
          slugs.at(-2),
        );
      }
    }
  });

  it('reports an unknown section or page rather than guessing', () => {
    expect(findDocsPage('en', 'servers', 'nope')).toBeUndefined();
    expect(findDocsPage('en', 'nope', 'overview')).toBeUndefined();
    expect(firstDocsPageSlug('en', 'nope')).toBeUndefined();
  });

  it.each(PAGES)(
    '$locale/$section.slug/$page.slug has a title, a summary and a body',
    ({ page }) => {
      expect(page.title.length).toBeGreaterThan(0);
      expect(page.summary.length).toBeGreaterThan(0);
      expect(page.markdown.trim().length).toBeGreaterThan(0);
    },
  );

  it.each(PAGES)(
    '$locale/$section.slug/$page.slug links only to pages that exist',
    ({ page }) => {
      const links = [
        ...prose(page.markdown).matchAll(/(?<!!)\[[^\]]*\]\(([^)\s]+)/g),
      ];

      for (const [, href = ''] of links) {
        const target = docsLinkTarget(href, page.file);
        expect(target.kind, href).not.toBe('broken');

        if (target.kind === 'page') {
          expect(
            findDocsPage('en', target.section, target.page),
            href,
          ).toBeDefined();
        }
      }
    },
  );

  it.each(PAGES)(
    '$locale/$section.slug/$page.slug ships every image it shows, with alt text',
    ({ page }) => {
      const images = [
        ...prose(page.markdown).matchAll(/!\[([^\]]*)\]\(([^)\s]+)/g),
      ];

      for (const [, alt = '', src = ''] of images) {
        expect(alt.trim().length, `alt text for ${src}`).toBeGreaterThan(0);
        expect(
          docsImageUrl(src, page.file),
          `missing image ${src}`,
        ).toBeTruthy();
      }
    },
  );
});
