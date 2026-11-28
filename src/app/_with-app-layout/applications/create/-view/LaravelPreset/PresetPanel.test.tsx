// @vitest-environment jsdom
import { useEffect } from 'react';

import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from '@testing-library/react/dist/@testing-library/react.pure.esm.js';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { DTOs } from '@/shared/api';

import { FormStoreProvider, useFormStore } from '../../-model/store/form';

import LifecycleSection from './LifecycleSection';
import PresetPanel from './PresetPanel';

vi.mock('@/services/i18n', () => ({
  useDevetekTranslations:
    () => (key: string, values?: Record<string, unknown>) =>
      values ? `${key} ${JSON.stringify(values)}` : key,
}));

afterEach(cleanup);

const preset: DTOs.ApplicationPresetV1 = {
  framework: 'laravel',
  detected: true,
  facts: {
    laravel_version: '13.44.1',
    php_constraint: '^8.4',
    octane: true,
    node: true,
    package_manager: 'pnpm',
    health_route: true,
  },
  definition: {
    setup: { language: { name: 'php', version: '8.4' } },
    run: {
      command:
        'php artisan octane:frankenphp --host=127.0.0.1 --port=$PORT --max-requests=500',
      environment: [],
    },
    release: { enabled: true, commands: ['php artisan migrate --force'] },
    health_check: { path: '/up' },
  },
  processes: [
    {
      name: 'worker',
      type: 'service',
      command: 'php artisan queue:work --tries=3 --max-time=3600 --sleep=3',
    },
    {
      name: 'scheduler',
      type: 'schedule',
      command: 'php artisan schedule:run',
    },
  ],
  hints: [{ code: 'app_key_managed' }, { code: 'something_new' }],
};

let enabledNames: string[] = [];

function Harness(props: { apply: boolean }) {
  const [applyPreset, enabled] = useFormStore((s) => [
    s.applyPreset,
    s.lifecycle.enabledProcessNames,
  ]);
  useEffect(() => {
    if (props.apply) applyPreset(preset, 'repo@main');
  }, [applyPreset, props.apply]);
  useEffect(() => {
    enabledNames = enabled;
  }, [enabled]);
  return null;
}

function renderWith(apply: boolean) {
  return render(
    <FormStoreProvider>
      <Harness apply={apply} />
      <PresetPanel />
      <LifecycleSection />
    </FormStoreProvider>,
  );
}

describe('Laravel preset in the wizard', () => {
  it('shows nothing for a repository without a preset', () => {
    renderWith(false);
    expect(document.getElementById('laravel-preset-title')).toBeNull();
    expect(screen.queryByText('releaseTitle')).toBeNull();
  });

  it('says Laravel was detected, with its facts and known hints', () => {
    renderWith(true);
    expect(document.getElementById('laravel-preset-title')?.textContent).toBe(
      'title',
    );
    expect(screen.getByText('13.44.1')).toBeTruthy();
    expect(screen.getByText('pnpm')).toBeTruthy();
    expect(screen.getByText('hints.app_key_managed')).toBeTruthy();
    expect(screen.queryByText('hints.something_new')).toBeNull();
  });

  it('fills the release and health check, with worker and scheduler off', () => {
    renderWith(true);
    expect(
      screen.getByDisplayValue('php artisan migrate --force'),
    ).toBeTruthy();
    expect(screen.getByDisplayValue('/up')).toBeTruthy();
    const worker = screen
      .getAllByRole('switch')
      .find((element) => element.id === 'wizard-process-worker');
    expect(worker?.getAttribute('aria-checked')).toBe('false');
    expect(enabledNames).toEqual([]);

    act(() => {
      fireEvent.click(worker!);
    });
    expect(enabledNames).toEqual(['worker']);
  });
});
