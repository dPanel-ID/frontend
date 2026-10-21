import { SERVERS_SECTION_EN } from '../-content/servers.en';
import { SERVERS_SECTION_ID } from '../-content/servers.id';
import type { DocsLocale, DocsPage, DocsSection } from '../-rules/content';
import { isDocsLocale } from '../-rules/content';

/**
 * Every documentation section, per language. The two trees carry the same
 * slugs in the same order, so switching language keeps the reader on the page
 * they were reading.
 */
const SECTIONS: Record<DocsLocale, DocsSection[]> = {
  en: [SERVERS_SECTION_EN],
  id: [SERVERS_SECTION_ID],
};

/** The language the documentation is written in, for an app locale. */
export function docsLocaleFor(locale: string): DocsLocale {
  const normalized = locale.toLowerCase().split('-')[0] ?? '';

  return isDocsLocale(normalized) ? normalized : 'en';
}

export function docsSections(locale: string): DocsSection[] {
  return SECTIONS[docsLocaleFor(locale)];
}

export function findDocsSection(
  locale: string,
  sectionSlug: string,
): DocsSection | undefined {
  return docsSections(locale).find((section) => section.slug === sectionSlug);
}

export interface DocsPageLocation {
  section: DocsSection;
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

  return {
    section,
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
