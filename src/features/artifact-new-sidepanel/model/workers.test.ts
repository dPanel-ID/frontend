import { describe, expect, it, vi } from 'vitest';

import { toDeploymentTargetOption } from './workers';

vi.mock('@/shared/api', () => ({ ApiServer: {} }));

describe('toDeploymentTargetOption', () => {
  it('marks a server reached through its agent', () => {
    expect(
      toDeploymentTargetOption({
        id: 378,
        hostname: 'laravel-demo',
        address: '13.228.21.45',
        connectivity: 'private',
        ssh_port: '22',
        default_user: 'ubuntu',
        distributor: 'ubuntu',
        version: '24.04',
      }),
    ).toMatchObject({
      id: '378',
      hostname: 'laravel-demo',
      address: '13.228.21.45',
      private: true,
      system: 'ubuntu 24.04',
    });
  });

  it('keeps an SSH server public', () => {
    expect(
      toDeploymentTargetOption({
        id: 7,
        hostname: 'web',
        address: '203.0.113.7',
        connectivity: 'public',
        ssh_port: '2222',
      }),
    ).toMatchObject({ private: false, sshPort: '2222' });
  });

  it('skips a server without an ID', () => {
    expect(toDeploymentTargetOption({ hostname: 'x' })).toBeNull();
  });
});
