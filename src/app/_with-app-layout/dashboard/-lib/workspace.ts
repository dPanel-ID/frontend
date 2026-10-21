import type { useDevetekTranslations } from '@/services/i18n';

import type { DTOs } from '@/shared/api';

export interface WorkspaceIacRepository {
  owner: string;
  repo: string;
  ref: string;
  mode: string;
  status?: string;
}

/**
 * The workspace repository as the API reported it, or undefined when it
 * reported none. There is deliberately no built-in fallback: showing
 * configuration that may not be true is worse than showing none.
 */
export function buildWorkspaceIacRepository(
  repository?: DTOs.IACRepositoryV1,
): WorkspaceIacRepository | undefined {
  const owner = repository?.owner?.trim();
  const repo = repository?.repo?.trim();
  if (!owner || !repo) return undefined;

  return {
    owner,
    repo,
    ref:
      repository?.active_ref?.name?.trim() ||
      repository?.default_branch?.trim() ||
      repository?.ref_name?.trim() ||
      '',
    mode: repository?.mode?.trim() || '',
    status: repository?.status,
  };
}

/**
 * A recognised mode gets its translated label; anything else is shown as the
 * API reported it rather than being relabelled as something it may not be.
 *
 * Keys are relative to the caller's translation scope, which is the panel
 * rendering the repository.
 */
export function formatWorkspaceIacMode(
  mode: string,
  t: ReturnType<typeof useDevetekTranslations>,
) {
  switch (mode) {
    case 'custom':
      return t('iacRepositoryMode.custom');
    case 'managed':
      return t('iacRepositoryMode.managed');
    case 'shared':
      return t('iacRepositoryMode.shared');
    default:
      return mode || undefined;
  }
}
