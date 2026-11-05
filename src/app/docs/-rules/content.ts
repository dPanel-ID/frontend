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

/**
 * Icons a page or a section may name in its `sidebar_icon` or `icon`. They
 * are lucide icon names, plus `provider:<id>` for a cloud provider's logo. A
 * name outside this list fails the build, so a typo never ships a blank tile.
 */
export const DOCS_ICON_NAMES = [
  'app-window',
  'bot',
  'boxes',
  'building-2',
  'circle-help',
  'clock',
  'cloud',
  'cloud-upload',
  'download',
  'file-text',
  'gauge',
  'git-branch',
  'globe',
  'history',
  'key-round',
  'layout-dashboard',
  'life-buoy',
  'list-checks',
  'log-in',
  'message-square',
  'network',
  'package-plus',
  'rocket',
  'scroll-text',
  'server',
  'settings-2',
  'shield-check',
  'sparkles',
  'square-plus',
  'square-terminal',
  'terminal',
  'timer',
  'trash-2',
  'user-cog',
  'users',
  'variable',
] as const;

export type DocsIconName = (typeof DOCS_ICON_NAMES)[number];

/** A cloud provider's logo, such as `provider:aws`. */
export type DocsProviderIcon = `provider:${string}`;

export type DocsIcon = DocsIconName | DocsProviderIcon;

export function isDocsIcon(value: string): value is DocsIcon {
  return (
    /^provider:[a-z0-9-]+$/.test(value) ||
    (DOCS_ICON_NAMES as readonly string[]).includes(value)
  );
}

/** The accent a section paints its icons and its active page in. */
export const DOCS_COLORS = [
  'sky',
  'indigo',
  'violet',
  'emerald',
  'amber',
  'teal',
  'rose',
] as const;

export type DocsColor = (typeof DOCS_COLORS)[number];

export function isDocsColor(value: string): value is DocsColor {
  return (DOCS_COLORS as readonly string[]).includes(value);
}

export interface DocsPage {
  /** URL segment, stable across languages so a link survives a locale switch. */
  slug: string;
  title: string;
  /** The name in the index, from `sidebar_label`; the title when unset. */
  label: string;
  icon?: DocsIcon;
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

/**
 * A folder inside a section, such as `servers/cloud-providers/`. It groups
 * pages in the index only: its pages keep flat URLs in the section, so a page
 * can move into or out of a group without breaking a link to it.
 */
export interface DocsGroup {
  slug: string;
  title: string;
  summary: string;
  position: number;
  icon?: DocsIcon;
  /** The group's own page, from its `index.md`, opened by its name. */
  page?: DocsPage;
  pages: DocsPage[];
}

/** One row of a section's index: a page, or a group of pages. */
export type DocsNavItem =
  | { kind: 'page'; page: DocsPage }
  | { kind: 'group'; group: DocsGroup };

export interface DocsSection {
  slug: string;
  title: string;
  summary: string;
  /** Order in the index, from `_category_.json`'s `position`. */
  position: number;
  icon?: DocsIcon;
  color: DocsColor;
  app?: DocsSectionAppLink;
  /** The index, as it is drawn: pages and groups in order. */
  nav: DocsNavItem[];
  /** Every page, groups flattened, in reading order. */
  pages: DocsPage[];
}

/** Language codes the documentation is written in. */
export const DOCS_LOCALES = ['en', 'id'] as const;

export type DocsLocale = (typeof DOCS_LOCALES)[number];

export function isDocsLocale(value: string): value is DocsLocale {
  return (DOCS_LOCALES as readonly string[]).includes(value);
}
