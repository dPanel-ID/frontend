// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { DOCS_INTRO_EN } from '../-content/intro.en';
import { DOCS_INTRO_ID } from '../-content/intro.id';

import { DocsIntroContent } from './DocsIntroContent';

describe('DocsIntroContent', () => {
  // This suite renders the same component repeatedly; without an explicit
  // cleanup the earlier trees stay in the document and every count doubles.
  afterEach(cleanup);

  it('walks the reader from nothing to a running application', () => {
    render(<DocsIntroContent locale="en" />);

    for (const step of DOCS_INTRO_EN.start.steps) {
      expect(screen.getByRole('heading', { name: step.title })).toBeTruthy();
    }
  });

  it('names every capability rather than describing a feeling', () => {
    render(<DocsIntroContent locale="en" />);

    for (const item of DOCS_INTRO_EN.capabilities.items) {
      expect(screen.getByRole('heading', { name: item.title })).toBeTruthy();
    }
  });

  it('gives the lock-in answer its own section', () => {
    render(<DocsIntroContent locale="en" />);

    // The strongest argument for a sceptical reader; it must not be a footnote.
    expect(
      screen.getByRole('heading', { name: DOCS_INTRO_EN.ownership.title }),
    ).toBeTruthy();
    expect(screen.getByText(DOCS_INTRO_EN.ownership.lead)).toBeTruthy();
  });

  it('asks for an account at the top and at the bottom', () => {
    render(<DocsIntroContent locale="en" />);

    const ctas = screen.getAllByRole('link', {
      name: DOCS_INTRO_EN.hero.primaryCta,
    });
    expect(ctas).toHaveLength(2);
    for (const cta of ctas) {
      expect(cta.getAttribute('href')).toBe('/');
    }
  });

  it('opens the video in a new tab without leaking the referrer', () => {
    render(<DocsIntroContent locale="en" />);

    const links = screen.getAllByRole('link', {
      name: DOCS_INTRO_EN.hero.secondaryCta,
    });
    expect(links).toHaveLength(2);
    for (const link of links) {
      expect(link.getAttribute('href')).toBe(
        'https://www.youtube.com/@dpanel_id',
      );
      expect(link.getAttribute('target')).toBe('_blank');
      expect(link.getAttribute('rel')).toBe('noopener noreferrer');
    }
  });

  it('shows one card per topic, opening it at its first page', () => {
    render(
      <DocsIntroContent
        locale="en"
        sections={[
          {
            slug: 'servers',
            title: 'Servers',
            summary: 'About servers',
            pages: [
              {
                slug: 'overview',
                title: 'What a server is here',
                summary: 'One Linux machine dPanel looks after.',
                blocks: [],
              },
            ],
          },
        ]}
      />,
    );

    // A card stands for the subject, not for every page inside it: the
    // section's own title and summary, linking to where that subject starts.
    const link = screen.getByRole('link', { name: /Servers/ });
    expect(link.getAttribute('href')).toBe('/docs/servers/overview');
    expect(screen.getByText('About servers')).toBeTruthy();
    expect(
      screen.queryByRole('link', { name: /What a server is here/ }),
    ).toBeNull();
  });

  it('omits the guides section when there are no guides yet', () => {
    render(<DocsIntroContent locale="en" />);

    expect(screen.queryByRole('link', { name: /Servers/ })).toBeNull();
  });

  it('skips a topic that has no pages written yet', () => {
    // The grid is waiting on cloud projects, SSH keys, load balancers and the
    // rest; an empty one must not ship a card that opens nothing.
    render(
      <DocsIntroContent
        locale="en"
        sections={[
          {
            slug: 'domains',
            title: 'Domains',
            summary: 'About domains',
            pages: [],
          },
        ]}
      />,
    );

    expect(screen.queryByRole('link', { name: /Domains/ })).toBeNull();
  });

  it('reads in Indonesian when the app does', () => {
    render(<DocsIntroContent locale="id" />);

    expect(
      screen.getByRole('heading', { level: 1, name: DOCS_INTRO_ID.hero.title }),
    ).toBeTruthy();
    expect(
      screen.getAllByRole('link', { name: DOCS_INTRO_ID.hero.primaryCta }),
    ).toHaveLength(2);
  });

  it.each([undefined, 'en-GB', 'fr', ''])(
    'falls back to English for locale %s rather than rendering nothing',
    (locale) => {
      render(<DocsIntroContent locale={locale} />);

      expect(
        screen.getByRole('heading', { name: DOCS_INTRO_EN.ownership.title }),
      ).toBeTruthy();
    },
  );

  it('keeps both language files structurally identical', () => {
    // A missing step or capability in one language would silently ship a
    // shorter page to those readers.
    expect(DOCS_INTRO_ID.start.steps).toHaveLength(
      DOCS_INTRO_EN.start.steps.length,
    );
    expect(DOCS_INTRO_ID.capabilities.items.map((i) => i.key)).toEqual(
      DOCS_INTRO_EN.capabilities.items.map((i) => i.key),
    );
    expect(DOCS_INTRO_ID.providers.items).toHaveLength(
      DOCS_INTRO_EN.providers.items.length,
    );
  });
});
