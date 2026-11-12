/**
 * Which runtime installer a language module installation comes from. The
 * new runtime (installed once per server, prebuilt) records keys ending in
 * ":mise"; the previous installers (nvm, pyenv, rbenv, the Go, Bun and uv
 * roles, apt PHP) recorded ":system". Users only ever see "new runtime" and
 * "previous runtime".
 */
export type RuntimeInstaller = 'new' | 'previous';

const LANGUAGE_MODULES = new Set([
  'nodejs',
  'go',
  'python',
  'ruby',
  'bun',
  'uv',
  'php',
]);

export function runtimeInstaller(installation: {
  module_name?: string;
  installation_key?: string;
}): RuntimeInstaller | null {
  if (!LANGUAGE_MODULES.has(installation.module_name ?? '')) return null;
  const key = installation.installation_key ?? '';
  if (key.endsWith(':mise')) return 'new';
  if (key.endsWith(':system') || key.endsWith(':application'))
    return 'previous';
  return null;
}
