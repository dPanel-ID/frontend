import { Link } from '@tanstack/react-router';
import {
  ActivityIcon,
  CpuIcon,
  HardDriveUploadIcon,
  LoaderIcon,
  PuzzleIcon,
  RefreshCwIcon,
  RotateCcwIcon,
  ServerIcon,
  ShieldAlertIcon,
  XIcon,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { useDevetekLocale, useDevetekTranslations } from '@/services/i18n';

import { OperationStatusPill } from '@/entities/host-group/ui/OperationStatusPill';

import { isTerminalOperationStatus } from '@/features/server-groups/shared/lib/operation';
import { buildOperationTargetLinks } from '@/features/server-groups/shared/lib/operation-target-links';

import { getApiErrorDetail } from '@/shared/libs/api-client/lib/error';
import { getDistanceFromNow } from '@/shared/libs/browser/date';
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
import { StatTile } from '@/shared/presentation/molecules/StatTile';
import {
  DataPanel,
  DataPanelPagination,
  DataPanelRetry,
  DataPanelState,
  dataTable,
  usePagedList,
} from '@/shared/presentation/organisms/DataPanel';
import { FailedState } from '@/widgets/failed-state';

import { useGroupDetailModel } from '../-model/group';
import { operationTypeLabel } from '../../-view/GroupCard';

/** What can run on the group, what ran, and how one run went per server. */
export default function OperationsTab() {
  return (
    <div className="grid gap-4">
      <RunActions />
      <OperationDetail />
      <History />
    </div>
  );
}

function RunActions() {
  const t = useDevetekTranslations('page.serverGroups.detail.operations.run');
  const { canRunActions, isDetailDegraded, setDialog } = useGroupDetailModel();

  const actions: Array<{
    key: string;
    icon: LucideIcon;
    label: string;
    hint: string;
    primary?: boolean;
    onClick: () => void;
  }> = [
    {
      key: 'module',
      icon: PuzzleIcon,
      label: t('installModule'),
      hint: t('installModuleHint'),
      primary: true,
      onClick: () => setDialog({ kind: 'module' }),
    },
    {
      key: 'deploy',
      icon: HardDriveUploadIcon,
      label: t('deploy'),
      hint: t('deployHint'),
      onClick: () => setDialog({ kind: 'deploy' }),
    },
    {
      key: 'inventory',
      icon: RefreshCwIcon,
      label: t('inventory'),
      hint: t('inventoryHint'),
      onClick: () => setDialog({ kind: 'bulk', action: 'inventory' }),
    },
    {
      key: 'reboot',
      icon: RotateCcwIcon,
      label: t('reboot'),
      hint: t('rebootHint'),
      onClick: () => setDialog({ kind: 'bulk', action: 'reboot' }),
    },
    {
      key: 'upgrade',
      icon: CpuIcon,
      label: t('upgrade'),
      hint: t('upgradeHint'),
      onClick: () => setDialog({ kind: 'bulk', action: 'upgrade' }),
    },
  ];

  return (
    <section className="rounded-2xl border bg-card p-4">
      <div className="mb-3">
        <h2 className="text-base font-bold">{t('title')}</h2>
        <p className="text-sm text-muted-foreground">
          {canRunActions
            ? t('description')
            : isDetailDegraded
              ? t('stale')
              : t('needMembers')}
        </p>
      </div>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
        {actions.map(({ hint, icon: Icon, key, label, onClick, primary }) => (
          <button
            key={key}
            type="button"
            disabled={!canRunActions}
            onClick={onClick}
            className={cn(
              'flex items-center gap-3 rounded-xl border bg-background/50 p-3 text-left transition-all',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/50',
              'disabled:cursor-not-allowed disabled:opacity-50',
              'enabled:hover:-translate-y-0.5 enabled:hover:border-sky-400/50 enabled:hover:shadow-lg enabled:hover:shadow-black/5',
              primary && 'border-sky-400/40 bg-sky-500/5',
            )}
          >
            <span
              className={cn(
                'flex size-9 shrink-0 items-center justify-center rounded-lg border',
                primary
                  ? 'border-sky-400/30 bg-sky-500/10 text-sky-600 dark:text-sky-300'
                  : 'bg-background text-muted-foreground',
              )}
            >
              <Icon className="size-4" />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold">
                {label}
              </span>
              <span className="block truncate text-xs text-muted-foreground">
                {hint}
              </span>
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}

function History() {
  const t = useDevetekTranslations(
    'page.serverGroups.detail.operations.history',
  );
  const tGroups = useDevetekTranslations('page.serverGroups');
  const tCommon = useDevetekTranslations('common.dataPanel');
  const locale = useDevetekLocale();
  const {
    goTo,
    historyResponse,
    isHistoryDegraded,
    operationId,
    operations,
    refreshHistory,
  } = useGroupDetailModel();
  const { page, pageItems, setPage, totalPage } = usePagedList(operations);

  const running = operations.filter(
    (operation) => !isTerminalOperationStatus(operation.status),
  ).length;
  const failed = operations.filter(
    (operation) => operation.status === 'failed',
  ).length;
  const isLoading = historyResponse.$status === 'loading';

  return (
    <DataPanel
      icon={ActivityIcon}
      title={t('title')}
      description={t('description')}
      actions={
        <Button
          buttonStyle="outline"
          buttonColor="secondary"
          size="sm"
          disabled={isLoading}
          onClick={() => refreshHistory()}
        >
          <RefreshCwIcon className={cn(isLoading && 'animate-spin')} />
          {tCommon('refresh')}
        </Button>
      }
      tiles={
        <>
          <StatTile
            size="sm"
            icon={ActivityIcon}
            tone="sky"
            label={t('tiles.total')}
            value={operations.length}
          />
          <StatTile
            size="sm"
            icon={LoaderIcon}
            tone={running > 0 ? 'sky' : 'neutral'}
            label={t('tiles.running')}
            value={running}
          />
          <StatTile
            size="sm"
            icon={ShieldAlertIcon}
            tone={failed > 0 ? 'red' : 'neutral'}
            label={t('tiles.failed')}
            value={failed}
          />
        </>
      }
      footer={
        <DataPanelPagination
          page={page}
          totalPage={totalPage}
          onPageChange={setPage}
        />
      }
    >
      {isHistoryDegraded && (
        <div className="border-b p-3">
          <FailedState.BannerRetryable onClickRetry={() => refreshHistory()} />
        </div>
      )}
      {historyResponse.$status === 'failed' && operations.length === 0 ? (
        <DataPanelState
          state="failed"
          title={tCommon('loadFailed')}
          description={getApiErrorDetail(historyResponse.error)}
          action={<DataPanelRetry onClick={() => refreshHistory()} />}
        />
      ) : isLoading && operations.length === 0 ? (
        <DataPanelState state="loading" title={tCommon('loading')} />
      ) : operations.length === 0 ? (
        <DataPanelState state="empty" title={t('empty')} />
      ) : (
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className={dataTable.head}>
                {t('table.operation')}
              </TableHead>
              <TableHead className={cn(dataTable.head, 'w-36')}>
                {t('table.status')}
              </TableHead>
              <TableHead className={cn(dataTable.head, 'w-24')}>
                {t('table.targets')}
              </TableHead>
              <TableHead className={cn(dataTable.head, 'w-40')}>
                {t('table.result')}
              </TableHead>
              <TableHead className={cn(dataTable.head, 'w-36')}>
                {t('table.updated')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageItems.map((operation) => (
              <TableRow
                key={operation.id}
                className={cn(
                  'cursor-pointer',
                  operation.id === operationId && 'bg-sky-500/5',
                )}
                onClick={() => goTo({ operationId: operation.id })}
              >
                <TableCell className={cn(dataTable.cell, 'font-semibold')}>
                  {operationTypeLabel(operation.type, tGroups)}
                  <span className="ml-2 font-mono text-[11px] font-normal text-muted-foreground">
                    {operation.id}
                  </span>
                </TableCell>
                <TableCell className={dataTable.cell}>
                  <OperationStatusPill status={operation.status} />
                </TableCell>
                <TableCell className={dataTable.mutedCell}>
                  {operation.targetCount}
                </TableCell>
                <TableCell className={dataTable.mutedCell}>
                  {t('result', {
                    succeeded: operation.succeededCount,
                    failed: operation.failedCount,
                  })}
                </TableCell>
                <TableCell className={dataTable.mutedCell}>
                  {getDistanceFromNow(operation.updatedAt, locale)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </DataPanel>
  );
}

function OperationDetail() {
  const t = useDevetekTranslations(
    'page.serverGroups.detail.operations.detail',
  );
  const tGroups = useDevetekTranslations('page.serverGroups');
  const tCommon = useDevetekTranslations('common.dataPanel');
  const {
    goTo,
    groupId,
    isOperationDegraded,
    operation,
    operationId,
    operationResponse,
    refreshOperation,
    setDialog,
  } = useGroupDetailModel();

  if (!operationId) return null;

  const isRunning = operation
    ? !isTerminalOperationStatus(operation.status)
    : false;
  const canRetry =
    operation != null &&
    isTerminalOperationStatus(operation.status) &&
    operation.failedCount > 0;

  return (
    <DataPanel
      icon={operation && isRunning ? LoaderIcon : ActivityIcon}
      title={
        operation
          ? `${operationTypeLabel(operation.type, tGroups)} · ${operation.id}`
          : t('title')
      }
      description={isRunning ? t('polling') : t('description')}
      actions={
        <>
          {canRetry && (
            <Button
              buttonStyle="outline"
              buttonColor="secondary"
              size="sm"
              onClick={() => setDialog({ kind: 'retry' })}
            >
              <RotateCcwIcon />
              {t('retry')}
            </Button>
          )}
          <Button
            buttonStyle="outline"
            buttonColor="secondary"
            size="sm"
            onClick={() => refreshOperation()}
          >
            <RefreshCwIcon />
            {t('refresh')}
          </Button>
          <Button
            buttonStyle="outline"
            buttonColor="secondary"
            size="icon-sm"
            aria-label={t('close')}
            title={t('close')}
            onClick={() => goTo({ operationId: undefined })}
          >
            <XIcon />
          </Button>
        </>
      }
      tiles={
        operation ? (
          <>
            <StatTile
              size="sm"
              icon={ActivityIcon}
              label={t('table.status')}
              value={<OperationStatusPill status={operation.status} />}
            />
            <StatTile
              size="sm"
              icon={ServerIcon}
              tone="sky"
              label={t('table.server')}
              value={operation.targetCount}
            />
            <StatTile
              size="sm"
              icon={ShieldAlertIcon}
              tone={operation.failedCount > 0 ? 'red' : 'emerald'}
              label={tGroups('detail.operations.history.table.result')}
              value={tGroups('detail.operations.history.result', {
                succeeded: operation.succeededCount,
                failed: operation.failedCount,
              })}
            />
          </>
        ) : undefined
      }
    >
      {isOperationDegraded && (
        <div className="border-b p-3">
          <FailedState.BannerRetryable
            onClickRetry={() => refreshOperation()}
          />
        </div>
      )}
      {operationResponse.$status === 'failed' && !operation ? (
        <DataPanelState
          state="failed"
          title={tCommon('loadFailed')}
          description={getApiErrorDetail(operationResponse.error)}
          action={<DataPanelRetry onClick={() => refreshOperation()} />}
        />
      ) : !operation ? (
        <DataPanelState state="loading" title={tCommon('loading')} />
      ) : operation.targets.length === 0 ? (
        <DataPanelState state="empty" title={t('noTargets')} />
      ) : (
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className={dataTable.head}>
                {t('table.server')}
              </TableHead>
              <TableHead className={cn(dataTable.head, 'w-36')}>
                {t('table.status')}
              </TableHead>
              <TableHead className={cn(dataTable.head, 'w-64')}>
                {t('table.links')}
              </TableHead>
              <TableHead className={dataTable.head}>
                {t('table.error')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {operation.targets.map((target) => {
              const links = buildOperationTargetLinks({
                groupId,
                operationId: operation.id,
                target,
              });

              return (
                <TableRow key={target.id}>
                  <TableCell className={cn(dataTable.cell, 'font-semibold')}>
                    <Link
                      to={links.server.to}
                      params={links.server.params}
                      className="text-primary hover:underline"
                    >
                      {target.serverId}
                    </Link>
                  </TableCell>
                  <TableCell className={dataTable.cell}>
                    <OperationStatusPill status={target.status} />
                  </TableCell>
                  <TableCell className={dataTable.cell}>
                    <div className="flex flex-wrap gap-1.5">
                      {links.execution && (
                        <Link
                          to={links.execution.to}
                          params={links.execution.params}
                          className="rounded-full border bg-background/60 px-2 py-0.5 text-xs font-semibold text-sky-700 hover:border-sky-400/50 dark:text-sky-300"
                        >
                          {t('execution')}
                        </Link>
                      )}
                      {links.deployment && (
                        <Link
                          to={links.deployment.to}
                          params={links.deployment.params}
                          className="rounded-full border bg-background/60 px-2 py-0.5 text-xs font-semibold text-sky-700 hover:border-sky-400/50 dark:text-sky-300"
                        >
                          {t('deployment')}
                        </Link>
                      )}
                      {links.agentCommand && (
                        <Link
                          to={links.agentCommand.to}
                          params={links.agentCommand.params}
                          className="rounded-full border bg-background/60 px-2 py-0.5 text-xs font-semibold text-sky-700 hover:border-sky-400/50 dark:text-sky-300"
                        >
                          {t('command')}
                        </Link>
                      )}
                      {!links.execution &&
                        !links.deployment &&
                        !links.agentCommand && (
                          <span className="text-muted-foreground">-</span>
                        )}
                    </div>
                  </TableCell>
                  <TableCell
                    className={cn(
                      dataTable.mutedCell,
                      'max-w-80 truncate',
                      target.error && 'text-red-600 dark:text-red-300',
                    )}
                    title={target.error}
                  >
                    {target.error || '-'}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </DataPanel>
  );
}
