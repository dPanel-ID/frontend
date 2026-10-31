import type {
  DocsGroup,
  DocsLocale,
  DocsPage,
  DocsSection,
} from '../-rules/content';
import { isDocsLocale } from '../-rules/content';

import type { DocsLinkTarget } from './links';
import { indexDocsFiles, resolveDocsImage, resolveDocsLink } from './links';
import { buildDocsTree } from './tree';

/*
 * The documentation is read at build time. Vite inlines every page and
 * category file into the bundle, and fingerprints every image, so nothing is
 * fetched at runtime and the pages render on the server like any other.
 */
// Sections, and groups one level inside them.
const PAGE_FILES = import.meta.glob<string>(
  ['/src/documentations/*/*/*.md', '/src/documentations/*/*/*/*.md'],
  { eager: true, query: '?raw', import: 'default' },
);

const CATEGORY_FILES = import.meta.glob<unknown>(
  [
    '/src/documentations/*/*/_category_.json',
    '/src/documentations/*/*/*/_category_.json',
  ],
  { eager: true, import: 'default' },
);

const IMAGE_URLS = import.meta.glob<string>(
  '/src/documentations/assets/**/*.{webp,png,jpg,jpeg,gif,svg}',
  { eager: true, query: '?url', import: 'default' },
);

/**
 * Every documentation section, per language. The trees carry the same slugs
 * in the same order — a test holds them to it — so switching language keeps
 * the reader on the page they were reading.
 */
const TREE = buildDocsTree({
  pages: PAGE_FILES,
  categories: CATEGORY_FILES,
});

const FILES = indexDocsFiles(TREE);

/** The language the documentation is written in, for an app locale. */
export function docsLocaleFor(locale: string): DocsLocale {
  const normalized = locale.toLowerCase().split('-')[0] ?? '';

  return isDocsLocale(normalized) ? normalized : 'en';
}

export function docsSections(locale: string): DocsSection[] {
  return TREE[docsLocaleFor(locale)];
}

export function findDocsSection(
  locale: string,
  sectionSlug: string,
): DocsSection | undefined {
  return docsSections(locale).find((section) => section.slug === sectionSlug);
}

export interface DocsPageLocation {
  section: DocsSection;
  /** The group the page sits in, if any, for the breadcrumb. */
  group?: DocsGroup;
  page: DocsPage;
  /** The page before this one in reading order, for the footer links. */
  previous?: DocsPage;
  next?: DocsPage;
}

export function findDocsPage(
  locale: string,
  sectionSlug: string,
  pageSlug: string,
): DocsPageLocation | undefined {
  const section = findDocsSection(locale, sectionSlug);
  if (!section) return undefined;

  const index = section.pages.findIndex((page) => page.slug === pageSlug);
  const page = index < 0 ? undefined : section.pages[index];
  if (!page) return undefined;

  const group = section.nav.find(
    (item): item is Extract<typeof item, { kind: 'group' }> =>
      item.kind === 'group' &&
      (item.group.page === page || item.group.pages.includes(page)),
  )?.group;

  return {
    section,
    group,
    page,
    previous: index > 0 ? section.pages[index - 1] : undefined,
    next:
      index < section.pages.length - 1 ? section.pages[index + 1] : undefined,
  };
}

/** The first page of a section, where a bare section link lands. */
export function firstDocsPageSlug(locale: string, sectionSlug: string) {
  return findDocsSection(locale, sectionSlug)?.pages[0]?.slug;
}

/** Where a link written in the page at `fromFile` goes. */
export function docsLinkTarget(href: string, fromFile: string): DocsLinkTarget {
  return resolveDocsLink(href, fromFile, FILES);
}

/** The served URL of an image written in the page at `fromFile`. */
export function docsImageUrl(src: string, fromFile: string) {
  return resolveDocsImage(src, fromFile, IMAGE_URLS);
}
