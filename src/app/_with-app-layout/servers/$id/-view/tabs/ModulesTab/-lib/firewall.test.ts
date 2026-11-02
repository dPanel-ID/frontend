import { describe, expect, it } from 'vitest';

import { firewallViewSearch, firstFirewallViewSearch } from './firewall';

const install = (module_name: string, status = 'installed') => ({
  module_name,
  status,
});

describe('firewallViewSearch', () => {
  it('opens the firewall view for an installed firewall module', () => {
    expect(firewallViewSearch(install('firewall'))).toEqual({
      tab: 'network',
      view: 'firewall',
    });
    expect(firewallViewSearch(install(' Firewall '))).toEqual({
      tab: 'network',
      view: 'firewall',
    });
  });

  it('hides the action for other modules and unfinished installs', () => {
    expect(firewallViewSearch(install('mariadb'))).toBeNull();
    expect(firewallViewSearch(install('firewall', 'installing'))).toBeNull();
    expect(firewallViewSearch(install('firewall', 'failed'))).toBeNull();
    expect(firewallViewSearch(install(''))).toBeNull();
  });
});

describe('firstFirewallViewSearch', () => {
  it('picks the first installation that can be managed', () => {
    expect(
      firstFirewallViewSearch([
        install('firewall', 'failed'),
        install('firewall'),
      ]),
    ).toEqual({ tab: 'network', view: 'firewall' });
    expect(firstFirewallViewSearch([install('redis')])).toBeNull();
    expect(firstFirewallViewSearch([])).toBeNull();
  });
});
