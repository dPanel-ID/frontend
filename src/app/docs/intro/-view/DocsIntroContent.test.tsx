// @vitest-environment jsdom

import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { DocsIntroContent } from './DocsIntroContent';

describe('DocsIntroContent', () => {
  it('orients visitors with the video CTA and cloud-testing journey', () => {
    render(<DocsIntroContent />);

    expect(
      screen.getByRole('heading', {
        name: 'Learn, test, and choose the cloud that fits your application.',
      }),
    ).toBeTruthy();

    const videoLink = screen.getByRole('link', {
      name: 'Watch dPanel on YouTube',
    });

    expect(videoLink.getAttribute('href')).toBe(
      'https://www.youtube.com/@dpanel_id',
    );
    expect(videoLink.getAttribute('target')).toBe('_blank');
    expect(videoLink.getAttribute('rel')).toBe('noopener noreferrer');

    expect(
      screen
        .getByRole('link', { name: 'See the testing journey' })
        .getAttribute('href'),
    ).toBe('#testing-journey');

    for (const step of ['Learn', 'Test', 'Compare', 'Keep or move']) {
      expect(screen.getByText(step)).toBeTruthy();
    }

    expect(
      screen.getAllByText(
        /user-controlled infrastructure and supported providers/i,
      ).length,
    ).toBeGreaterThan(0);
    expect(
      screen.getByText(/not a live provider-pricing calculator/i),
    ).toBeTruthy();
    expect(screen.getByText(/a move is not automatic/i)).toBeTruthy();
  });
});
