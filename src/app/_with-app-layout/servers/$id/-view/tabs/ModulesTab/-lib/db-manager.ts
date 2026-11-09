import type { DTOs } from '@/shared/api';

/** Database modules db-manager can open. */
const DB_MANAGER_MODULES = new Set(['mariadb', 'postgresql', 'mongodb']);

/**
 * Builds the db-manager link for an installed database module, or returns
 * null when db-manager cannot open it: not a supported engine, not installed
 * yet, or db-manager is not configured for this environment.
 */
export function dbManagerUrl(
  host: string | undefined,
  serverId: string,
  installation: Pick<
    DTOs.ModuleInstallationV1,
    'id' | 'module_name' | 'status'
  >,
): string | null {
  const base = host?.trim();
  if (!base || !serverId || !installation.id) return null;
  if (!DB_MANAGER_MODULES.has(installation.module_name.toLowerCase())) {
    return null;
  }
  if (installation.status !== 'installed') return null;

  let url: URL;
  try {
    url = new URL(base);
  } catch {
    return null;
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') return null;
  url.search = new URLSearchParams({
    server: serverId,
    service: installation.id,
  }).toString();
  return url.toString();
}

/** The first installation in a module group db-manager can open. */
export function firstDbManagerUrl(
  host: string | undefined,
  serverId: string,
  installations: Array<
    Pick<DTOs.ModuleInstallationV1, 'id' | 'module_name' | 'status'>
  >,
): string | null {
  for (const installation of installations) {
    const url = dbManagerUrl(host, serverId, installation);
    if (url) return url;
  }
  return null;
}
