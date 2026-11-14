// @vitest-environment jsdom

import { useEffect } from 'react';

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

import type { ServerCard } from '@/entities/server/rules/schema';
import type { ServerModule } from '@/entities/server-modules/model/types';

import { schemaLoadBalancerCreationForm } from '@/features/load-balancer-creation-sidepanel';
import type { LoadBalancerCreationFormValues } from '@/features/load-balancer-creation-sidepanel';

import type { Form } from '../-model/form';
import { DEFAULT_VALUES } from '../-model/form';
import type { CreateResources } from '../-model/resources';

import { EnginePicker, ServerPicker } from './SectionGateway';

vi.mock('@/services/i18n', () => ({
  useDevetekTranslations: () => (key: string) => key,
  useDevetekLocale: () => 'en',
}));

vi.mock('@/features/server-modules-detail-modal', () => ({
  useServerModulesDetailModal: () => [vi.fn()],
}));

vi.mock('@/entities/server/ui/ServerStatusPill', () => ({
  ServerStatusPill: () => null,
}));

const server = {
  id: '7',
  host: {
    name: 'dpanel-loadbalancer',
    address: '10.0.16.133',
    publicAddress: '34.101.60.146',
    private: true,
  },
  state: { status: 'ready' },
  system: {},
} as unknown as ServerCard;

const caddy = {
  id: 'caddy',
  name: 'Caddy',
  description: 'Caddy web server',
  logoUrl: '',
  category: ['infrastructure'],
  platform: [],
  has_submodule: false,
  installations: [{ status: 'installed' }],
} as unknown as ServerModule;

const resources = {
  servers: {
    $status: 'success',
    list: [server],
    pagination: { total_page: 1 },
  },
  serverPage: 1,
  serverSearch: '',
  setServerSearch: vi.fn(),
  setServerPage: vi.fn(),
  refreshServers: vi.fn(),
  infrastructureModules: {
    $status: 'success',
    repository: {},
    list: [caddy],
  },
  selectedEngineDetail: { $status: 'success' },
  selectedEngineRuntimeItem: undefined,
  refreshModules: vi.fn(),
  refreshSelectedEngineDetail: vi.fn(),
} as unknown as CreateResources;

let form: Form | undefined;

function Harness() {
  const created = useForm<LoadBalancerCreationFormValues>({
    resolver: zodResolver(schemaLoadBalancerCreationForm),
    mode: 'onTouched',
    defaultValues: DEFAULT_VALUES,
  });
  // Handed out after render, for the assertions below.
  useEffect(() => {
    form = created;
  }, [created]);

  return (
    <>
      <ServerPicker form={created} resources={resources} />
      <EnginePicker form={created} resources={resources} />
    </>
  );
}

afterEach(() => {
  cleanup();
  form = undefined;
});

const required = () => screen.queryByRole('alert');

describe('Gateway step', () => {
  // The server list showed the gateway's local address, not the public one
  // its DNS record goes to.
  it('lists an agent server under the address its DNS record points at', () => {
    render(<Harness />);

    expect(screen.getByText(/34\.101\.60\.146/)).toBeTruthy();
    expect(screen.queryByText(/10\.0\.16\.133/)).toBeNull();
  });

  // "Required" showed under the engine as soon as a server was picked and
  // stayed after Caddy was selected.
  it('shows no "Required" while picking a server, then an engine', async () => {
    render(<Harness />);

    act(() => {
      fireEvent.click(screen.getByText('dpanel-loadbalancer'));
    });
    act(() => {
      fireEvent.click(screen.getByText('Caddy'));
    });

    await waitFor(() => expect(form?.getValues('engine')).toBe('caddy'));
    expect(form?.getFieldState('engine').error).toBeUndefined();
    expect(required()).toBeNull();
  });

  it('clears an earlier "Required" once an engine is picked', async () => {
    render(<Harness />);
    act(() => {
      fireEvent.click(screen.getByText('dpanel-loadbalancer'));
    });
    await act(async () => {
      await form?.trigger('engine');
    });
    expect(form?.getFieldState('engine').error).toBeTruthy();
    expect(required()).toBeTruthy();

    act(() => {
      fireEvent.click(screen.getByText('Caddy'));
    });

    await waitFor(() =>
      expect(form?.getFieldState('engine').error).toBeUndefined(),
    );
    expect(required()).toBeNull();
  });
});
