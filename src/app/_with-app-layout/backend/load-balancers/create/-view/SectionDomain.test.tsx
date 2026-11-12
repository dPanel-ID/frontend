// @vitest-environment jsdom

import { useMemo } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react/dist/@testing-library/react.pure.esm.js';
import { useForm } from 'react-hook-form';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { schemaLoadBalancerCreationForm } from '@/features/load-balancer-creation-sidepanel';
import type { LoadBalancerCreationFormValues } from '@/features/load-balancer-creation-sidepanel';

import { DEFAULT_VALUES } from '../-model/form';
import type { CreateResources } from '../-model/resources';

import { DomainField } from './SectionDomain';

vi.mock('@/services/i18n', () => ({
  useDevetekTranslations: () => (key: string) => key,
}));

// The real combobox opens a popover; a select picks the same value.
vi.mock('@/shared/presentation/molecules/Combobox', () => ({
  Combobox: (props: {
    items: Array<{ value: string; label: string }>;
    value: string;
    onChange: (value: string) => void;
  }) => (
    <select
      aria-label="zone"
      value={props.value}
      onChange={(event) => props.onChange(event.target.value)}
    >
      <option value="" />
      {props.items.map((item) => (
        <option key={item.value} value={item.value}>
          {item.label}
        </option>
      ))}
    </select>
  ),
}));

const domains = {
  $status: 'success',
  list: [
    {
      id: '9',
      provider: 'cloudflare',
      domain: { hostname: 'example.com' },
      ownership: { owner: 'me' },
    },
  ],
} as unknown as CreateResources['domains'];

const onSubmit = vi.fn();

function Harness() {
  const form = useForm<LoadBalancerCreationFormValues>({
    resolver: zodResolver(schemaLoadBalancerCreationForm),
    mode: 'onTouched',
    defaultValues: DEFAULT_VALUES,
  });
  // The page is built with the React Compiler, which reuses this element
  // while `form` stays the same object; the field must refresh on its own.
  const field = useMemo(
    () => <DomainField form={form} domains={domains} />,
    [form],
  );

  // The page renders the field inside its form.
  return <form onSubmit={form.handleSubmit(onSubmit)}>{field}</form>;
}

afterEach(() => {
  cleanup();
  onSubmit.mockReset();
});

function switchToManaged() {
  act(() => {
    fireEvent.click(
      screen.getByText('page.loadBalancersCreate.gateway.internalDomain'),
    );
  });
}

describe('DomainField', () => {
  // The mode buttons submitted the form, so "Required" showed before the
  // user had typed anything.
  it('switches to a managed domain without submitting the form', () => {
    const submitted = vi.fn();
    render(<Harness />);
    const form = document.querySelector('form')!;
    form.addEventListener('submit', submitted);

    switchToManaged();

    expect(submitted).not.toHaveBeenCalled();
    expect(screen.queryByRole('alert')).toBeNull();
  });

  // The "Required" message stayed under a filled managed subdomain after the
  // domain field had been checked once.
  it('clears the required message once a managed hostname is complete', async () => {
    render(<Harness />);

    const external = screen.getByPlaceholderText(
      'sidepanel.loadBalancerCreation.fieldDomain.placeholder',
    );
    act(() => {
      fireEvent.focus(external);
      fireEvent.blur(external);
    });
    expect(await screen.findByRole('alert')).toBeTruthy();

    switchToManaged();
    const subdomain = screen.getByLabelText(
      'page.loadBalancersCreate.gateway.subdomain',
    );
    act(() => {
      fireEvent.change(subdomain, { target: { value: 'blog' } });
      fireEvent.blur(subdomain);
      fireEvent.change(screen.getByLabelText('zone'), {
        target: { value: '9' },
      });
    });

    await waitFor(() => expect(screen.queryByRole('alert')).toBeNull());
  });
});
