import { describe, expect, it } from 'vitest';

import { noIndexHead, seoHead } from './head';
import { SITE, siteUrl } from './site';

function metaContent(
  head: ReturnType<typeof seoHead>,
  key: string,
): string | undefined {
  return head.meta.find((m) => m.name === key || m.property === key)?.content;
}

describe('seoHead', () => {
  const head = seoHead({
    title: 'AWS',
    description: 'Create a least-privilege IAM user.',
    path: '/docs/servers/provider-aws/',
    type: 'article',
    jsonLd: [{ '@type': 'TechArticle' }],
  });

  it('brands the title and points the canonical URL at the page', () => {
    expect(head.meta[0]).toEqual({ title: `AWS | ${SITE.name}` });
    expect(head.links).toEqual([
      {
        rel: 'canonical',
        href: 'https://dnocs.devetek.app/docs/servers/provider-aws',
      },
    ]);
  });

  it('fills Open Graph and Twitter cards with absolute URLs', () => {
    expect(metaContent(head, 'og:type')).toBe('article');
    expect(metaContent(head, 'og:url')).toBe(
      'https://dnocs.devetek.app/docs/servers/provider-aws',
    );
    expect(metaContent(head, 'og:image')).toBe(
      'https://dnocs.devetek.app/og-image.png',
    );
    expect(metaContent(head, 'twitter:card')).toBe('summary_large_image');
    expect(metaContent(head, 'robots')).toContain('index, follow');
  });

  it('renders structured data as JSON-LD scripts', () => {
    expect(head.scripts).toEqual([
      {
        type: 'application/ld+json',
        children: '{"@type":"TechArticle"}',
      },
    ]);
  });

  it('keeps an exact title for the home page', () => {
    const home = seoHead({
      title: 'dPanel - dNocs',
      description: 'd',
      path: '/',
      exactTitle: true,
    });
    expect(home.meta[0]).toEqual({ title: 'dPanel - dNocs' });
    expect(home.links[0]?.href).toBe('https://dnocs.devetek.app/');
  });
});

describe('noIndexHead', () => {
  it('keeps the page out of search results', () => {
    expect(noIndexHead('Dashboard').meta).toContainEqual({
      name: 'robots',
      content: 'noindex, follow',
    });
  });
});

describe('siteUrl', () => {
  it.each([
    ['/', 'https://dnocs.devetek.app/'],
    ['docs/intro', 'https://dnocs.devetek.app/docs/intro'],
    ['/docs/intro/', 'https://dnocs.devetek.app/docs/intro'],
  ])('%s → %s', (path, url) => {
    expect(siteUrl(path)).toBe(url);
  });
});
