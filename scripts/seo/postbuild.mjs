#!/usr/bin/env node
/**
 * Finishes the static build for search engines and AI crawlers.
 *
 * Runs after `vite build` (see `build:static`) on `.output-static/client`,
 * where the home page and every docs page are already real HTML, and the
 * signed-in app is one shell, `app-shell.html`. It writes:
 *
 * - `_redirects`   Cloudflare Pages rules: bare docs paths redirect to their
 *                  first page; app routes are served the app shell.
 * - `_headers`     `noindex` on every other host that serves this build, so
 *                  only the canonical domain is indexed.
 * - `404.html`     A real 404 for unknown paths, instead of a 200 shell.
 * - `sitemap.xml`  Every prerendered page.
 * - `robots.txt`   Open to every crawler, AI ones named, with the sitemap.
 * - `llms.txt`     The site and its docs, for AI assistants (llmstxt.org).
 * - `llms-full.txt` The whole English documentation as Markdown.
 *
 * Everything is read from the build output, the route tree and the docs
 * Markdown, so new routes and pages are picked up without editing this file.
 */
import {
  existsSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import path from 'node:path';

const SITE_URL = 'https://dnocs.devetek.app';
const SITE_NAME = 'dPanel - dNocs';
const SITE_SUMMARY =
  'dPanel - dNocs (distributed Node & Operations Control system) is a web control panel for servers, applications and domains. It launches servers at AWS, Google Cloud, DigitalOcean, IDCloudHost and other providers, or connects a server you already run over SSH; installs databases and runtimes; deploys applications from GitHub; and manages DNS records, HTTPS load balancers, logs and team access.';
const APP_SHELL = 'app-shell';

/**
 * Hosts that serve this same build besides the canonical one: the Pages
 * project's own domain, and the beta domain. Each page's canonical link
 * already points at SITE_URL; `noindex` keeps the copies out of results.
 */
const MIRROR_HOSTS = [
  'https://:project.pages.dev',
  'https://dnocs-beta.devetek.app',
];

/** AI crawlers named in robots.txt, so their owners see they are welcome. */
const AI_CRAWLERS = [
  'GPTBot',
  'OAI-SearchBot',
  'ChatGPT-User',
  'ClaudeBot',
  'Claude-User',
  'Claude-SearchBot',
  'anthropic-ai',
  'PerplexityBot',
  'Perplexity-User',
  'Google-Extended',
  'Applebot-Extended',
  'Amazonbot',
  'meta-externalagent',
  'DuckAssistBot',
  'MistralAI-User',
  'cohere-ai',
  'CCBot',
];

const root = process.cwd();
const outDir = path.resolve(root, process.argv[2] ?? '.output-static/client');

if (!existsSync(path.join(outDir, `${APP_SHELL}.html`))) {
  throw new Error(
    `${outDir}/${APP_SHELL}.html is missing; run the static build first.`,
  );
}

const pages = prerenderedPages(outDir);
const docsOrder = docsNavOrder(outDir);
const orderedPages = orderPages(pages, docsOrder);

writeAppShellAnd404(outDir);
write('_redirects', redirects(appRoutePrefixes(), docsOrder));
write('_headers', headers());
write('sitemap.xml', sitemap(orderedPages));
write('robots.txt', robots());
write('llms.txt', llmsTxt(orderedPages));
write('llms-full.txt', llmsFull(orderedPages));

console.log(
  `[seo] ${orderedPages.length} pages in the sitemap, ${appRoutePrefixes().length} app routes on the shell.`,
);

// =============================================================================
//   Reading the build
// =============================================================================

/** Every prerendered page, with what its head says about it. */
function prerenderedPages(dir) {
  return listHtml(dir)
    .filter((file) => !/^(app-shell|404)\.html$/.test(file))
    .map((file) => {
      const html = readFileSync(path.join(dir, file), 'utf8');
      const urlPath =
        file === 'index.html' ? '/' : `/${file.replace(/\.html$/, '')}`;

      return {
        path: urlPath,
        title: decode(match(html, /<title>([^<]*)<\/title>/)),
        description: decode(
          match(html, /<meta name="description" content="([^"]*)"/),
        ),
        indexable: !/<meta name="robots" content="noindex/.test(html),
      };
    })
    .filter((page) => page.indexable);
}

function listHtml(dir, prefix = '') {
  return readdirSync(path.join(dir, prefix)).flatMap((name) => {
    const relative = prefix ? `${prefix}/${name}` : name;
    if (relative === 'assets') return [];
    if (statSync(path.join(dir, relative)).isDirectory()) {
      return listHtml(dir, relative);
    }
    return name.endsWith('.html') ? [relative] : [];
  });
}

/**
 * Docs pages in the order the docs index lists them, read from the built
 * pages' own navigation, so the sitemap and llms.txt follow the reading
 * order. A folded group only lists its pages on its own pages, so every
 * page's index is merged: a page first seen on one is placed after the page
 * it follows there.
 */
function docsNavOrder(dir) {
  const order = [];

  for (const file of listHtml(path.join(dir, 'docs'))) {
    const html = readFileSync(path.join(dir, 'docs', file), 'utf8');
    // Only the index itself: the breadcrumb and footer link elsewhere first.
    const nav = /<nav aria-label="Documentation sections"[\s\S]*?<\/nav>/.exec(
      html,
    )?.[0];
    if (!nav) continue;

    let previous;
    for (const [, href] of nav.matchAll(
      /href="(\/docs\/[a-z0-9-]+\/[a-z0-9-]+)"/g,
    )) {
      if (!order.includes(href)) {
        order.splice(
          previous === undefined ? order.length : order.indexOf(previous) + 1,
          0,
          href,
        );
      }
      previous = href;
    }
  }

  if (!order.length)
    throw new Error('No docs index found in the built docs pages.');
  return order;
}

function orderPages(all, docsOrder) {
  const rank = (page) => {
    if (page.path === '/') return -2;
    if (page.path === '/docs/intro') return -1;
    const index = docsOrder.indexOf(page.path);
    return index < 0 ? docsOrder.length : index;
  };
  return [...all].sort(
    (a, b) => rank(a) - rank(b) || a.path.localeCompare(b.path),
  );
}

/**
 * The first segment of every app route (`/servers`, `/backend`, …): the
 * signed-in app, which is served the shell. Read from the route tree so a new
 * module is covered the day it is added.
 */
function appRoutePrefixes() {
  const tree = readFileSync(path.join(root, 'src/routeTree.gen.ts'), 'utf8');
  const prefixes = new Set();
  for (const [, fullPath] of tree.matchAll(/fullPath: '([^']*)'/g)) {
    const first = fullPath.split('/')[1];
    if (first && first !== '$' && first !== 'docs') prefixes.add(`/${first}`);
  }
  return [...prefixes].sort();
}

// =============================================================================
//   Writing
// =============================================================================

/**
 * The shell is rendered at a path no route matches, so it carries the
 * not-found page's `noindex` head. `404.html` is that shell titled "Page not
 * found"; the shell itself gets the brand until the app sets a page's title.
 * Both titles are set outright, so running this twice changes nothing.
 */
function writeAppShellAnd404(dir) {
  const shellFile = path.join(dir, `${APP_SHELL}.html`);
  const shell = readFileSync(shellFile, 'utf8');
  const withTitle = (title) =>
    shell.replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`);

  writeFileSync(
    path.join(dir, '404.html'),
    withTitle(`Page not found | ${SITE_NAME}`),
  );
  writeFileSync(shellFile, withTitle(SITE_NAME));
}

function redirects(appPrefixes, docsOrder) {
  const lines = [
    '# Generated by scripts/seo/postbuild.mjs. Do not edit.',
    '# Rules apply before static files, so only paths without a page are listed.',
    '',
    '# Bare docs paths open their first page.',
    '/docs /docs/intro 301',
    '/docs/ /docs/intro 301',
  ];

  const firstBySection = new Map();
  for (const href of docsOrder) {
    const section = href.split('/')[2];
    if (!firstBySection.has(section)) firstBySection.set(section, href);
  }
  for (const [section, href] of firstBySection) {
    lines.push(`/docs/${section} ${href} 301`, `/docs/${section}/ ${href} 301`);
  }

  lines.push('', '# The signed-in app: one shell, routed in the browser.');
  for (const prefix of appPrefixes) {
    lines.push(`${prefix} /${APP_SHELL} 200`, `${prefix}/* /${APP_SHELL} 200`);
  }

  return `${lines.join('\n')}\n`;
}

function headers() {
  const lines = ['# Generated by scripts/seo/postbuild.mjs. Do not edit.'];
  for (const host of MIRROR_HOSTS) {
    lines.push('', `${host}/*`, '  X-Robots-Tag: noindex');
  }
  // Readable in a browser before anyone pipes it into a shell.
  lines.push('', '/installer.sh', '  Content-Type: text/plain; charset=utf-8');
  return `${lines.join('\n')}\n`;
}

function sitemap(all) {
  const priority = (page) =>
    page.path === '/' ? '1.0' : page.path === '/docs/intro' ? '0.9' : '0.7';
  const urls = all.map(
    (page) =>
      `  <url>\n    <loc>${SITE_URL}${page.path}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>${priority(page)}</priority>\n  </url>`,
  );

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`;
}

function robots() {
  return [
    `# ${SITE_NAME}: every public page and the documentation may be crawled.`,
    '# The signed-in app is marked noindex on the page itself.',
    'User-agent: *',
    'Allow: /',
    '',
    '# AI crawlers and assistants are welcome too. A summary for them is at',
    `# ${SITE_URL}/llms.txt and the full docs at ${SITE_URL}/llms-full.txt.`,
    ...AI_CRAWLERS.map((agent) => `User-agent: ${agent}`),
    'Allow: /',
    '',
    `Sitemap: ${SITE_URL}/sitemap.xml`,
    '',
  ].join('\n');
}

function llmsTxt(all) {
  const lines = [
    `# ${SITE_NAME}`,
    '',
    `> ${SITE_SUMMARY}`,
    '',
    `dNocs stands for distributed Node & Operations Control system. dPanel is the product name. Sign in at ${SITE_URL}/. The documentation is written in English and Indonesian; the links below are the English pages.`,
    '',
    '## Start here',
    '',
    `- [Home](${SITE_URL}/): what ${SITE_NAME} does, and sign-in`,
    `- [Documentation](${SITE_URL}/docs/intro): an overview of the product and its guides`,
  ];

  let currentSection;
  for (const page of all) {
    if (page.path === '/' || page.path === '/docs/intro') continue;
    const { pageTitle, section } = splitTitle(page.title);
    if (section !== currentSection) {
      currentSection = section;
      lines.push('', `## ${section}`, '');
    }
    lines.push(
      `- [${pageTitle}](${SITE_URL}${page.path}): ${page.description}`,
    );
  }

  lines.push(
    '',
    '## Optional',
    '',
    `- [Full documentation](${SITE_URL}/llms-full.txt): every page above as one Markdown file`,
    `- [Sitemap](${SITE_URL}/sitemap.xml)`,
    '',
  );

  return lines.join('\n');
}

/** The English docs as one Markdown file, in reading order. */
function llmsFull(all) {
  const sources = docsMarkdownByPath();
  const parts = [`# ${SITE_NAME} documentation`, '', `> ${SITE_SUMMARY}`, ''];

  for (const page of all) {
    const source = sources.get(page.path);
    if (!source) continue;
    parts.push(
      '---',
      '',
      `# ${source.title}`,
      '',
      `Source: ${SITE_URL}${page.path}`,
      '',
      source.description,
      '',
      // Images are relative to the docs folder; keep their descriptions.
      source.body.replace(/!\[([^\]]*)\]\([^)]*\)/g, '[Screenshot: $1]').trim(),
      '',
    );
  }

  return `${parts.join('\n')}\n`;
}

/** `src/documentations/en/<section>/[<group>/]<page>.md`, by URL path. */
function docsMarkdownByPath() {
  const base = path.join(root, 'src/documentations/en');
  const byPath = new Map();

  const visit = (dir, section, group) => {
    for (const name of readdirSync(dir)) {
      const full = path.join(dir, name);
      if (statSync(full).isDirectory()) {
        visit(full, section ?? name, section ? name : undefined);
        continue;
      }
      if (!section || !name.endsWith('.md')) continue;

      const raw = readFileSync(full, 'utf8');
      const { body, data } = frontmatter(raw);
      const fileSlug =
        name === 'index.md' && group ? group : name.replace(/\.md$/, '');
      const slug = (data.slug ?? fileSlug).replace(/^\/+|\/+$/g, '');

      byPath.set(`/docs/${section}/${slug}`, {
        title: data.title ?? slug,
        description: data.description ?? '',
        body,
      });
    }
  };

  visit(base);
  return byPath;
}

// =============================================================================
//   Helpers
// =============================================================================

function frontmatter(raw) {
  const result = /^---\n([\s\S]*?)\n---\n?/.exec(raw.replace(/\r\n?/g, '\n'));
  if (!result) return { data: {}, body: raw };

  const data = {};
  for (const line of result[1].split('\n')) {
    const pair = /^([A-Za-z_]+):\s*(.*)$/.exec(line);
    if (pair) data[pair[1]] = pair[2].replace(/^(['"])(.*)\1$/, '$2');
  }
  return { data, body: raw.slice(result[0].length) };
}

/** `AWS · Servers | dPanel - dNocs` → the page and its section. */
function splitTitle(title) {
  const withoutBrand = title.replace(` | ${SITE_NAME}`, '');
  const [pageTitle, section = 'Documentation'] = withoutBrand.split(' · ');
  return { pageTitle, section };
}

function match(text, pattern) {
  return pattern.exec(text)?.[1] ?? '';
}

function decode(text) {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

function write(name, content) {
  writeFileSync(path.join(outDir, name), content);
}
