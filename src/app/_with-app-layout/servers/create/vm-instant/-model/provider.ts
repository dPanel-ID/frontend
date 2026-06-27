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

export function isGcpProvider(provider?: string) {
  const normalizedProvider = normalizeProviderKey(provider);

  return (
    normalizedProvider === 'gcp' ||
    normalizedProvider === 'googlecloud' ||
    normalizedProvider === 'googlecloudplatform'
  );
}

export function isDigitalOceanProvider(provider?: string) {
  const normalizedProvider = normalizeProviderKey(provider);

  return (
    normalizedProvider === 'digitalocean' ||
    normalizedProvider === 'digitaloceancloud' ||
    normalizedProvider === 'do'
  );
}

export function isAwsProvider(provider?: string) {
  const normalizedProvider = normalizeProviderKey(provider);

  return (
    normalizedProvider === 'aws' ||
    normalizedProvider === 'amazonwebservices' ||
    normalizedProvider === 'amazon'
  );
}
