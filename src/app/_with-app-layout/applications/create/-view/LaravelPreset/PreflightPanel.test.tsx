// @vitest-environment jsdom
import {
  cleanup,
  fireEvent,
  render,
  screen,
} from '@testing-library/react/dist/@testing-library/react.pure.esm.js';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { PreflightState } from '../../-lib/laravel-preset';

import { PreflightPanel } from './PreflightPanel';

vi.mock('@/services/i18n', () => ({
  useDevetekTranslations:
    () => (key: string, values?: Record<string, unknown>) =>
      values ? `${key} ${JSON.stringify(values)}` : key,
}));

afterEach(cleanup);

const done = (patch: Partial<PreflightState>): PreflightState => ({
  status: 'done',
  key: 'k',
  blocking: false,
  checks: [],
  ...patch,
});

describe('PreflightPanel', () => {
  it('shows an error by code with its values and offers the override', () => {
    const onOverrideChange = vi.fn();
    render(
      <PreflightPanel
        preflight={done({
          blocking: true,
          checks: [
            {
              code: 'php_version_unsupported',
              level: 'error',
              message: 'raw',
              params: {
                required: '^8.4',
                selected: '8.3',
                package: 'laravel/framework',
              },
            },
            { code: 'composer_lock_missing', level: 'warning' },
          ],
        })}
        override={false}
        onOverrideChange={onOverrideChange}
        onRetry={vi.fn()}
      />,
    );
    expect(
      screen.getByText(/checks\.php_version_unsupported .*"required":"\^8\.4"/),
    ).toBeTruthy();
    expect(screen.getByText(/checks\.composer_lock_missing/)).toBeTruthy();
    fireEvent.click(screen.getByRole('checkbox'));
    expect(onOverrideChange).toHaveBeenCalledWith(true);
  });

  it('falls back to the server message for an unknown code', () => {
    render(
      <PreflightPanel
        preflight={done({
          checks: [
            {
              code: 'future_check',
              level: 'warning',
              message: 'From the server',
            },
          ],
        })}
        override={false}
        onOverrideChange={vi.fn()}
        onRetry={vi.fn()}
      />,
    );
    expect(screen.getByText('From the server')).toBeTruthy();
    expect(screen.queryByRole('checkbox')).toBeNull();
  });

  it('lets the user retry checks that could not run, without an override', () => {
    const onRetry = vi.fn();
    render(
      <PreflightPanel
        preflight={done({ status: 'failed' })}
        override={false}
        onOverrideChange={vi.fn()}
        onRetry={onRetry}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'retry' }));
    expect(onRetry).toHaveBeenCalled();
    expect(screen.queryByRole('checkbox')).toBeNull();
  });
});
