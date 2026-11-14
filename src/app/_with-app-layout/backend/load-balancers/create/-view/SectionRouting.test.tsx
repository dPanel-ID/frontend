// @vitest-environment jsdom

import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from '@testing-library/react/dist/@testing-library/react.pure.esm.js';
import { useForm, useWatch } from 'react-hook-form';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { LoadBalancerCreationFormValues } from '@/features/load-balancer-creation-sidepanel';

import { isHttpsRequested } from '../-lib/payload';
import { DEFAULT_VALUES } from '../-model/form';

import { FeatureConfiguration, RoutingModePicker } from './SectionRouting';

vi.mock('@/services/i18n', () => ({
  useDevetekTranslations: () => (key: string) => key,
}));

// The L4 protocol picker measures itself; jsdom has no ResizeObserver.
vi.stubGlobal(
  'ResizeObserver',
  class {
    observe() {}
    unobserve() {}
    disconnect() {}
  },
);

function Harness() {
  const form = useForm<LoadBalancerCreationFormValues>({
    defaultValues: { ...DEFAULT_VALUES, engine: 'caddy' },
  });
  const values = useWatch({ control: form.control });

  return (
    <>
      <RoutingModePicker form={form} />
      <FeatureConfiguration form={form} />
      <output data-testid="https">{String(isHttpsRequested(values))}</output>
    </>
  );
}

afterEach(cleanup);

function pick(kind: 'L7' | 'L4') {
  act(() => {
    fireEvent.click(screen.getByText(kind));
  });
}

describe('RoutingModePicker', () => {
  // Switching L7 -> L4 -> L7 turned HTTPS off without a word, while the
  // review still promised a certificate.
  it('keeps HTTPS on after a trip through L4', () => {
    render(<Harness />);
    const https = () => screen.getByTestId('https').textContent;
    const toggle = () =>
      screen.getByRole('switch', {
        name: 'sidepanel.loadBalancerCreation.fieldSslEnabled.title',
      });

    expect(https()).toBe('true');

    pick('L4');
    expect(https()).toBe('false');
    expect(toggle().getAttribute('aria-checked')).toBe('false');

    pick('L7');
    expect(https()).toBe('true');
    expect(toggle().getAttribute('aria-checked')).toBe('true');
  });

  it('keeps HTTPS off when the person turned it off before L4', () => {
    render(<Harness />);

    act(() => {
      fireEvent.click(
        screen.getByRole('switch', {
          name: 'sidepanel.loadBalancerCreation.fieldSslEnabled.title',
        }),
      );
    });
    pick('L4');
    pick('L7');

    expect(screen.getByTestId('https').textContent).toBe('false');
  });
});
