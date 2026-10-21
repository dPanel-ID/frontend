/**
 * The shape of a documentation page.
 *
 * Long-form prose lives in typed content modules, one per language, rather
 * than in the i18n dictionaries: a dictionary entry per paragraph would be
 * unreadable to edit and impossible to review as prose. Every string the
 * documentation *chrome* shows — navigation, callout labels, the previous and
 * next links — still comes from the dictionaries.
 */

export type DocsBlock =
  | { kind: 'paragraph'; text: string }
  | { kind: 'heading'; text: string }
  | { kind: 'list'; items: string[] }
  | { kind: 'steps'; items: string[] }
  | { kind: 'table'; head: string[]; rows: string[][] }
  | { kind: 'image'; src: string; alt: string; caption?: string }
  | { kind: 'code'; code: string }
  | { kind: 'callout'; tone: DocsCalloutTone; title: string; text: string };

/** Callout tones follow the product's status colours. */
export type DocsCalloutTone = 'info' | 'warning' | 'danger';

export interface DocsPage {
  /** URL segment, stable across languages so a link survives a locale switch. */
  slug: string;
  title: string;
  /** One sentence under the title, and the text in the section index. */
  summary: string;
  blocks: DocsBlock[];
}

export interface DocsSection {
  slug: string;
  title: string;
  summary: string;
  pages: DocsPage[];
}

/** Language codes the documentation is written in. */
export const DOCS_LOCALES = ['en', 'id'] as const;

export type DocsLocale = (typeof DOCS_LOCALES)[number];

export function isDocsLocale(value: string): value is DocsLocale {
  return (DOCS_LOCALES as readonly string[]).includes(value);
}
