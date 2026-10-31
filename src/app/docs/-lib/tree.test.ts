import { describe, expect, it } from 'vitest';

import { buildDocsTree } from './tree';

const ROOT = '/src/documentations';

function page(title: string, position?: number, extra = '') {
  const order = position === undefined ? '' : `sidebar_position: ${position}\n`;
  return `---\ntitle: ${title}\ndescription: About ${title}\n${order}${extra}---\n\n${title} body`;
}

describe('buildDocsTree', () => {
  it('orders sections and pages by position, then by slug', () => {
    const tree = buildDocsTree({
      categories: {
        [`${ROOT}/en/servers/_category_.json`]: {
          label: 'Servers',
          position: 2,
          description: 'Machines',
          app: { label: 'Open servers', href: '/servers' },
        },
        [`${ROOT}/en/getting-started/_category_.json`]: {
          label: 'Getting started',
          position: 1,
          link: { description: 'First steps' },
        },
      },
      pages: {
        [`${ROOT}/en/servers/b.md`]: page('B'),
        [`${ROOT}/en/servers/a.md`]: page('A'),
        [`${ROOT}/en/servers/delete.md`]: page('Delete', 3),
        [`${ROOT}/en/servers/intro.md`]: page('Intro', 1),
        [`${ROOT}/en/getting-started/sign-in.md`]: page('Sign in', 1),
      },
    });

    expect(tree.en.map((section) => section.slug)).toEqual([
      'getting-started',
      'servers',
    ]);
    expect(tree.en[1]?.pages.map((p) => p.slug)).toEqual([
      'intro',
      'delete',
      'a',
      'b',
    ]);
    expect(tree.en[0]?.summary).toBe('First steps');
    expect(tree.en[1]?.app).toEqual({
      label: 'Open servers',
      href: '/servers',
    });
    expect(tree.id).toEqual([]);
  });

  it('reads a page from its frontmatter and keeps the body as Markdown', () => {
    const tree = buildDocsTree({
      categories: {
        [`${ROOT}/id/servers/_category_.json`]: {
          label: 'Server',
          description: 'Mesin',
        },
      },
      pages: {
        [`${ROOT}/id/servers/02-overview.md`]: page(
          'Ringkasan',
          1,
          'slug: overview\n',
        ),
      },
    });

    expect(tree.id[0]?.pages[0]).toEqual({
      slug: 'overview',
      title: 'Ringkasan',
      summary: 'About Ringkasan',
      position: 1,
      file: `${ROOT}/id/servers/02-overview.md`,
      markdown: 'Ringkasan body',
    });
  });

  it('ignores files outside a locale section, such as the README and assets', () => {
    const tree = buildDocsTree({
      categories: {},
      pages: {
        [`${ROOT}/README.md`]: '# Readme',
        [`${ROOT}/assets/servers/notes.md`]: page('Notes'),
        [`${ROOT}/fr/servers/x.md`]: page('X'),
      },
    });

    expect(tree.en).toEqual([]);
    expect(tree.id).toEqual([]);
  });

  it.each([
    [
      'a page without a title',
      { [`${ROOT}/en/s/p.md`]: '---\ndescription: d\n---\nBody' },
      /"title" is required/,
    ],
    [
      'a page without a description',
      { [`${ROOT}/en/s/p.md`]: '---\ntitle: t\n---\nBody' },
      /"description" is required/,
    ],
    [
      'a slug that is not kebab-case',
      { [`${ROOT}/en/s/p.md`]: page('T', 1, 'slug: Not Valid\n') },
      /kebab-case/,
    ],
    [
      'a page whose folder has no _category_.json',
      { [`${ROOT}/en/other/p.md`]: page('T') },
      /no _category_.json/,
    ],
  ])('fails the build on %s, naming the file', (_, pages, error) => {
    expect(() =>
      buildDocsTree({
        categories: {
          [`${ROOT}/en/s/_category_.json`]: { label: 'S', description: 'D' },
        },
        pages,
      }),
    ).toThrow(error);
  });

  it('fails the build on a category without a label', () => {
    expect(() =>
      buildDocsTree({
        categories: { [`${ROOT}/en/s/_category_.json`]: { description: 'D' } },
        pages: {},
      }),
    ).toThrow(/"label" is required/);
  });
});
