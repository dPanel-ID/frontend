// @vitest-environment jsdom

import type { PropsWithChildren } from 'react';

import { renderHook } from '@testing-library/react/dist/@testing-library/react.pure.esm.js';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ApiServer } from '@/shared/api';

import {
  DEPLOYABLE_SERVER_STATUS,
  ServersStoreProvider,
  useServersStore,
} from './servers';

vi.mock('@/shared/api', () => ({
  ApiServer: {
    Find: {
      useGet: vi.fn(),
    },
  },
}));

const mockedUseGet = vi.mocked(ApiServer.Find.useGet);

function wrapper(props: PropsWithChildren) {
  return <ServersStoreProvider>{props.children}</ServersStoreProvider>;
}

describe('useServersStore', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockedUseGet.mockReturnValue([
      {
        $status: 'success',
        machines: [{ id: '107', hostname: 'web-01', address: '203.0.113.7' }],
        pagination: { page: 1, size: 3, total_item: 1, total_page: 1 },
      },
      vi.fn(),
    ] as unknown as ReturnType<typeof ApiServer.Find.useGet>);
  });

  // Failed and deleted servers used to be fetched and then dropped, which
  // left the first page empty while page two still had a ready server.
  it('asks the API for ready servers only, so no page comes back empty', () => {
    renderHook(() => useServersStore(), { wrapper });

    expect(mockedUseGet).toHaveBeenCalledWith(
      expect.objectContaining({ page: 1, status: DEPLOYABLE_SERVER_STATUS }),
    );
    expect(DEPLOYABLE_SERVER_STATUS).toBe('ready');
  });

  it('lists the servers the API returned', () => {
    const { result } = renderHook(() => useServersStore(), { wrapper });
    const [servers] = result.current;

    expect(servers.$status).toBe('success');
    if (servers.$status !== 'success') return;
    expect(servers.servers.map((server) => server.hostname)).toEqual([
      'web-01',
    ]);
    expect(servers.totalPage).toBe(1);
  });

  // A cloud VM joined through its agent with a public IP showed "-" and
  // "Private" although the server kept its public address.
  it('shows the public address of a server reached through its agent', () => {
    mockedUseGet.mockReturnValue([
      {
        $status: 'success',
        machines: [
          {
            id: '304',
            hostname: 'gcp-01',
            address: '34.128.99.32',
            connectivity: 'private',
          },
          {
            id: '305',
            hostname: 'home-01',
            address: '',
            connectivity: 'private',
            lan_address: '192.168.1.20',
          },
        ],
        pagination: { page: 1, size: 3, total_item: 2, total_page: 1 },
      },
      vi.fn(),
    ] as unknown as ReturnType<typeof ApiServer.Find.useGet>);

    const { result } = renderHook(() => useServersStore(), { wrapper });
    const [servers] = result.current;

    if (servers.$status !== 'success') throw new Error('expected success');
    expect(
      servers.servers.map(
        ({ publicIP, private: isPrivate, hasPublicAddress }) => ({
          publicIP,
          isPrivate,
          hasPublicAddress,
        }),
      ),
    ).toEqual([
      { publicIP: '34.128.99.32', isPrivate: true, hasPublicAddress: true },
      { publicIP: '192.168.1.20', isPrivate: true, hasPublicAddress: false },
    ]);
  });
});
