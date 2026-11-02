import type { DTOs } from '@/shared/api';

import type { ServerDetailSearch } from '../../../../-rules/tabs';

/** Module names the firewall view manages. */
const FIREWALL_MODULES = new Set(['firewall']);

type FirewallInstallation = Pick<
  DTOs.ModuleInstallationV1,
  'module_name' | 'status'
>;

/**
 * The server page search that opens the firewall view for an installed
 * firewall module, or null when the module is something else or is not
 * installed yet.
 */
export function firewallViewSearch(
  installation: FirewallInstallation,
): ServerDetailSearch | null {
  const name = installation.module_name.trim().toLowerCase();
  if (!FIREWALL_MODULES.has(name)) return null;
  if (installation.status !== 'installed') return null;

  return { tab: 'network', view: 'firewall' };
}

/** The firewall view search for the first installation in a group that has one. */
export function firstFirewallViewSearch(
  installations: FirewallInstallation[],
): ServerDetailSearch | null {
  for (const installation of installations) {
    const search = firewallViewSearch(installation);
    if (search) return search;
  }
  return null;
}
