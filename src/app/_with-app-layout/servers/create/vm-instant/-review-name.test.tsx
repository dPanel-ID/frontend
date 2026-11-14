// @vitest-environment jsdom
import { Suspense, useEffect, useState } from 'react';

import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from '@testing-library/react/dist/@testing-library/react.pure.esm.js';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { useForm } from './-model';

let api: ReturnType<typeof useForm> | undefined;

vi.mock('@tanstack/react-router', async (importOriginal) => ({
  ...(await importOriginal<object>()),
  Link: (props: { children: unknown }) => props.children,
  // Rendered without a router: the page reads no search parameter here.
  createFileRoute: () => (options: Record<string, unknown>) => ({
    options,
    useSearch: () => ({}),
  }),
}));
vi.mock('@/services/i18n', () => ({
  useDevetekTranslations: () => (key: string) => key,
  useDevetekLocale: () => 'en',
}));
// The provider step is driven through the form directly.
vi.mock('./-view/SectionCloud', () => ({
  SectionCloud: () => {
    api = useForm();
    return null;
  },
}));
vi.mock('./-view/SectionConnect', () => ({ SectionConnect: () => null }));
vi.mock('./-usecase/use-launch', () => ({
  default: () => ({ isSubmitting: false, launch: vi.fn(), reset: vi.fn() }),
}));

const responses: Record<string, unknown> = {
  'Regions.$Id': { items: [{ id: 'asia-southeast2', name: 'Jakarta' }] },
  'Project.Zones.$Id': {
    items: [{ id: 'asia-southeast2-a', name: 'Jakarta A' }],
  },
  'Project.Sizes.$Id': { mode: 'catalog' },
  'Project.Products.$Id': { items: [] },
  'Project.Ostemplates.$Id': [],
};

/** ApiCloud.<path>.useGet answering after a short load, like the API. */
function apiPath(path: string[]): unknown {
  return new Proxy(() => {}, {
    get: (_target, key: string) => {
      if (key !== 'useGet') return apiPath([...path, key]);
      return function useGet(params: { options?: { skip?: boolean } }) {
        const request = JSON.stringify(params);
        const [loaded, setLoaded] = useState('');
        useEffect(() => {
          const timer = setTimeout(() => setLoaded(request), 10);
          return () => clearTimeout(timer);
        }, [request]);
        if (params.options?.skip) return [{ $status: 'initial' }, vi.fn()];
        if (loaded !== request) {
          return [{ $status: 'loading', prevData: null }, vi.fn()];
        }
        const data = responses[path.join('.')] ?? { items: [] };
        return [
          Object.assign(Array.isArray(data) ? [...data] : { ...data }, {
            $status: 'success',
          }),
          vi.fn(),
        ];
      };
    },
  });
}
vi.mock('@/shared/api', () => ({ ApiCloud: apiPath([]) }));

globalThis.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

const settle = () =>
  act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 50));
  });

afterEach(() => {
  cleanup();
  api = undefined;
});

describe('Launch a cloud server', () => {
  // The end-to-end run reported the "Server name" row staying unticked when
  // the name was typed after the region and zone were picked.
  it('ticks the server name typed after the region and zone', async () => {
    const { Route } = await import('./index');
    const Page = Route.options.component as unknown as {
      (): React.ReactNode;
      preload: () => Promise<unknown>;
    };
    await Page.preload();
    await act(() => {
      render(
        <Suspense fallback={null}>
          <Page />
        </Suspense>,
      );
    });
    await settle();
    act(() => {
      api?.form.setValue('provider', 'gcp');
      api?.form.setValue('cloud.projectID', '7');
    });

    const picks: Array<[string, string]> = [
      ['Select a Region', 'Jakarta'],
      ['Select a Zone', 'Jakarta A'],
    ];
    for (const [trigger, option] of picks) {
      await settle();
      fireEvent.click(screen.getByText(trigger));
      await settle();
      fireEvent.click(screen.getByText(option));
    }
    await settle();

    const name = screen.getByPlaceholderText('dpanel-gcp-01');
    fireEvent.change(name, { target: { value: 'e2e-20261114-1409' } });
    fireEvent.blur(name);
    await settle();

    expect(api?.form.getValues('spec.vmName')).toBe('e2e-20261114-1409');
    const row = screen.getAllByText('Server name')[1]!.closest('li')!;
    expect(row.textContent).toContain('e2e-20261114-1409');
    // The tick is the emerald check mark of a done row.
    expect(row.querySelector('.lucide-check')).not.toBeNull();
  });
});
