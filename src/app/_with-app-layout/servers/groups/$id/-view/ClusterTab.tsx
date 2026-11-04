import { Link } from '@tanstack/react-router';
import { BoxesIcon, PowerOffIcon, ServerIcon, Trash2Icon } from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

import {
  canDeleteCluster,
  canUninstallCluster,
  isClusterTransitioning,
} from '@/features/server-groups/shared/lib/cluster';
import { ClusterExecution } from '@/features/server-groups/view/ClusterExecution';
import {
  ClusterEngineIcon,
  ClusterKindIcon,
} from '@/features/server-groups/view/ClusterKindIcon';
import { ClusterStatusPill } from '@/features/server-groups/view/ClusterStatusPill';

import { getApiErrorDetail } from '@/shared/libs/api-client/lib/error';
import { cn } from '@/shared/libs/tailwind/cn';
import { Button } from '@/shared/presentation/atoms/ButtonV2';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/presentation/atoms/Table';
import { StatusPill } from '@/shared/presentation/molecules/StatusPill';
import {
  DataPanel,
  DataPanelRetry,
  DataPanelState,
  dataTable,
} from '@/shared/presentation/organisms/DataPanel';
import { FailedState } from '@/widgets/failed-state';

import { useGroupDetailModel } from '../-model/group';

/** The cluster on this group: what runs, where, and its lifecycle actions. */
export default function ClusterTab() {
  const t = useDevetekTranslations('page.serverGroups.cluster');
  const tCommon = useDevetekTranslations('common.dataPanel');
  const {
    cluster,
    clusterResponse,
    group,
    isClusterDegraded,
    refreshCluster,
    setDialog,
  } = useGroupDetailModel();

  const summary = group?.cluster;
  const status = cluster?.status ?? summary?.status;
  const kind = cluster?.kind ?? summary?.kind ?? '';
  const engine = cluster?.engine || summary?.engine || '';
  const deletable = canDeleteCluster(status);

  const actions = (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        size="sm"
        buttonStyle="outline"
        buttonColor="secondary"
        disabled={!cluster || !canUninstallCluster(status)}
        onClick={() => setDialog({ kind: 'clusterUninstall' })}
      >
        <PowerOffIcon className="size-4" />
        {t('uninstall')}
      </Button>
      <Button
        size="sm"
        buttonStyle="outline"
        buttonColor="secondary"
        className="text-red-600 hover:border-red-400/40 hover:bg-red-500/10 dark:text-red-300"
        disabled={!cluster || !deletable}
        title={deletable ? undefined : t('deleteDisabled')}
        onClick={() => setDialog({ kind: 'clusterDelete' })}
      >
        <Trash2Icon className="size-4" />
        {t('delete')}
      </Button>
    </div>
  );

  if (!cluster) {
    return (
      <DataPanel
        icon={BoxesIcon}
        title={t('title')}
        description={t('description')}
      >
        {clusterResponse.$status === 'failed' ? (
          <DataPanelState
            state="failed"
            title={t('loadFailed')}
            description={getApiErrorDetail(clusterResponse.error)}
            action={<DataPanelRetry onClick={() => refreshCluster()} />}
          />
        ) : (
          <DataPanelState state="loading" title={tCommon('loading')} />
        )}
      </DataPanel>
    );
  }

  return (
    <DataPanel
      icon={BoxesIcon}
      title={t('title')}
      description={t('description')}
      actions={actions}
    >
      {isClusterDegraded && (
        <div className="border-b p-3">
          <FailedState.BannerRetryable
            classNameWrapper="shadow-none"
            onClickRetry={() => refreshCluster()}
          />
        </div>
      )}

      <dl className="grid gap-x-6 gap-y-3 border-b p-4 text-sm sm:grid-cols-2 lg:grid-cols-3">
        <Fact label={t('kind')}>
          <span className="inline-flex items-center gap-1.5 capitalize">
            <ClusterKindIcon kind={kind} className="size-4" />
            {kind}
          </span>
        </Fact>
        <Fact label={t('engine')}>
          <span className="inline-flex items-center gap-1.5">
            <ClusterEngineIcon engine={engine} kind={kind} className="size-4" />
            {engine || '-'}
          </span>
        </Fact>
        <Fact label={t('version')}>{cluster.version || '-'}</Fact>
        <Fact label={t('status')}>
          <ClusterStatusPill status={status} />
        </Fact>
        <Fact label={t('apiEndpoint')}>
          {cluster.api_endpoint ? (
            <code className="break-all text-xs">{cluster.api_endpoint}</code>
          ) : (
            <span className="text-muted-foreground">{t('notAvailable')}</span>
          )}
        </Fact>
        <Fact label={t('lastExecution')}>
          <ClusterExecution execution={cluster.last_execution} />
        </Fact>
      </dl>

      {isClusterTransitioning(status) && (
        <p
          className="border-b px-4 py-2 text-xs text-muted-foreground"
          aria-live="polite"
        >
          {t('polling')}
        </p>
      )}

      <h3 className="px-4 pt-4 text-sm font-semibold text-primary">
        {t('nodes')}
      </h3>
      {cluster.nodes.length === 0 ? (
        <DataPanelState state="empty" title={t('noNodes')} />
      ) : (
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className={dataTable.head}>
                {t('table.server')}
              </TableHead>
              <TableHead className={cn(dataTable.head, 'w-28')}>
                {t('table.role')}
              </TableHead>
              <TableHead className={cn(dataTable.head, 'w-32')}>
                {t('table.status')}
              </TableHead>
              <TableHead className={cn(dataTable.head, 'w-24')}>
                {t('table.arch')}
              </TableHead>
              <TableHead className={cn(dataTable.head, 'w-36')}>
                {t('table.region')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cluster.nodes.map((node) => (
              <TableRow key={node.server_id}>
                <TableCell className={dataTable.cell}>
                  <div className="flex min-w-0 items-center gap-2">
                    <ServerIcon className="size-4 shrink-0 text-muted-foreground" />
                    <span className="min-w-0">
                      <Link
                        to="/servers/$id"
                        params={{ id: node.server_id }}
                        className="block truncate font-semibold text-primary hover:underline"
                      >
                        {node.server_name || node.address || node.server_id}
                      </Link>
                      {node.address && (
                        <span className="block truncate text-xs text-muted-foreground">
                          {node.address}
                        </span>
                      )}
                    </span>
                  </div>
                </TableCell>
                <TableCell className={cn(dataTable.cell, 'capitalize')}>
                  {node.role || '-'}
                </TableCell>
                <TableCell className={dataTable.cell}>
                  {node.status ? (
                    <StatusPill
                      tone={nodeTone(node.status)}
                      label={node.status}
                    />
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell className={dataTable.cell}>
                  {node.arch || '-'}
                </TableCell>
                <TableCell className={dataTable.cell}>
                  {node.region || '-'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </DataPanel>
  );
}

/** Node statuses are free-form; map the common ones to a tone. */
function nodeTone(status: string) {
  switch (status.toLowerCase()) {
    case 'ready':
    case 'running':
    case 'succeeded':
      return 'success' as const;
    case 'failed':
    case 'notready':
      return 'danger' as const;
    case 'installing':
    case 'uninstalling':
    case 'pending':
      return 'info' as const;
    default:
      return 'neutral' as const;
  }
}

function Fact(props: { label: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs font-semibold text-muted-foreground">
        {props.label}
      </dt>
      <dd className="mt-1 min-w-0 font-medium">{props.children}</dd>
    </div>
  );
}
