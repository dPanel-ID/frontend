import { existsSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { DOCS_LOCALES } from '../-rules/content';

import {
  docsLocaleFor,
  docsSections,
  findDocsPage,
  firstDocsPageSlug,
} from './registry';

describe('docs registry', () => {
  it('serves the same pages, in the same order, in every language', () => {
    const [reference, ...others] = DOCS_LOCALES.map((locale) =>
      docsSections(locale).map((section) => ({
        slug: section.slug,
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

  it('links each page to its neighbours', () => {
    const first = findDocsPage('en', 'servers', 'overview');
    expect(first?.previous).toBeUndefined();
    expect(first?.next?.slug).toBe('before-you-start');

    const last = findDocsPage('en', 'servers', 'delete-a-server');
    expect(last?.next).toBeUndefined();
    expect(last?.previous?.slug).toBe('connect-over-ssh');
  });

  it('reports an unknown section or page rather than guessing', () => {
    expect(findDocsPage('en', 'servers', 'nope')).toBeUndefined();
    expect(findDocsPage('en', 'nope', 'overview')).toBeUndefined();
    expect(firstDocsPageSlug('en', 'nope')).toBeUndefined();
    expect(firstDocsPageSlug('en', 'servers')).toBe('overview');
  });

  it('writes every page with a title, a summary and some content', () => {
    for (const locale of DOCS_LOCALES) {
      for (const section of docsSections(locale)) {
        for (const page of section.pages) {
          expect(page.title.length, `${locale}/${page.slug}`).toBeGreaterThan(
            0,
          );
          expect(page.summary.length, `${locale}/${page.slug}`).toBeGreaterThan(
            0,
          );
          expect(page.blocks.length, `${locale}/${page.slug}`).toBeGreaterThan(
            0,
          );
        }
      }
    }
  });

  it('ships every screenshot it points at, with alt text', () => {
    for (const locale of DOCS_LOCALES) {
      for (const section of docsSections(locale)) {
        for (const page of section.pages) {
          for (const block of page.blocks) {
            if (block.kind !== 'image') continue;

            expect(block.alt.length, `${locale}/${page.slug}`).toBeGreaterThan(
              0,
            );
            const file = join(process.cwd(), 'public', block.src);
            expect(existsSync(file), `missing asset ${block.src}`).toBe(true);
          }
        }
      }
    }
  });
});
