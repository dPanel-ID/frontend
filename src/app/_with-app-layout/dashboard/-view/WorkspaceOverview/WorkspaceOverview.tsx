import { GitBranchIcon, Settings2Icon } from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

import { Badge } from '@/shared/presentation/atoms/Badge';
import Shimmer from '@/shared/presentation/atoms/Shimmer';

import { workspaceIacHelper } from '../../-lib/workspace';
import type { WorkspaceIacRepository } from '../../-lib/workspace';
import { WorkspaceConfigRow } from '../../-presentation';

export default function WorkspaceOverview(props: {
  workspaceName: string;
  workspaceId?: string;
  workspaceType: string;
  /** Undefined when the API reported no repository for this workspace. */
  iacRepository?: WorkspaceIacRepository;
  isIacRepositoryLoading: boolean;
}) {
  const {
    iacRepository,
    isIacRepositoryLoading,
    workspaceId,
    workspaceName,
    workspaceType,
  } = props;
  const t = useDevetekTranslations('page.dashboard');

  return (
    <section className="rounded-lg border bg-card p-4">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(360px,0.48fr)]">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="font-semibold">
              {workspaceType}
            </Badge>
            {workspaceId && (
              <span className="truncate text-xs font-medium text-muted-foreground">
                {workspaceId}
              </span>
            )}
          </div>
          <h2 className="mt-3 truncate text-xl font-bold text-primary">
            {workspaceName}
          </h2>
          <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
            {t('workspace.description')}
          </p>
        </div>

        <div className="rounded-lg border bg-background p-3">
          <p className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
            <Settings2Icon className="size-3.5" />
            {t('workspace.configTitle')}
          </p>
          <div className="grid gap-2">
            <WorkspaceIacRepositoryRow
              repository={iacRepository}
              isLoading={isIacRepositoryLoading}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * Names the workspace's IaC repository, or says it is unknown. It never falls
 * back to a built-in default: showing configuration that may not be true is
 * worse than showing none.
 */
function WorkspaceIacRepositoryRow(props: {
  repository?: WorkspaceIacRepository;
  isLoading: boolean;
}) {
  const { isLoading, repository } = props;
  const t = useDevetekTranslations('page.dashboard');

  if (isLoading && !repository) {
    return (
      <div className="flex min-w-0 items-center gap-3 rounded-lg border bg-card px-3 py-2">
        <Shimmer className="size-9 shrink-0 rounded-md" />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-xs font-medium text-muted-foreground">
            {t('workspace.iacRepository')}
          </span>
          <Shimmer className="mt-1 h-4 w-40 max-w-full" />
        </span>
      </div>
    );
  }

  if (!repository) {
    return (
      <WorkspaceConfigRow
        icon={GitBranchIcon}
        label={t('workspace.iacRepository')}
        value={t('workspace.iacRepositoryUnknown')}
        helper={t('workspace.iacRepositoryUnknownHelp')}
      />
    );
  }

  return (
    <WorkspaceConfigRow
      icon={GitBranchIcon}
      label={t('workspace.iacRepository')}
      value={`${repository.owner}/${repository.repo}`}
      helper={workspaceIacHelper(repository, t)}
    />
  );
}
