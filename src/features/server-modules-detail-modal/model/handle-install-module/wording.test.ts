import { describe, expect, it } from 'vitest';

import { installTargetLabel, isInstallAction } from './wording';

describe('install confirmation wording', () => {
  // The dialog read "Run Install Go for Go on the selected server?".
  it('names the server it installs on', () => {
    expect(
      installTargetLabel({
        type: 'server',
        id: '345',
        serverName: 'e2e-20261114-1409',
        serverFallback: (id) => `server ${id}`,
      }),
    ).toBe('e2e-20261114-1409');
  });

  it('falls back to the server ID when the name is not known', () => {
    expect(
      installTargetLabel({
        type: 'server',
        id: '345',
        serverFallback: (id) => `server ${id}`,
      }),
    ).toBe('server 345');
  });

  it('names a server group by its label', () => {
    expect(
      installTargetLabel({
        type: 'hostgroup',
        id: 'g1',
        groupLabel: 'web pool',
        serverFallback: (id) => `server ${id}`,
      }),
    ).toBe('web pool');
  });

  it('words only the install action as "Install <module>"', () => {
    expect(isInstallAction('install')).toBe(true);
    expect(isInstallAction('uninstall')).toBe(false);
  });
});
