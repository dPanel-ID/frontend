// @vitest-environment jsdom

import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { DocsIntroContent } from './DocsIntroContent';

describe('DocsIntroContent', () => {
  it('orients visitors with a try-first product introduction', () => {
    render(<DocsIntroContent />);

    expect(
      screen.getByRole('heading', {
        name: 'Try your application before you commit your infrastructure.',
      }),
    ).toBeTruthy();

    const videoLinks = screen.getAllByRole('link', {
      name: 'Watch dPanel on YouTube',
    });
    expect(videoLinks).toHaveLength(2);

    for (const videoLink of videoLinks) {
      expect(videoLink.getAttribute('href')).toBe(
        'https://www.youtube.com/@dpanel_id',
      );
      expect(videoLink.getAttribute('target')).toBe('_blank');
      expect(videoLink.getAttribute('rel')).toBe('noopener noreferrer');
    }

    const tryDPanelLinks = screen.getAllByRole('link', {
      name: 'Try dPanel',
    });
    expect(tryDPanelLinks).toHaveLength(2);

    for (const tryDPanelLink of tryDPanelLinks) {
      expect(tryDPanelLink.getAttribute('href')).toBe('/');
    }

    for (const label of [
      'Learn in minutes',
      'Test with confidence',
      'Choose what fits',
    ]) {
      expect(screen.getByText(label)).toBeTruthy();
    }

    expect(
      screen.getByRole('heading', { name: 'Try providers. Compare the fit.' }),
    ).toBeTruthy();
    expect(
      screen.getByRole('heading', { name: 'Keep your IaC in your hands.' }),
    ).toBeTruthy();

    for (const provider of [
      'IDCloudHost',
      'AWS',
      'GCP',
      'Vultr',
      'Manual SSH Access',
    ]) {
      expect(screen.getByText(provider)).toBeTruthy();
    }

    expect(
      screen.getByText(/Every change is tracked with OpenTofu and Ansible/),
    ).toBeTruthy();

    expect(screen.queryByText('Operational decision board')).toBeNull();
    expect(screen.queryByText('Application record')).toBeNull();
  });
});
