import { useDevetekTranslations } from '@/services/i18n';

import { OperationStatusPill } from '@/entities/host-group/ui/OperationStatusPill';

import type { ClusterExecutionDto } from '@/shared/rules/cluster';

/**
 * The cluster's last install or uninstall execution: type, status and id.
 * The app has no page for a single execution outside group operations, so
 * the id is shown for support and the CLI (`dnocs cluster detail`).
 */
export function ClusterExecution(props: {
  execution: ClusterExecutionDto | null;
}) {
  const t = useDevetekTranslations('page.serverGroups.cluster');
  const { execution } = props;

  if (!execution) {
    return <span className="text-muted-foreground">{t('noExecution')}</span>;
  }

  return (
    <span className="inline-flex flex-wrap items-center gap-2">
      {execution.type && (
        <span className="font-semibold">{execution.type}</span>
      )}
      {execution.status && <OperationStatusPill status={execution.status} />}
      <code className="rounded bg-border/40 px-1.5 py-0.5 text-xs text-muted-foreground">
        {t('executionId', { id: execution.id })}
      </code>
    </span>
  );
}
