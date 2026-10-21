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
 */
export function formatWorkspaceIacMode(
  mode: string,
  t: ReturnType<typeof useDevetekTranslations>,
) {
  switch (mode) {
    case 'custom':
      return t('workspace.iacRepositoryMode.custom');
    case 'managed':
      return t('workspace.iacRepositoryMode.managed');
    case 'shared':
      return t('workspace.iacRepositoryMode.shared');
    default:
      return mode || undefined;
  }
}

/** Says only what the repository payload actually reported. */
export function workspaceIacHelper(
  repository: WorkspaceIacRepository,
  t: ReturnType<typeof useDevetekTranslations>,
) {
  const mode = formatWorkspaceIacMode(repository.mode, t);

  if (mode && repository.ref) {
    return t('workspace.iacRepositoryHelp', { mode, ref: repository.ref });
  }
  if (repository.ref) {
    return t('workspace.iacRepositoryRefOnly', { ref: repository.ref });
  }
  return mode;
}
