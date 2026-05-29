export function normalizeLoadBalancerPathMatchForPayload(match: string) {
  const normalized = match.trim() || '/';
  const wildcard = normalized.includes('*');

  if (!wildcard) {
    return {
      pathMatch: normalized,
      wildcard,
    };
  }

  const pathMatch =
    normalized
      .replace(/\*/g, '')
      .replace(/\/{2,}/g, '/')
      .replace(/\/+$/, '') || '/';

  return {
    pathMatch,
    wildcard,
  };
}

export function formatLoadBalancerPathMatchForDisplay(
  match: string,
  wildcard?: boolean,
) {
  const normalized = match.trim() || '/';

  if (!wildcard || normalized.includes('*')) return normalized;

  if (normalized === '/') return '/*';

  return `${normalized.replace(/\/+$/, '')}/*`;
}
