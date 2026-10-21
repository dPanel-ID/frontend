import { GitBranchIcon, ServerIcon, Settings2Icon } from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

import { Badge } from '@/shared/presentation/atoms/Badge';

import { formatWorkspaceIacMode } from '../../-lib/workspace';
import type { WorkspaceIacRepository } from '../../-lib/workspace';
import { WorkspaceConfigRow } from '../../-presentation';

export default function WorkspaceOverview(props: {
  workspaceName: string;
  workspaceId?: string;
  workspaceType: string;
  iacRepository: WorkspaceIacRepository;
}) {
  const { iacRepository, workspaceId, workspaceName, workspaceType } = props;
  const t = useDevetekTranslations('page.dashboard');
  const iacRepositoryName = `${iacRepository.owner}/${iacRepository.repo}`;
  const iacRepositoryRef = t('workspace.iacRepositoryHelp', {
    ref: iacRepository.ref,
    mode: formatWorkspaceIacMode(iacRepository.mode, t),
  });

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
            <WorkspaceConfigRow
              icon={GitBranchIcon}
              label={t('workspace.iacRepository')}
              value={iacRepositoryName}
              helper={iacRepositoryRef}
            />
            <WorkspaceConfigRow
              icon={ServerIcon}
              label={t('workspace.workerUsed')}
              value={t('workspace.notReported')}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
