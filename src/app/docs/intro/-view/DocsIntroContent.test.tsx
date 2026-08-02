// @vitest-environment jsdom

import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { DocsIntroContent } from './DocsIntroContent';

describe('DocsIntroContent', () => {
  it('orients visitors with the command-center introduction', () => {
    render(<DocsIntroContent />);

    expect(
      screen.getByRole('heading', {
        name: 'Operate the path from code to cloud.',
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
        .getByRole('link', { name: 'Explore the operating loop' })
        .getAttribute('href'),
    ).toBe('#operating-loop');

    for (const label of [
      'Application record',
      'Deployment evidence',
      'Server and provider',
      'Decision context',
    ]) {
      expect(screen.getByText(label)).toBeTruthy();
    }

    for (const step of ['Learn', 'Connect', 'Run', 'Decide']) {
      expect(screen.getByText(step)).toBeTruthy();
    }

    expect(screen.getByText(/supported providers/i)).toBeTruthy();
    expect(
      screen.getByText(/not a live provider-pricing calculator/i),
    ).toBeTruthy();
    expect(screen.getByText(/a move is not automatic/i)).toBeTruthy();

    expect(
      screen.getByRole('heading', {
        name: 'Follow the decision through the shared operational record.',
      }),
    ).toBeTruthy();
    expect(
      screen
        .getByRole('heading', {
          name: 'Keep the Application record connected from Repository to review.',
        })
        .closest('section')
        ?.getAttribute('id'),
    ).toBe('operating-loop');
  });
});
