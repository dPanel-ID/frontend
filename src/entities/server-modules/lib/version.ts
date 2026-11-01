import { useDevetekTranslations } from '@/services/i18n';

export type ModuleVersionKind =
  | 'release'
  | 'latest'
  | 'branch'
  | 'build'
  | 'default'
  | 'other';

export interface ModuleVersion {
  kind: ModuleVersionKind;
  value: string;
}

const RELEASE = /^v?(\d+(?:\.\d+)*(?:[-+][\w.-]+)?)$/i;
const COMMIT = /^[0-9a-f]{7,40}$/i;
const MAIN_BRANCHES = new Set(['main', 'master']);

/**
 * Reads what a module installation calls its version — a Git ref such as
 * "tags/v1.0.0" or "heads/main", a commit, or a plain "22" — as something a
 * person can name: a release, the latest code, a branch or a build.
 */
export function parseModuleVersion(
  raw?: string | null,
): ModuleVersion | undefined {
  let value = raw?.trim() ?? '';
  if (!value) return undefined;

  value = value.replace(/^refs\//, '');
  if (value.toLowerCase() === 'default') return { kind: 'default', value };

  if (value.startsWith('tags/')) {
    const tag = value.slice('tags/'.length);
    return { kind: 'release', value: tag.match(RELEASE)?.[1] ?? tag };
  }

  const branch = value.startsWith('heads/')
    ? value.slice('heads/'.length)
    : MAIN_BRANCHES.has(value)
      ? value
      : undefined;
  if (branch) {
    return MAIN_BRANCHES.has(branch)
      ? { kind: 'latest', value: branch }
      : { kind: 'branch', value: branch };
  }

  const release = value.match(RELEASE)?.[1];
  if (release) return { kind: 'release', value: release };
  if (COMMIT.test(value)) return { kind: 'build', value: value.slice(0, 7) };

  return { kind: 'other', value };
}

/** Formats a module version for people: "Version 1.0.0", "Latest", … */
export function useModuleVersionLabel() {
  const t = useDevetekTranslations('common.moduleVersion');

  return (raw?: string | null) => {
    const version = parseModuleVersion(raw);
    if (!version) return '';

    switch (version.kind) {
      case 'release':
        return t('release', { version: version.value });
      case 'latest':
        return t('latest');
      case 'branch':
        return t('branch', { branch: version.value });
      case 'build':
        return t('build', { build: version.value });
      case 'default':
        return t('default');
      case 'other':
        return version.value;
    }
  };
}
