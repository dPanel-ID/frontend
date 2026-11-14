import { describe, expect, it } from 'vitest';

import type { ServerCard } from '@/entities/server/rules/schema';

import { getServerPublicAddress } from './modules';

function server(host: Partial<ServerCard['host']>) {
  return {
    host: { address: '', private: false, ...host },
  } as unknown as ServerCard;
}

describe('getServerPublicAddress', () => {
  // The smoke test showed A -> 10.0.16.133, the agent server's local
  // address, while dNocs creates the record for its public IP.
  it('uses the public IP of an agent-joined server, not its local address', () => {
    expect(
      getServerPublicAddress(
        server({
          address: '10.0.16.133',
          private: true,
          publicAddress: '151.243.222.218',
        }),
      ),
    ).toBe('151.243.222.218');
  });

  it('has nothing to point at for an agent server without a public IP', () => {
    expect(
      getServerPublicAddress(server({ address: '10.0.16.133', private: true })),
    ).toBeUndefined();
  });

  it('uses the address of a server reached over SSH', () => {
    expect(getServerPublicAddress(server({ address: '203.0.113.7' }))).toBe(
      '203.0.113.7',
    );
  });

  it('is undefined before a gateway is picked', () => {
    expect(getServerPublicAddress(undefined)).toBeUndefined();
  });
});
