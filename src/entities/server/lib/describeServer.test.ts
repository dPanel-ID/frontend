import { describe, expect, it } from 'vitest';

import type { ServerCard } from '../rules/schema';

import { canReinstallServer, isCloudServer } from './describeServer';

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

  it('hides reinstall on a private server, which dPanel does not set up', () => {
    expect(canReinstallServer(withStatus('ready', true))).toBe(false);
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

  it('is false for own and private servers', () => {
    expect(isCloudServer(server('other'))).toBe(false);
    expect(isCloudServer(server(undefined))).toBe(false);
    expect(isCloudServer(server('gcp', true))).toBe(false);
  });
});
