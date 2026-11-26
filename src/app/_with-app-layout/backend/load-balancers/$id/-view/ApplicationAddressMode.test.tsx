// @vitest-environment jsdom

import {
  cleanup,
  fireEvent,
  render,
  screen,
} from '@testing-library/react/dist/@testing-library/react.pure.esm.js';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { Dto as ReachDto } from '@/shared/api/load-balancer.application-reach';

import { AddBackendDraftPanel, UpstreamEditorCard } from './UpstreamsTab';

const reachParams: unknown[] = [];
let reach: { $status: string } & Partial<ReachDto> = { $status: 'initial' };

// ETOS: the gateway and the app's server leave through one NAT address.
const natReach: ReachDto = {
  reason: 'shared_public_address',
  recommended_mode: 'private',
  targets: [
    {
      machine_id: '253',
      network_known: true,
      port: '8567',
      private_address: '10.0.16.230',
      registered_address: '151.243.222.218',
      same_server: false,
      server_name: 'crm',
      shared_private_network: false,
      shared_public_address: true,
    },
  ],
};

vi.mock('@/shared/api', () => ({
  ApiApplication: {
    Find: {
      useGet: () => [
        {
          $status: 'success',
          applications: [{ id: '129', name: 'crm-v2' }],
          pagination: {},
        },
      ],
    },
    Detail: { $Id: { useGet: () => [{ $status: 'initial' }] } },
  },
  ApiLoadBalancer: {
    ApplicationReach: {
      useGet: (params: unknown) => {
        reachParams.push(params);
        return [reach];
      },
    },
  },
}));

vi.mock('@/entities/application/adapter', () => ({
  AdapterApplicationFromDto: {
    toApplicationCard: (raw: { id: string; name: string }) => ({
      unwrap: () => ({
        id: raw.id,
        identity: { name: raw.name },
        additionalInfo: {},
        configDefs: { lifecycle: { run: { port: 8567 } } },
      }),
    }),
  },
}));

vi.mock('@/services/i18n', () => ({
  useDevetekTranslations: (namespace?: string) => (key: string) =>
    namespace ? `${namespace}.${key}` : key,
  useDevetekLocale: () => 'en',
}));

const mode = (name: string) =>
  `page.loadBalancersDetail.upstreams.addressMode.${name}`;

function pickApplication() {
  fireEvent.click(screen.getByRole('button', { name: /crm-v2/ }));
}

describe('adding an application backend', () => {
  beforeEach(() => {
    reach = { $status: 'success', ...natReach };
    reachParams.length = 0;
  });
  afterEach(cleanup);

  it('defaults to the recommended private address and previews it', () => {
    const onAdd = vi.fn();
    render(
      <AddBackendDraftPanel
        lbKind="l7"
        serverId="254"
        onAdd={onAdd}
        onCancel={() => {}}
      />,
    );
    pickApplication();

    const privateChoice = screen.getByRole('radio', {
      name: /addressMode\.private/,
    });
    expect(privateChoice.getAttribute('aria-checked')).toBe('true');
    expect(privateChoice.textContent).toContain(mode('recommended'));
    expect(screen.getByText('10.0.16.230:8567')).toBeTruthy();
    expect(screen.getByText(mode('reason.shared_public_address'))).toBeTruthy();
    expect(reachParams.at(-1)).toMatchObject({
      applicationId: '129',
      serverId: '254',
    });

    fireEvent.click(
      screen.getByRole('button', {
        name: /page.loadBalancersDetail.upstreams.addToDraft/,
      }),
    );
    expect(onAdd).toHaveBeenCalledWith(
      expect.objectContaining({ applicationId: '129', addressMode: 'private' }),
    );
  });

  it('keeps the registered address when the person picks it', () => {
    const onAdd = vi.fn();
    render(
      <AddBackendDraftPanel
        lbKind="l7"
        serverId="254"
        onAdd={onAdd}
        onCancel={() => {}}
      />,
    );
    pickApplication();
    fireEvent.click(
      screen.getByRole('radio', { name: /addressMode\.registered/ }),
    );

    expect(screen.getByText('151.243.222.218:8567')).toBeTruthy();
    fireEvent.click(
      screen.getByRole('button', {
        name: /page.loadBalancersDetail.upstreams.addToDraft/,
      }),
    );
    expect(onAdd).toHaveBeenCalledWith(
      expect.objectContaining({ addressMode: 'registered' }),
    );
  });

  it('leaves the mode to the API when the preview is unavailable', () => {
    reach = { $status: 'failed' };
    const onAdd = vi.fn();
    render(
      <AddBackendDraftPanel
        lbKind="l7"
        serverId="254"
        onAdd={onAdd}
        onCancel={() => {}}
      />,
    );
    pickApplication();

    expect(screen.getByText(mode('previewFailed'))).toBeTruthy();
    fireEvent.click(
      screen.getByRole('button', {
        name: /page.loadBalancersDetail.upstreams.addToDraft/,
      }),
    );
    expect(onAdd.mock.calls[0]?.[0]).not.toHaveProperty('addressMode');
  });
});

describe('changing an existing application route', () => {
  beforeEach(() => {
    reach = { $status: 'success', ...natReach };
  });
  afterEach(cleanup);

  it('shows the stored mode and switches it to private', () => {
    const onChangeAddressMode = vi.fn();
    render(
      <UpstreamEditorCard
        index={0}
        totalRows={1}
        serverId="254"
        onChangeAddressMode={onChangeAddressMode}
        onMove={() => {}}
        onRemove={() => {}}
        row={{
          addressMode: 'registered',
          applicationId: '129',
          destination: 'crm-v2 (#129)',
          id: 'app-0-129',
          kind: 'application',
          match: '/*',
          order: 1,
          port: '8567',
          protocol: 'http',
        }}
      />,
    );

    expect(screen.getByText(mode('registered'))).toBeTruthy();
    // The preview is read only once the person asks to change the address.
    expect(screen.queryByRole('radiogroup')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: mode('change') }));

    const registered = screen.getByRole('radio', {
      name: /addressMode\.registered/,
    });
    expect(registered.getAttribute('aria-checked')).toBe('true');
    fireEvent.click(
      screen.getByRole('radio', { name: /addressMode\.private/ }),
    );
    expect(onChangeAddressMode).toHaveBeenCalledWith('app-0-129', 'private');
  });
});
