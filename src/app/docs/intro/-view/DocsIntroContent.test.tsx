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

  it('closes by asking for an account', () => {
    render(<DocsIntroContent locale="en" />);

    const cta = screen.getByRole('link', {
      name: DOCS_INTRO_EN.hero.primaryCta,
    });
    expect(cta.getAttribute('href')).toBe('/');
  });

  it('opens the video in a new tab without leaking the referrer', () => {
    render(<DocsIntroContent locale="en" />);

    const link = screen.getByRole('link', {
      name: DOCS_INTRO_EN.hero.secondaryCta,
    });
    expect(link.getAttribute('href')).toBe(
      'https://www.youtube.com/@dpanel_id',
    );
    expect(link.getAttribute('target')).toBe('_blank');
    expect(link.getAttribute('rel')).toBe('noopener noreferrer');
  });

  it('links on to the guides so the introduction is not a dead end', () => {
    render(
      <DocsIntroContent
        locale="en"
        readMoreHref="/docs/servers/overview"
        readMoreLabel="What a server is here"
      />,
    );

    const link = screen.getByRole('link', { name: /What a server is here/ });
    expect(link.getAttribute('href')).toBe('/docs/servers/overview');
  });

  it('omits the guide link when there is no guide to point at', () => {
    render(<DocsIntroContent locale="en" />);

    expect(
      screen.queryByRole('link', { name: /What a server is here/ }),
    ).toBeNull();
  });

  it('reads in Indonesian when the app does', () => {
    render(<DocsIntroContent locale="id" />);

    expect(
      screen.getByRole('heading', { name: DOCS_INTRO_ID.ownership.title }),
    ).toBeTruthy();
    expect(
      screen.getByRole('link', { name: DOCS_INTRO_ID.hero.primaryCta }),
    ).toBeTruthy();
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
