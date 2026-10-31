import type { DocsTree } from './tree';

/** What a link in a documentation page points at. */
export type DocsLinkTarget =
  /** Another documentation page, opened through the router. */
  | { kind: 'page'; section: string; page: string; hash?: string }
  /** A heading on the same page. */
  | { kind: 'anchor'; hash: string }
  /** Another page of the app, such as `/servers` or `/docs/intro`. */
  | { kind: 'app'; href: string }
  /** Somewhere outside the app. Opens in a new tab. */
  | { kind: 'external'; href: string }
  /** A `.md` link that names no page. Rendered as text, and caught by tests. */
  | { kind: 'broken'; href: string };

const EXTERNAL = /^(?:[a-z][a-z\d+.-]*:|\/\/)/i;

/** Joins a relative path onto a directory, resolving `.` and `..`. */
export function joinPath(directory: string, relative: string) {
  const parts = relative.startsWith('/') ? [] : directory.split('/');

  for (const part of relative.split('/')) {
    if (!part || part === '.') continue;
    if (part === '..') parts.pop();
    else parts.push(part);
  }

  return `/${parts.filter(Boolean).join('/')}`;
}

export function dirname(file: string) {
  return file.slice(0, file.lastIndexOf('/'));
}

function splitHash(href: string) {
  const index = href.indexOf('#');
  return index < 0
    ? { path: href, hash: undefined }
    : { path: href.slice(0, index), hash: href.slice(index + 1) || undefined };
}

/** Maps every page file to its route, for resolving relative `.md` links. */
export function indexDocsFiles(tree: DocsTree) {
  const index = new Map<string, { section: string; page: string }>();

  for (const sections of Object.values(tree)) {
    for (const section of sections) {
      for (const page of section.pages) {
        index.set(page.file, { section: section.slug, page: page.slug });
      }
    }
  }

  return index;
}

/**
 * Works out where a link written in a page goes.
 *
 * Authors link the way they would in Docusaurus: to another file
 * (`../applications/deploy.md#logs`), or to a route (`/docs/servers/overview`).
 * File links resolve against the page that holds them, so a translated page
 * links to the translated neighbour without anyone rewriting the link.
 */
export function resolveDocsLink(
  href: string,
  fromFile: string,
  files: ReadonlyMap<string, { section: string; page: string }>,
): DocsLinkTarget {
  if (EXTERNAL.test(href)) return { kind: 'external', href };
  if (href.startsWith('#')) return { kind: 'anchor', hash: href.slice(1) };

  const { hash, path } = splitHash(href);

  if (path.startsWith('/')) {
    const route = /^\/docs\/([^/]+)\/([^/]+)\/?$/.exec(path);
    if (route?.[1] && route[2]) {
      return { kind: 'page', section: route[1], page: route[2], hash };
    }

    return { kind: 'app', href };
  }

  if (!path.endsWith('.md')) return { kind: 'broken', href };

  const target = files.get(joinPath(dirname(fromFile), path));
  return target ? { kind: 'page', ...target, hash } : { kind: 'broken', href };
}

/**
 * The URL an image in a page is served from.
 *
 * Images sit beside the Markdown and are referenced by a relative path, so
 * they preview in any editor. Vite fingerprints each one at build time; this
 * looks the fingerprinted URL up. Unknown images resolve to `undefined`.
 */
export function resolveDocsImage(
  src: string,
  fromFile: string,
  urls: Readonly<Record<string, string>>,
) {
  if (EXTERNAL.test(src)) return src;

  return urls[joinPath(dirname(fromFile), src)];
}
