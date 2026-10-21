import type { DTOs } from '@/shared/api';

/** One SSH key as every list view needs it, with nothing left to decode. */
export interface SshKeyCard {
  id: number | string;
  name: string;
  /** Algorithm or secret type the backend reports, for example `ssh-key`. */
  type: string | null;
  /** Key size in bits, as a string, when the backend reports it. */
  length: string | null;
  /** Safe to show and copy; the private half never leaves the backend. */
  publicKey: string | null;
  ownerName: string | null;
  teamName: string | null;
  /** Casdoor workspace group ID; absent for personal keys. */
  teamId: string | null;
  sharedWithTeam: boolean;
  createdAt: string | null;
  updatedAt: string | null;
}

/**
 * Maps a key DTO to its card model. Returns null for records without an ID,
 * which production data still contains and which nothing can act on.
 */
export function toSshKeyCard(
  secret: DTOs.SshKeyV1,
  fallbackName: string,
): SshKeyCard | null {
  if (secret.id == null) return null;

  const teamName = secret.organization?.name ?? null;

  return {
    id: secret.id,
    name: secret.name?.trim() || fallbackName,
    type: secret.type?.trim() || null,
    length: secret.data?.length?.trim() || null,
    publicKey: secret.data?.public?.trim() || null,
    ownerName:
      secret.user?.fullname ||
      secret.user?.username ||
      secret.user?.email ||
      null,
    teamName,
    teamId:
      secret.workspace_type === 'group' ? (secret.workspace_id ?? null) : null,
    sharedWithTeam: Boolean(teamName || secret.organization_id),
    createdAt: secret.created_at ?? null,
    updatedAt: secret.updated_at ?? null,
  };
}
