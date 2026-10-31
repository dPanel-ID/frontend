/**
 * The shape of the documentation.
 *
 * Long-form prose lives in Markdown files under `src/documentations`, one
 * tree per language, laid out the way Docusaurus lays out a docs folder: a
 * folder per section with a `_category_.json`, and a `.md` file per page with
 * frontmatter. Every string the documentation *chrome* shows — navigation,
 * callout labels, the previous and next links — still comes from the i18n
 * dictionaries.
 */

/** Callout tones follow the product's status colours. */
export type DocsCalloutTone = 'info' | 'warning' | 'danger';

/** The Docusaurus admonition kinds a page may use. */
export const DOCS_ADMONITIONS = [
  'note',
  'tip',
  'info',
  'warning',
  'danger',
] as const;

export type DocsAdmonition = (typeof DOCS_ADMONITIONS)[number];

/** Each admonition is drawn in one of the product's existing callout tones. */
export const ADMONITION_TONES: Record<DocsAdmonition, DocsCalloutTone> = {
  note: 'info',
  tip: 'info',
  info: 'info',
  warning: 'warning',
  danger: 'danger',
};

export function isDocsAdmonition(value: string): value is DocsAdmonition {
  return (DOCS_ADMONITIONS as readonly string[]).includes(value);
}

export interface DocsPage {
  /** URL segment, stable across languages so a link survives a locale switch. */
  slug: string;
  title: string;
  /** One sentence under the title, and the text in the section index. */
  summary: string;
  /** Order inside the section, from `sidebar_position`. */
  position: number;
  /**
   * Where the page was loaded from, as Vite names it
   * (`/src/documentations/en/servers/overview.md`). Relative links and
   * images in the page resolve against it.
   */
  file: string;
  /** The page body: Markdown, with the frontmatter removed. */
  markdown: string;
}

/** An optional button in a section's header that opens the product itself. */
export interface DocsSectionAppLink {
  label: string;
  /** An app path, such as `/servers`. */
  href: string;
}

export interface DocsSection {
  slug: string;
  title: string;
  summary: string;
  /** Order in the index, from `_category_.json`'s `position`. */
  position: number;
  app?: DocsSectionAppLink;
  pages: DocsPage[];
}

/** Language codes the documentation is written in. */
export const DOCS_LOCALES = ['en', 'id'] as const;

export type DocsLocale = (typeof DOCS_LOCALES)[number];

export function isDocsLocale(value: string): value is DocsLocale {
  return (DOCS_LOCALES as readonly string[]).includes(value);
}
