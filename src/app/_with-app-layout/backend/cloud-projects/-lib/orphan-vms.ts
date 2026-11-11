import type { DTOs } from '@/shared/api';
import { normalizeCloudProviderKey } from '@/shared/presentation/molecules/CloudProviderLogo';

/**
 * Providers the API can scan for leftover VMs. Others answer 501, so the
 * action is not offered for them.
 */
const ORPHAN_PROVIDERS = [
  'aws',
  'gcp',
  'digitalocean',
  'idcloudhost',
  'tencent',
];

/** Provider ID spellings that mean one of the supported providers. */
const PROVIDER_ALIASES: Record<string, string> = {
  amazon: 'aws',
  amazonwebservices: 'aws',
  googlecloud: 'gcp',
  googlecloudplatform: 'gcp',
  do: 'digitalocean',
  tencentcloud: 'tencent',
  qcloud: 'tencent',
};

function orphanProviderKey(provider: string | null | undefined) {
  const key = normalizeCloudProviderKey(provider ?? undefined);
  return PROVIDER_ALIASES[key] ?? key;
}

/** True when leftover VMs can be found and deleted for this provider. */
export function supportsOrphanScan(provider: string | null | undefined) {
  return ORPHAN_PROVIDERS.includes(orphanProviderKey(provider));
}

/** One leftover VM as the dialog shows and deletes it. */
export interface OrphanVmRow {
  /** Stable React key and the deletion's lookup key. */
  key: string;
  instanceId: string;
  /** The provider's name for the VM; '' when it has none. */
  name: string;
  /** What the dialog calls it: its name, or its ID without one. */
  label: string;
  /** What the owner types to confirm: the name, or the ID without one. */
  confirmText: string;
  /** Sent as `region` when deleting: the zone on GCP, the region elsewhere. */
  deleteRegion: string;
  /** Region or zone as shown to the owner. */
  location: string;
  state: string;
  instanceType: string;
  publicIp: string;
  privateIp: string;
  createdAt: string | null;
  evidence: string;
  serverId: string;
}

/**
 * Maps the scan's VMs to rows, dropping entries without an instance ID,
 * which nothing could delete. `provider` is the list's provider, which picks
 * whether the zone or the region identifies the VM.
 */
export function toOrphanVmRows(
  provider: string | null | undefined,
  items: DTOs.CloudOrphanVmV1[] | null | undefined,
): OrphanVmRow[] {
  const isGcp = orphanProviderKey(provider) === 'gcp';

  return (items ?? []).flatMap((item) => {
    const instanceId = item.id?.trim() ?? '';
    if (!instanceId) return [];

    const name = item.name?.trim() ?? '';
    const region = item.region?.trim() ?? '';
    const zone = item.zone?.trim() ?? '';

    return [
      {
        key: `${instanceId}@${zone || region}`,
        instanceId,
        name,
        label: name || instanceId,
        confirmText: name || instanceId,
        deleteRegion: isGcp ? zone || region : region || zone,
        location: zone || region,
        state: item.state?.trim() ?? '',
        instanceType: item.instance_type?.trim() ?? '',
        publicIp: item.public_ip?.trim() ?? '',
        privateIp: item.private_ip?.trim() ?? '',
        createdAt: item.created_at || null,
        evidence: item.evidence?.trim() ?? '',
        serverId: item.server_id?.trim() ?? '',
      },
    ];
  });
}

/** Where a leftover VM's deletion stands. */
export type OrphanDeletePhase = 'running' | 'succeeded' | 'failed';

/**
 * Buckets the execution status: queued and running (and any status not set
 * yet) are still running; succeeded and failed end it.
 */
export function orphanDeletePhase(
  status: string | null | undefined,
): OrphanDeletePhase {
  switch ((status ?? '').trim().toLowerCase()) {
    case 'succeeded':
    case 'success':
    case 'completed':
      return 'succeeded';
    case 'failed':
    case 'error':
    case 'cancelled':
    case 'canceled':
      return 'failed';
    default:
      return 'running';
  }
}
