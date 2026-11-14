import { describe, expect, it } from 'vitest';

import type { ServerCard } from '../rules/schema';

import {
  canReinstallServer,
  cloudPublicAddress,
  isAgentCloudServer,
  isCloudServer,
} from './describeServer';

const withStatus = (status: ServerCard['state']['status'], isPrivate = false) =>
  ({
    state: { status },
    host: { address: '', private: isPrivate },
  }) as Pick<ServerCard, 'state' | 'host'>;

describe('canReinstallServer', () => {
  it.each(['ready', 'failed', 'pending', 'unknown'] as const)(
    'allows reinstall when %s',
    (status) => {
      expect(canReinstallServer(withStatus(status))).toBe(true);
    },
  );

  it.each(['progress', 'cancelled', 'deleting', 'deleted'] as const)(
    'hides reinstall when %s',
    (status) => {
      expect(canReinstallServer(withStatus(status))).toBe(false);
    },
  );

  it('offers reinstall on a private server, where it reinstalls the agent', () => {
    expect(canReinstallServer(withStatus('ready', true))).toBe(true);
  });
});

describe('isCloudServer', () => {
  const server = (provider: string | undefined, isPrivate = false) =>
    ({
      id: '1',
      host: { address: '', private: isPrivate },
      cloud: provider ? { provider } : undefined,
      system: {},
    }) as Pick<ServerCard, 'id' | 'host' | 'cloud' | 'system'>;

  it('is true for a known provider', () => {
    expect(isCloudServer(server('gcp'))).toBe(true);
  });

  it('is false for own and registered servers', () => {
    expect(isCloudServer(server('other'))).toBe(false);
    expect(isCloudServer(server(undefined))).toBe(false);
    expect(isCloudServer(server(undefined, true))).toBe(false);
  });

  it('is true for a cloud VM that joined through its agent', () => {
    expect(isCloudServer(server('gcp', true))).toBe(true);
    expect(isAgentCloudServer(server('gcp', true))).toBe(true);
    expect(isAgentCloudServer(server('gcp'))).toBe(false);
    expect(isAgentCloudServer(server(undefined, true))).toBe(false);
  });
});

describe('cloudPublicAddress', () => {
  const server = (provider: string | undefined, publicAddress?: string) =>
    ({
      id: '1',
      host: { address: '10.184.0.20', private: true, publicAddress },
      cloud: provider ? { provider } : undefined,
      system: {},
    }) as unknown as ServerCard;

  // The Overview showed a GCP VM's public IP only as "Connects from".
  it('is the public IP of a cloud VM that joined through its agent', () => {
    expect(cloudPublicAddress(server('gcp', '34.101.60.146'))).toBe(
      '34.101.60.146',
    );
  });

  it('is undefined for a home machine, which only connects from an address', () => {
    expect(cloudPublicAddress(server(undefined, '151.243.222.218'))).toBe(
      undefined,
    );
  });

  it('is undefined for a cloud VM without a public IP', () => {
    expect(cloudPublicAddress(server('gcp'))).toBe(undefined);
  });
});
