// @vitest-environment jsdom

import {
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRouter,
} from '@tanstack/react-router';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { DevetekIntlProvider } from '@/services/i18n';
import messages from '@/services/i18n/config/dict-en.json';

import type { DocsLinkTarget } from '../../../-lib/links';

import { DocsMarkdown, headingId } from '.';

function resolveLink(href: string): DocsLinkTarget {
  if (href === 'deploy.md') {
    return { kind: 'page', section: 'applications', page: 'deploy' };
  }
  if (href.startsWith('https:')) return { kind: 'external', href };
  return { kind: 'broken', href };
}

function resolveImage(src: string) {
  return src === './shot.webp' ? '/assets/shot-abc.webp' : undefined;
}

async function renderMarkdown(markdown: string) {
  const rootRoute = createRootRoute({
    component: () => (
      <DevetekIntlProvider locale="en" messages={messages}>
        <DocsMarkdown
          markdown={markdown}
          resolveLink={resolveLink}
          resolveImage={resolveImage}
        />
      </DevetekIntlProvider>
    ),
  });
  const router = createRouter({
    routeTree: rootRoute,
    history: createMemoryHistory({ initialEntries: ['/'] }),
  });
  await router.load();

  return render(<RouterProvider router={router} />);
}

describe('DocsMarkdown', () => {
  afterEach(cleanup);

  it('draws an admonition as a callout, with its title or the default', async () => {
    const { container } = await renderMarkdown(
      ':::danger[This cannot be undone]\nThe machine is destroyed.\n:::\n\n:::tip\nShort.\n:::',
    );

    const callouts = container.querySelectorAll('aside[data-callout]');
    expect([...callouts].map((c) => c.getAttribute('data-callout'))).toEqual([
      'danger',
      'info',
    ]);
    expect(screen.getByText('This cannot be undone')).toBeTruthy();
    expect(screen.getByText('Tip')).toBeTruthy();
  });

  it('numbers an ordered list as steps, honouring its start', async () => {
    await renderMarkdown('3. Open **Servers**\n4. Press `Create`');

    const items = screen.getAllByRole('listitem');
    expect(items.map((item) => item.textContent)).toEqual([
      '3Open Servers',
      '4Press Create',
    ]);
  });

  it('routes a page link, opens a website in a new tab, and defuses a broken link', async () => {
    await renderMarkdown(
      '[Deploy](deploy.md), [GitHub](https://github.com) and [gone](gone.md).',
    );

    expect(
      screen.getByRole('link', { name: 'Deploy' }).getAttribute('href'),
    ).toBe('/docs/applications/deploy');
    const external = screen.getByRole('link', { name: 'GitHub' });
    expect(external.getAttribute('target')).toBe('_blank');
    expect(external.getAttribute('rel')).toBe('noopener noreferrer');
    expect(screen.queryByRole('link', { name: 'gone' })).toBeNull();
  });

  it('serves an image from its fingerprinted URL, as a captioned figure', async () => {
    const { container } = await renderMarkdown(
      '![The server list](./shot.webp "Servers, with one ready")',
    );

    const image = screen.getByRole('img', { name: 'The server list' });
    expect(image.getAttribute('src')).toBe('/assets/shot-abc.webp');
    expect(container.querySelector('figcaption')?.textContent).toBe(
      'Servers, with one ready',
    );
    // A figure inside a paragraph is invalid HTML.
    expect(container.querySelector('p figure')).toBeNull();
  });

  it('renders a GFM table and labels a code block with its language', async () => {
    const { container } = await renderMarkdown(
      '| Field | Meaning |\n| --- | --- |\n| Port | Where it listens |\n\n```bash\nssh dpanel@203.0.113.10\n```',
    );

    expect(screen.getByRole('columnheader', { name: 'Field' })).toBeTruthy();
    expect(screen.getByRole('cell', { name: 'Where it listens' })).toBeTruthy();
    expect(screen.getByText('bash')).toBeTruthy();
    expect(container.querySelector('pre code')?.textContent).toBe(
      'ssh dpanel@203.0.113.10\n',
    );
  });

  it('gives headings ids that page links can land on', async () => {
    await renderMarkdown('## What happens next?');

    expect(screen.getByRole('heading', { name: 'What happens next?' }).id).toBe(
      'what-happens-next',
    );
    expect(headingId('Langkah 2: Lokasi & ukuran')).toBe(
      'langkah-2-lokasi-ukuran',
    );
  });
});
