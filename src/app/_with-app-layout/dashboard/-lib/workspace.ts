import type { useDevetekTranslations } from '@/services/i18n';

import type { DTOs } from '@/shared/api';

export interface WorkspaceIacRepository {
  owner: string;
  repo: string;
  ref: string;
  mode: string;
  status?: string;
}

export const DEFAULT_WORKSPACE_IAC_REPOSITORY = {
  owner: 'dPanel-ID',
  repo: 'dpanel-iac-ansible-shared',
  ref: 'main',
  mode: 'shared',
} satisfies WorkspaceIacRepository;

export function buildWorkspaceIacRepository(
  repository?: DTOs.IACRepositoryV1,
): WorkspaceIacRepository {
  return {
    owner: repository?.owner || DEFAULT_WORKSPACE_IAC_REPOSITORY.owner,
    repo: repository?.repo || DEFAULT_WORKSPACE_IAC_REPOSITORY.repo,
    ref:
      repository?.active_ref?.name ||
      repository?.default_branch ||
      repository?.ref_name ||
      DEFAULT_WORKSPACE_IAC_REPOSITORY.ref,
    mode:
      repository?.repo === DEFAULT_WORKSPACE_IAC_REPOSITORY.repo
        ? DEFAULT_WORKSPACE_IAC_REPOSITORY.mode
        : repository?.mode || DEFAULT_WORKSPACE_IAC_REPOSITORY.mode,
    status: repository?.status,
  };
}

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
      return t('workspace.iacRepositoryMode.unknown');
  }
}
