import type {
  DocsLocale,
  DocsPage,
  DocsSection,
  DocsSectionAppLink,
} from '../-rules/content';
import { DOCS_LOCALES, isDocsLocale } from '../-rules/content';

import { splitFrontmatter } from './frontmatter';

/**
 * Where the documentation lives, as Vite names files found by
 * `import.meta.glob`.
 */
export const DOCS_ROOT = '/src/documentations';

/** The raw files the documentation is built from, keyed by their path. */
export interface DocsSources {
  /** `.md` file contents. */
  pages: Record<string, string>;
  /** Parsed `_category_.json` files. */
  categories: Record<string, unknown>;
}

export type DocsTree = Record<DocsLocale, DocsSection[]>;

interface CategoryFile {
  label?: unknown;
  position?: unknown;
  description?: unknown;
  link?: { description?: unknown };
  app?: { label?: unknown; href?: unknown };
}

/**
 * Builds the documentation, per language, from its source files.
 *
 * A file that is missing what a reader needs — a title, a summary — fails
 * here, at build time, naming the file, rather than shipping a blank page.
 */
export function buildDocsTree(sources: DocsSources): DocsTree {
  const tree = Object.fromEntries(
    DOCS_LOCALES.map((locale) => [locale, [] as DocsSection[]]),
  ) as DocsTree;

  const sections = new Map<string, DocsSection>();

  for (const [file, raw] of Object.entries(sources.categories)) {
    const location = locate(file);
    if (!location || !file.endsWith('/_category_.json')) continue;

    const category = (raw ?? {}) as CategoryFile;
    const title = asText(category.label);
    const summary =
      asText(category.description) ?? asText(category.link?.description);

    if (!title) throw new Error(`${file}: "label" is required.`);
    if (!summary) throw new Error(`${file}: "description" is required.`);

    const section: DocsSection = {
      slug: location.section,
      title,
      summary,
      position: asNumber(category.position) ?? Number.MAX_SAFE_INTEGER,
      app: appLink(category.app),
      pages: [],
    };

    sections.set(`${location.locale}/${location.section}`, section);
    tree[location.locale].push(section);
  }

  for (const [file, raw] of Object.entries(sources.pages)) {
    const location = locate(file);
    if (!location?.page) continue;

    const section = sections.get(`${location.locale}/${location.section}`);
    if (!section) {
      throw new Error(`${file}: its folder has no _category_.json.`);
    }

    section.pages.push(readPage(file, location.page, raw));
  }

  for (const locale of DOCS_LOCALES) {
    tree[locale].sort(byPosition);
    for (const section of tree[locale]) section.pages.sort(byPosition);
  }

  return tree;
}

function readPage(file: string, fileName: string, raw: string): DocsPage {
  const { body, data } = splitFrontmatter(raw);

  const title = data.title;
  const summary = data.description;
  if (!title) throw new Error(`${file}: frontmatter "title" is required.`);
  if (!summary) {
    throw new Error(`${file}: frontmatter "description" is required.`);
  }

  const slug = (data.slug ?? fileName.replace(/\.md$/, '')).replace(
    /^\/+|\/+$/g,
    '',
  );
  if (!/^[a-z0-9][a-z0-9-]*$/.test(slug)) {
    throw new Error(`${file}: slug "${slug}" must be lowercase kebab-case.`);
  }

  return {
    slug,
    title,
    summary,
    position: asNumber(data.sidebar_position) ?? Number.MAX_SAFE_INTEGER,
    file,
    markdown: body,
  };
}

/**
 * Reads `<root>/<locale>/<section>/<page>.md` out of a path. Files elsewhere,
 * such as the README or the shared assets folder, are not pages.
 */
function locate(file: string) {
  if (!file.startsWith(`${DOCS_ROOT}/`)) return undefined;

  const [locale = '', section, page, ...rest] = file
    .slice(DOCS_ROOT.length + 1)
    .split('/');
  if (!isDocsLocale(locale) || !section || rest.length) return undefined;

  return {
    locale,
    section,
    page: page && page !== '_category_.json' ? page : undefined,
  };
}

function byPosition<T extends { position: number; slug: string }>(a: T, b: T) {
  return a.position - b.position || a.slug.localeCompare(b.slug);
}

function asText(value: unknown) {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function asNumber(value: unknown) {
  const number = typeof value === 'string' ? Number(value) : value;
  return typeof number === 'number' && Number.isFinite(number)
    ? number
    : undefined;
}

function appLink(value: CategoryFile['app']): DocsSectionAppLink | undefined {
  const label = asText(value?.label);
  const href = asText(value?.href);

  return label && href?.startsWith('/') ? { label, href } : undefined;
}
