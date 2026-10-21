import type { DTOs } from '@/shared/api';

/** One SSH key as every list view needs it, with nothing left to decode. */
export interface SshKeyCard {
  id: number | string;
  name: string;
  /** Algorithm or secret type the backend reports, for example `ssh-key`. */
  type: string | null;
  /** "ed25519" or "rsa"; absent only for a key the backend could not read. */
  algorithm: string | null;
  /** Key size in bits, as a string, when the backend reports it. */
  length: string | null;
  /** "SHA256:..." identifier of the public key. */
  fingerprint: string | null;
  /** Label on the public key, normally the owner's email. */
  comment: string | null;
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
    algorithm: secret.data?.algorithm?.trim() || null,
    length: secret.data?.length?.trim() || null,
    fingerprint: secret.data?.fingerprint?.trim() || null,
    comment: secret.data?.comment?.trim() || null,
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

/**
 * What the key is, in the words a person recognises: "Ed25519", "RSA 4096",
 * or nothing to say when the backend could not read the key.
 */
export function sshKeyAlgorithmLabel(
  key: Pick<SshKeyCard, 'algorithm' | 'length'>,
): string | null {
  if (!key.algorithm) return null;

  if (key.algorithm.toLowerCase() === 'ed25519') return 'Ed25519';
  if (key.algorithm.toLowerCase() === 'rsa') {
    return key.length ? `RSA ${key.length}` : 'RSA';
  }

  return key.algorithm;
}

/**
 * The same facts split for a narrow slot: a short name that always fits, and
 * the size as a second line. A stat tile truncates its value, and beside the
 * help aside each tile is about 150px wide, where "RSA 4096" fits with
 * nothing to spare and an algorithm name the UI does not know would not.
 */
export function sshKeyAlgorithmParts(
  key: Pick<SshKeyCard, 'algorithm' | 'length'>,
): { name: string | null; detail: string | null } {
  if (!key.algorithm) return { name: null, detail: null };

  const algorithm = key.algorithm.toLowerCase();

  if (algorithm === 'ed25519') return { name: 'Ed25519', detail: null };
  if (algorithm === 'rsa') {
    return { name: 'RSA', detail: key.length ? `${key.length} bits` : null };
  }

  // An algorithm this build has no name for: the raw value is the detail, so
  // a long one wraps out of the way instead of being cut in half.
  return { name: 'SSH key', detail: key.algorithm };
}
