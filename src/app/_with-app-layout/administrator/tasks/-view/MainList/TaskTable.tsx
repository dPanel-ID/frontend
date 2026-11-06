import dayjs from 'dayjs';

import { useDevetekTranslations } from '@/services/i18n';

import { UserLink } from '@/entities/user/ui/UserLink';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/presentation/atoms/Table';
import { StatusPill } from '@/shared/presentation/molecules/StatusPill';
import type { StatusTone } from '@/shared/presentation/molecules/StatusPill';

import { formatDuration } from '../../-lib/describe-admin-task';
import type {
  AdminTaskCleanupVerdict,
  AdminTaskGatewayState,
  AdminTaskRow,
  AdminTaskStatus,
} from '../../-lib/describe-admin-task';

import { TaskActions } from './TaskActions';

const STATUS_TONES: Record<AdminTaskStatus, StatusTone> = {
  running: 'info',
  queued: 'warning',
  pending: 'neutral',
  unknown: 'neutral',
};

const GATEWAY_TONES: Record<AdminTaskGatewayState, StatusTone> = {
  claimed: 'success',
  waiting: 'warning',
  none: 'danger',
};

const CLEANUP_TONES: Record<AdminTaskCleanupVerdict, StatusTone> = {
  safe_to_delete: 'danger',
  stale: 'warning',
  active: 'success',
  unknown: 'neutral',
};

const LEGEND: AdminTaskCleanupVerdict[] = ['safe_to_delete', 'stale', 'active'];

interface TaskTableProps {
  tasks: AdminTaskRow[];
}

/** One line per unfinished task, oldest first, as the API orders them. */
export default function TaskTable(props: TaskTableProps) {
  const { tasks } = props;
  const t = useDevetekTranslations('page.adminTasks');

  return (
    <div className="grid gap-3">
      <CleanupLegend />
      <div className="overflow-x-auto rounded-2xl border bg-card">
        <Table className="min-w-[1320px]">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="px-4">{t('table.execution')}</TableHead>
              <TableHead>{t('table.status')}</TableHead>
              <TableHead>{t('table.cleanup')}</TableHead>
              <TableHead>{t('table.createdBy')}</TableHead>
              <TableHead>{t('table.workspace')}</TableHead>
              <TableHead>{t('table.server')}</TableHead>
              <TableHead>{t('table.worker')}</TableHead>
              <TableHead>{t('table.gateway')}</TableHead>
              <TableHead>{t('table.heartbeat')}</TableHead>
              <TableHead>{t('table.idle')}</TableHead>
              <TableHead>{t('table.created')}</TableHead>
              <TableHead className="px-4 text-right">
                {t('table.actions')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.map((task) => (
              <TableRow key={task.executionId} className="align-top">
                <TableCell className="max-w-[18rem] px-4">
                  <div className="flex min-w-0 flex-col gap-0.5">
                    <span
                      className="truncate font-mono text-xs font-semibold text-primary"
                      title={task.executionId}
                    >
                      {task.shortId}
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
                      {[task.type ?? t('table.unknownType'), task.module]
                        .filter(Boolean)
                        .join(' · ')}
                    </span>
                    {task.lastEventMessage && (
                      <span
                        className="line-clamp-2 whitespace-normal text-[0.7rem] text-muted-foreground"
                        title={task.lastEventMessage}
                      >
                        {task.lastEventMessage}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <StatusPill
                    tone={STATUS_TONES[task.status]}
                    pulse={task.status === 'running'}
                    label={t(`status.${task.status}`)}
                    title={task.rawStatus ?? undefined}
                  />
                </TableCell>
                <TableCell className="max-w-[13rem]">
                  <div className="flex flex-col items-start gap-1">
                    <StatusPill
                      tone={CLEANUP_TONES[task.cleanup]}
                      label={t(`cleanup.verdict.${task.cleanup}`)}
                      title={t(`cleanup.verdictHint.${task.cleanup}`)}
                    />
                    {task.cleanupReasons.map((reason) => (
                      <span
                        key={reason}
                        className="whitespace-normal text-[0.7rem] leading-snug text-muted-foreground"
                      >
                        {t(`cleanup.reason.${reason}`)}
                      </span>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="max-w-[11rem] text-xs text-primary/80">
                  {task.createdBy ? (
                    <UserLink {...task.createdBy} />
                  ) : (
                    <span className="text-primary/40">—</span>
                  )}
                </TableCell>
                <TableCell className="max-w-[10rem]">
                  <Mono value={task.workspaceId} />
                </TableCell>
                <TableCell className="max-w-[12rem]">
                  <div className="flex min-w-0 flex-col">
                    {task.serverDeleted ? (
                      <span className="truncate text-xs font-semibold text-red-700 dark:text-red-300">
                        {t('table.deletedServer')}
                      </span>
                    ) : (
                      <span className="truncate text-xs text-primary/80">
                        {task.serverHostname ??
                          (task.serverId ? t('table.unnamedServer') : '—')}
                      </span>
                    )}
                    {task.serverId && (
                      <span
                        className="truncate font-mono text-[0.65rem] text-muted-foreground"
                        title={task.serverId}
                      >
                        {task.serverId}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="max-w-[10rem]">
                  <Mono value={task.workerId} />
                </TableCell>
                <TableCell>
                  <StatusPill
                    tone={GATEWAY_TONES[task.gatewayState]}
                    label={t(`gateway.${task.gatewayState}`)}
                    title={t(`gateway.${task.gatewayState}Hint`)}
                  />
                </TableCell>
                <TableCell>
                  <span className="text-xs text-primary/80">
                    {task.heartbeatAgeSeconds != null
                      ? t('table.ago', {
                          duration: formatDuration(task.heartbeatAgeSeconds),
                        })
                      : '—'}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-xs text-primary/80">
                    {task.idleSeconds != null
                      ? formatDuration(task.idleSeconds)
                      : '—'}
                  </span>
                </TableCell>
                <TableCell>
                  {task.createdAt && task.ageSeconds != null ? (
                    <div className="flex flex-col">
                      <span className="text-xs text-primary/80">
                        {t('table.ago', {
                          duration: formatDuration(task.ageSeconds),
                        })}
                      </span>
                      <span className="text-[0.65rem] text-muted-foreground">
                        {dayjs(task.createdAt).format('YYYY/MM/DD HH:mm')}
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-primary/40">—</span>
                  )}
                </TableCell>
                <TableCell className="px-4">
                  <TaskActions task={task} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

/** The three cleanup verdicts and what puts a task in each. */
function CleanupLegend() {
  const t = useDevetekTranslations('page.adminTasks.cleanup');

  return (
    <section className="rounded-2xl border bg-card p-4">
      <h3 className="mb-3 text-sm font-bold">{t('legendTitle')}</h3>
      <div className="grid gap-3 md:grid-cols-3">
        {LEGEND.map((verdict) => (
          <div key={verdict} className="flex flex-col items-start gap-1.5">
            <StatusPill
              tone={CLEANUP_TONES[verdict]}
              label={t(`verdict.${verdict}`)}
            />
            <p className="text-xs leading-relaxed text-muted-foreground">
              {t(`verdictHint.${verdict}`)}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Mono(props: { value: string | null }) {
  const { value } = props;

  if (!value) return <span className="text-xs text-primary/40">—</span>;

  return (
    <span
      className="block truncate font-mono text-xs text-primary/80"
      title={value}
    >
      {value}
    </span>
  );
}
