import type { DTOs } from '@/shared/api';

export type CloudProviderKind = 'gcp' | 'idcloudhost' | 'proxmox' | 'generic';

export function getProviderContracts(response: {
  $status: string;
  providers?: DTOs.CloudProviderContractV1[];
  prevData?: DTOs.CloudProviderContractListV1;
}) {
  if (response.$status === 'success') {
    return normalizeProviderContracts(response.providers);
  }

  if (response.$status === 'loading') {
    return normalizeProviderContracts(response.prevData?.providers);
  }

  return [];
}

export function normalizeProviderContracts(
  providers?: DTOs.CloudProviderContractV1[],
) {
  return (providers ?? []).filter((provider) =>
    Boolean(getProviderValue(provider)),
  );
}

export function findProviderContract(
  providers: DTOs.CloudProviderContractV1[],
  value?: string,
) {
  if (!value) return undefined;

  const normalizedValue = normalizeProviderToken(value);

  return providers.find((provider) => {
    const tokens = [
      provider.id,
      provider.name,
      ...(provider.aliases ?? []),
    ].map(normalizeProviderToken);

    return tokens.includes(normalizedValue);
  });
}

export function getProviderValue(provider: DTOs.CloudProviderContractV1) {
  return provider.id || provider.aliases?.[0] || provider.name || '';
}

export function getProviderLabel(provider?: DTOs.CloudProviderContractV1) {
  if (!provider) return 'Cloud provider';
  return (
    provider.name || provider.id || provider.aliases?.[0] || 'Cloud provider'
  );
}

export function getProviderKind(
  value?: string,
  provider?: DTOs.CloudProviderContractV1,
): CloudProviderKind {
  const tokens = [
    value,
    provider?.id,
    provider?.name,
    ...(provider?.aliases ?? []),
  ].map(normalizeProviderToken);

  if (tokens.some((token) => token.includes('proxmox'))) return 'proxmox';
  if (tokens.some((token) => token === 'gcp' || token.includes('google'))) {
    return 'gcp';
  }
  if (tokens.some((token) => token.includes('idcloudhost'))) {
    return 'idcloudhost';
  }

  return 'generic';
}

export function getCredentialFields(provider?: DTOs.CloudProviderContractV1) {
  const fields =
    provider?.payload_contract?.credential_fields ??
    provider?.payload_contract?.fields ??
    [];

  return fields.filter((field) => Boolean(getCredentialFieldKey(field)));
}

export function getCredentialFieldKey(field: DTOs.CloudProviderFieldV1) {
  if (field.key) return field.key;
  if (!field.path) return '';

  const pathParts = field.path.split('.').filter(Boolean);
  return pathParts[pathParts.length - 1] ?? '';
}

export function getProviderIconFallback(
  provider?: DTOs.CloudProviderContractV1,
) {
  const fallback =
    provider?.icon?.fallback ||
    provider?.name?.slice(0, 2) ||
    provider?.id?.slice(0, 2) ||
    'CP';

  return fallback.toUpperCase();
}

function normalizeProviderToken(value?: string) {
  return (
    value
      ?.trim()
      .toLowerCase()
      .replace(/[\s_-]+/g, '') ?? ''
  );
}
