export function normalizeProviderKey(provider?: string) {
  return (provider ?? '').toLowerCase().replace(/[\s_-]/g, '');
}

export function isBiznetGioProvider(provider?: string) {
  const normalizedProvider = normalizeProviderKey(provider);

  return (
    normalizedProvider === 'biznetgio' ||
    normalizedProvider === 'biznetgioneolite' ||
    normalizedProvider === 'neolite'
  );
}
