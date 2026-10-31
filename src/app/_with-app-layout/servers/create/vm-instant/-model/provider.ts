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

export function isAlibabaCloudProvider(provider?: string) {
  const normalizedProvider = normalizeProviderKey(provider);

  return (
    normalizedProvider === 'alibabacloud' ||
    normalizedProvider === 'alibaba' ||
    normalizedProvider === 'alicloud' ||
    normalizedProvider === 'aliyun'
  );
}

export function isTencentProvider(provider?: string) {
  const normalizedProvider = normalizeProviderKey(provider);

  return (
    normalizedProvider === 'tencent' ||
    normalizedProvider === 'tencentcloud' ||
    normalizedProvider === 'qcloud'
  );
}

/** Providers whose servers are placed in a zone picked inside the region. */
export function isZonalProvider(provider?: string) {
  return (
    isGcpProvider(provider) ||
    isAlibabaCloudProvider(provider) ||
    isTencentProvider(provider)
  );
}

/**
 * Providers whose servers join dpanel-network, which dPanel creates on first
 * use, so the form asks for no network.
 */
export function usesManagedNetwork(provider?: string) {
  return isZonalProvider(provider) || isAwsProvider(provider);
}

/**
 * The user dPanel logs in as for setup, for providers where the API picks it
 * from the image; undefined where the form asks for it.
 */
export function getFixedLoginUser(provider?: string) {
  if (isAlibabaCloudProvider(provider)) return 'root';
  if (usesManagedNetwork(provider)) return 'ubuntu';
  return undefined;
}
