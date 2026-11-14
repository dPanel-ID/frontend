import { describe, expect, it } from 'vitest';

import { ctorHost } from '@/entities/server/adapter/ctors';
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

  // The end-to-end run showed A -> 10.184.0.20 for a GCP VM that joined
  // through its agent; dNocs created the record for 34.101.60.146.
  it('uses the public IP of a cloud VM that joined through its agent', () => {
    const host = ctorHost({
      address: '34.101.60.146',
      connectivity: 'private',
      hostname: 'e2e-20261114-1409',
      lan_address: '10.184.0.20',
      source: 'cloud-partner',
    });

    expect(getServerPublicAddress({ host } as ServerCard)).toBe(
      '34.101.60.146',
    );
  });

  it('is undefined before a gateway is picked', () => {
    expect(getServerPublicAddress(undefined)).toBeUndefined();
  });
});
