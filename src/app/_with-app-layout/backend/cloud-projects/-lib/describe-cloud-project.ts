import { personOf } from '@/entities/user/lib/person';
import type { Person } from '@/entities/user/lib/person';

import type { DTOs } from '@/shared/api';
import { getCloudProviderLabel } from '@/shared/presentation/molecules/CloudProviderLogo';
import type { StatusTone } from '@/shared/presentation/molecules/StatusPill';

/** One connected cloud account as every list view needs it. */
export interface CloudProjectCard {
  id: string;
  name: string;
  /** Raw provider ID from the backend, for logo lookup and filtering. */
  provider: string | null;
  /** Display name of the provider, falling back to the raw ID. */
  providerLabel: string;
  /** Raw `installer_status`; '' and undefined are production-valid. */
  status: string;
  /** Who owns it; null when the API could not resolve them. */
  owner: Person | null;
  teamName: string | null;
  /** Casdoor workspace group ID; absent for personal accounts. */
  teamId: string | null;
  sharedWithTeam: boolean;
  createdAt: string | null;
  updatedAt: string | null;
}

/**
 * Maps an account DTO to its card model. Returns null for records without an
 * ID, which production data still contains and which nothing can act on.
 */
export function toCloudProjectCard(
  cloud: DTOs.CloudProjectV1,
  fallbackName: string,
  unknownProvider: string,
): CloudProjectCard | null {
  if (cloud.id == null || cloud.id === '') return null;

  const provider = cloud.provider?.trim() || null;
  const teamName = cloud.workspace?.name || cloud.organization?.name || null;

  return {
    id: String(cloud.id),
    name: cloud.name?.trim() || fallbackName,
    provider,
    providerLabel:
      getCloudProviderLabel(provider ?? undefined) ??
      provider ??
      unknownProvider,
    status: cloud.installer_status?.trim() ?? '',
    owner: personOf(cloud.user) ?? null,
    teamName,
    teamId:
      cloud.workspace_type === 'group' ? (cloud.workspace_id ?? null) : null,
    sharedWithTeam: Boolean(teamName || cloud.organization_id),
    createdAt: cloud.created_at ?? null,
    updatedAt: cloud.updated_at ?? null,
  };
}

/** Which of the overview's three buckets a raw status belongs to. */
export type CloudStatusBucket = 'ready' | 'progress' | 'failed' | 'other';

/**
 * Buckets the backend's `installer_status` vocabulary: pending, progress,
 * cancelled, ready, deleting, failed, deleted. Anything unrecognised, empty
 * strings included, stays out of the healthy bucket rather than being
 * counted as ready.
 */
export function cloudStatusBucket(status: string): CloudStatusBucket {
  switch (status.toLowerCase()) {
    case 'ready':
      return 'ready';

    case 'pending':
    case 'progress':
    case 'deleting':
      return 'progress';

    case 'failed':
    case 'cancelled':
      return 'failed';

    default:
      return 'other';
  }
}

/** Colour family of a status pill, matching the rest of the product. */
export function cloudStatusTone(status: string): StatusTone {
  switch (cloudStatusBucket(status)) {
    case 'ready':
      return 'success';

    case 'progress':
      return 'info';

    case 'failed':
      return 'danger';

    default:
      return 'neutral';
  }
}

/** True while the state is still changing, so the pill's dot pulses. */
export function isCloudStatusMoving(status: string) {
  return cloudStatusBucket(status) === 'progress';
}

/** i18n key for a raw status, falling back to the unknown label. */
export function cloudStatusKey(status: string) {
  const known = [
    'ready',
    'pending',
    'progress',
    'deleting',
    'failed',
    'cancelled',
    'deleted',
  ];
  const normalized = status.toLowerCase();

  return known.includes(normalized)
    ? `page.cloudProjects.status.${normalized}`
    : 'page.cloudProjects.status.unknown';
}
