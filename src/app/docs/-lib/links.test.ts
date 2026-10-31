import { describe, expect, it } from 'vitest';

import { joinPath, resolveDocsImage, resolveDocsLink } from './links';

const FROM = '/src/documentations/id/servers/overview.md';

const FILES = new Map([
  [
    '/src/documentations/id/applications/create.md',
    { section: 'applications', page: 'create-an-application' },
  ],
  [
    '/src/documentations/id/servers/delete.md',
    { section: 'servers', page: 'delete-a-server' },
  ],
]);

describe('joinPath', () => {
  it.each([
    ['/a/b', '../c/d.md', '/a/c/d.md'],
    ['/a/b', './c.md', '/a/b/c.md'],
    ['/a/b', 'c.md', '/a/b/c.md'],
    ['/a/b', '../../../x.md', '/x.md'],
    ['/a/b', '/abs/x.md', '/abs/x.md'],
  ])('joins %s and %s', (directory, relative, expected) => {
    expect(joinPath(directory, relative)).toBe(expected);
  });
});

describe('resolveDocsLink', () => {
  it.each([
    [
      'a sibling page file',
      'delete.md',
      { kind: 'page', section: 'servers', page: 'delete-a-server' },
    ],
    [
      'a page in another section, with its heading',
      '../applications/create.md#environment',
      {
        kind: 'page',
        section: 'applications',
        page: 'create-an-application',
        hash: 'environment',
      },
    ],
    [
      'a documentation route',
      '/docs/teams/members-and-roles',
      { kind: 'page', section: 'teams', page: 'members-and-roles' },
    ],
    ['the introduction', '/docs/intro', { kind: 'app', href: '/docs/intro' }],
    ['an app page', '/servers', { kind: 'app', href: '/servers' }],
    ['a heading on the page', '#logs', { kind: 'anchor', hash: 'logs' }],
    [
      'a website',
      'https://github.com/dPanel-ID',
      { kind: 'external', href: 'https://github.com/dPanel-ID' },
    ],
    [
      'an email address',
      'mailto:support@example.com',
      { kind: 'external', href: 'mailto:support@example.com' },
    ],
    ['a missing page file', 'nope.md', { kind: 'broken', href: 'nope.md' }],
    [
      'a relative link that is not a page',
      '../assets/x.webp',
      { kind: 'broken', href: '../assets/x.webp' },
    ],
  ])('resolves %s', (_, href, expected) => {
    expect(resolveDocsLink(href, FROM, FILES)).toEqual(expected);
  });
});

describe('resolveDocsImage', () => {
  const urls = {
    '/src/documentations/assets/servers/list.webp': '/assets/list-3f2a.webp',
  };

  it.each([
    [
      'a relative image',
      '../../assets/servers/list.webp',
      '/assets/list-3f2a.webp',
    ],
    ['a missing image', '../../assets/servers/gone.webp', undefined],
    [
      'an image on the web',
      'https://example.com/a.png',
      'https://example.com/a.png',
    ],
  ])('resolves %s', (_, src, expected) => {
    expect(resolveDocsImage(src, FROM, urls)).toBe(expected);
  });
});
