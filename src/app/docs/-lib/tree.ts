import type {
  DocsColor,
  DocsGroup,
  DocsIcon,
  DocsLocale,
  DocsNavItem,
  DocsPage,
  DocsSection,
  DocsSectionAppLink,
} from '../-rules/content';
import {
  DOCS_LOCALES,
  isDocsColor,
  isDocsIcon,
  isDocsLocale,
} from '../-rules/content';

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
  icon?: unknown;
  color?: unknown;
  link?: { description?: unknown };
  app?: { label?: unknown; href?: unknown };
}

const DEFAULT_COLOR: DocsColor = 'sky';

/** A group's own page: `index.md`, the way Docusaurus names it. */
const GROUP_INDEX = 'index.md';

/**
 * Builds the documentation, per language, from its source files.
 *
 * A section is a folder with a `_category_.json`; a folder inside it with
 * its own `_category_.json` is a group. Groups go one level deep, which is
 * as far as an index stays readable.
 *
 * A file that is missing what a reader needs — a title, a summary — or that
 * names an icon or colour that does not exist fails here, at build time,
 * naming the file, rather than shipping a blank page.
 */
export function buildDocsTree(sources: DocsSources): DocsTree {
  const tree = Object.fromEntries(
    DOCS_LOCALES.map((locale) => [locale, [] as DocsSection[]]),
  ) as DocsTree;

  const sections = new Map<string, DocsSection>();
  const groups = new Map<string, DocsGroup>();
  const categoryEntries = Object.entries(sources.categories).filter(([file]) =>
    file.endsWith('/_category_.json'),
  );

  for (const [file, raw] of categoryEntries) {
    const location = locate(file);
    if (!location || location.group) continue;

    const category = readCategory(file, raw);
    const section: DocsSection = {
      slug: location.section,
      title: category.title,
      summary: category.summary,
      position: category.position,
      icon: category.icon,
      color: category.color ?? DEFAULT_COLOR,
      app: appLink(category.app),
      nav: [],
      pages: [],
    };

    sections.set(`${location.locale}/${location.section}`, section);
    tree[location.locale].push(section);
  }

  for (const [file, raw] of categoryEntries) {
    const location = locate(file);
    if (!location?.group) continue;

    const section = sections.get(`${location.locale}/${location.section}`);
    if (!section)
      throw new Error(`${file}: its section has no _category_.json.`);

    const category = readCategory(file, raw);
    const group: DocsGroup = {
      slug: location.group,
      title: category.title,
      summary: category.summary,
      position: category.position,
      icon: category.icon,
      pages: [],
    };

    groups.set(
      `${location.locale}/${location.section}/${location.group}`,
      group,
    );
    section.nav.push({ kind: 'group', group });
  }

  for (const [file, raw] of Object.entries(sources.pages)) {
    const location = locate(file);
    if (!location?.page) continue;

    const sectionKey = `${location.locale}/${location.section}`;
    const section = sections.get(sectionKey);
    if (!section) {
      throw new Error(`${file}: its folder has no _category_.json.`);
    }

    if (!location.group) {
      section.nav.push({
        kind: 'page',
        page: readPage(file, location.page, raw),
      });
      continue;
    }

    const group = groups.get(`${sectionKey}/${location.group}`);
    if (!group) {
      throw new Error(`${file}: its folder has no _category_.json.`);
    }

    if (location.page === GROUP_INDEX) {
      group.page = readPage(file, location.group, raw, group.icon);
    } else {
      group.pages.push(readPage(file, location.page, raw));
    }
  }

  for (const locale of DOCS_LOCALES) {
    tree[locale].sort(byPosition);

    for (const section of tree[locale]) {
      section.nav.sort((a, b) => byPosition(navOrder(a), navOrder(b)));
      for (const item of section.nav) {
        if (item.kind === 'group') item.group.pages.sort(byPosition);
      }
      section.pages = flattenNav(section.nav);
      assertUniqueSlugs(locale, section);
    }
  }

  return tree;
}

/** Every page of an index in reading order: a group's own page first. */
function flattenNav(nav: DocsNavItem[]): DocsPage[] {
  return nav.flatMap((item) =>
    item.kind === 'page'
      ? [item.page]
      : [...(item.group.page ? [item.group.page] : []), ...item.group.pages],
  );
}

function navOrder(item: DocsNavItem) {
  return item.kind === 'page' ? item.page : item.group;
}

/** Pages in a group keep flat URLs, so two pages may not share a slug. */
function assertUniqueSlugs(locale: DocsLocale, section: DocsSection) {
  const seen = new Set<string>();

  for (const page of section.pages) {
    if (seen.has(page.slug)) {
      throw new Error(
        `${page.file}: slug "${page.slug}" is already used in ${locale}/${section.slug}.`,
      );
    }
    seen.add(page.slug);
  }
}

function readCategory(file: string, raw: unknown) {
  const category = (raw ?? {}) as CategoryFile;
  const title = asText(category.label);
  const summary =
    asText(category.description) ?? asText(category.link?.description);

  if (!title) throw new Error(`${file}: "label" is required.`);
  if (!summary) throw new Error(`${file}: "description" is required.`);

  const color = asText(category.color);
  if (color && !isDocsColor(color)) {
    throw new Error(`${file}: "color" "${color}" is not a docs colour.`);
  }

  return {
    title,
    summary,
    position: asNumber(category.position) ?? Number.MAX_SAFE_INTEGER,
    icon: readIcon(file, asText(category.icon)),
    color: color as DocsColor | undefined,
    app: category.app,
  };
}

function readPage(
  file: string,
  fileName: string,
  raw: string,
  fallbackIcon?: DocsIcon,
): DocsPage {
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
    label: data.sidebar_label || title,
    icon: readIcon(file, data.sidebar_icon) ?? fallbackIcon,
    summary,
    position: asNumber(data.sidebar_position) ?? Number.MAX_SAFE_INTEGER,
    file,
    markdown: body,
  };
}

function readIcon(file: string, value: string | undefined) {
  if (!value) return undefined;
  if (!isDocsIcon(value)) {
    throw new Error(`${file}: icon "${value}" is not a docs icon.`);
  }
  return value;
}

/**
 * Reads `<root>/<locale>/<section>/[<group>/]<file>` out of a path. Files
 * elsewhere, such as the README or the shared assets folder, are not pages.
 */
function locate(file: string) {
  if (!file.startsWith(`${DOCS_ROOT}/`)) return undefined;

  const parts = file.slice(DOCS_ROOT.length + 1).split('/');
  const [locale = '', section, ...rest] = parts;
  if (!isDocsLocale(locale) || !section || rest.length > 2) return undefined;

  const name = rest.at(-1);
  const group = rest.length === 2 ? rest[0] : undefined;

  return {
    locale,
    section,
    group,
    page: name && name !== '_category_.json' ? name : undefined,
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
