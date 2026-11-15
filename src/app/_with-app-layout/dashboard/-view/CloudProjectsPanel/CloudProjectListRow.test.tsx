// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import CloudProjectListRow from './CloudProjectListRow';

vi.mock('@/services/i18n', () => ({
  useDevetekTranslations:
    () => (key: string, values?: Record<string, unknown>) =>
      values ? `${key} ${Object.values(values).join(' ')}` : key,
}));

describe('CloudProjectListRow', () => {
  afterEach(cleanup);

  it('leaves empty parts out of the subtitle', () => {
    render(
      <CloudProjectListRow
        cloudProject={{
          name: 'Tencent Cloud',
          provider: 'tencent',
          organization: { name: '  ' },
          updated_at: '2026-10-31T08:11:00',
        }}
        serverCount={0}
      />,
    );

    const meta = screen.getByTestId('cloud-project-meta').textContent;
    expect(meta).toBe('tencent');
    expect(screen.getByText('updated 2026-10-31 08:11')).toBeTruthy();
  });

  it('shows the provider and team side by side', () => {
    render(
      <CloudProjectListRow
        cloudProject={{
          name: 'GCP',
          provider: 'gcp',
          organization: { name: 'Platform' },
        }}
        serverCount={2}
      />,
    );

    expect(screen.getByTestId('cloud-project-meta').textContent).toBe(
      'gcp · Platform',
    );
  });

  it('renders the server count badge outside the text column', () => {
    render(
      <CloudProjectListRow
        cloudProject={{ name: 'Tencent Cloud', provider: 'tencent' }}
        serverCount={3}
      />,
    );

    const badge = screen.getByText('servers 3');
    const meta = screen.getByTestId('cloud-project-meta');
    expect(badge.className).toContain('shrink-0');
    expect(meta.parentElement?.contains(badge)).toBe(false);
  });
});
