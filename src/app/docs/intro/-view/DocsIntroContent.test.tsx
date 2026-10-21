// @vitest-environment jsdom

import { cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { DOCS_INTRO_EN } from '../-content/intro.en';
import { DOCS_INTRO_ID } from '../-content/intro.id';

import { DocsIntroContent } from './DocsIntroContent';

describe('DocsIntroContent', () => {
  // This suite renders the same component repeatedly; without an explicit
  // cleanup the earlier trees stay in the document and every count doubles.
  afterEach(cleanup);

  it('names the product in the heading rather than describing a posture', () => {
    render(<DocsIntroContent locale="en" />);

    expect(
      screen.getByRole('heading', { level: 1, name: DOCS_INTRO_EN.hero.title }),
    ).toBeTruthy();
    // The subtitle has to say what dPanel does, not what the reader should feel.
    expect(screen.getByText(DOCS_INTRO_EN.hero.subtitle)).toBeTruthy();
  });

  it('offers the account call to action twice, top and bottom', () => {
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

    const videoLinks = screen.getAllByRole('link', {
      name: DOCS_INTRO_EN.hero.secondaryCta,
    });
    expect(videoLinks).toHaveLength(2);
    for (const link of videoLinks) {
      expect(link.getAttribute('href')).toBe(
        'https://www.youtube.com/@dpanel_id',
      );
      expect(link.getAttribute('target')).toBe('_blank');
      expect(link.getAttribute('rel')).toBe('noopener noreferrer');
    }
  });

  it('lists every provider a reader could start with', () => {
    render(<DocsIntroContent locale="en" />);

    const providers = screen.getByRole('list', {
      name: DOCS_INTRO_EN.providers.title,
    });
    for (const provider of DOCS_INTRO_EN.providers.items) {
      expect(within(providers).getByText(provider)).toBeTruthy();
    }
  });

  it('walks the reader from nothing to a running application', () => {
    render(<DocsIntroContent locale="en" />);

    for (const step of DOCS_INTRO_EN.start.steps) {
      expect(screen.getByRole('heading', { name: step.title })).toBeTruthy();
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
        screen.getByRole('heading', {
          level: 1,
          name: DOCS_INTRO_EN.hero.title,
        }),
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
