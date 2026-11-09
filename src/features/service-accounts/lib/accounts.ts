import type { DTOs } from '@/shared/api';

import type { AccountRow, TokenRow, TokenStatus } from '../rules/types';

export function tokenStatus(
  token: DTOs.ServiceAccountTokenV1,
  now: Date,
): TokenStatus {
  if (token.revoked_at) return 'revoked';
  if (token.expires_at && new Date(token.expires_at) <= now) return 'expired';
  return 'active';
}

function toTokenRow(token: DTOs.ServiceAccountTokenV1, now: Date): TokenRow {
  return {
    id: token.id,
    name: token.name || token.id,
    hint: token.hint ?? '',
    status: tokenStatus(token, now),
    expiresAt: token.expires_at ?? undefined,
    lastUsedAt: token.last_used_at ?? undefined,
  };
}

/** Accounts for display; working tokens are listed before ended ones. */
export function toAccountRows(
  dto: DTOs.ServiceAccountListV1,
  now = new Date(),
): AccountRow[] {
  return (dto.service_accounts ?? []).map((account) => {
    const tokens = (account.tokens ?? []).map((token) =>
      toTokenRow(token, now),
    );

    return {
      id: account.id,
      name: account.name || account.id,
      description: account.description || undefined,
      role: account.role || undefined,
      username: account.username || undefined,
      createdAt: account.created_at,
      tokens: [
        ...tokens.filter((token) => token.status === 'active'),
        ...tokens.filter((token) => token.status !== 'active'),
      ],
    };
  });
}

export function formatDate(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;

  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
