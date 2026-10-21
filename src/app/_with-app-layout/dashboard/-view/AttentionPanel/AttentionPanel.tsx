import { useMemo } from 'react';

import { Link } from '@tanstack/react-router';
import {
  AlertTriangleIcon,
  CheckCircle2Icon,
  RefreshCwIcon,
  ServerIcon,
  WifiOffIcon,
  XCircleIcon,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

import { ServerManagementState } from '@/features/server-management-sidepanel-ui';

import type { DTOs } from '@/shared/api';
import { cn } from '@/shared/libs/tailwind/cn';

import type { ActivityItem } from '../../-lib/activity';
import { toneClass } from '../../-lib/tone';
import type { Tone } from '../../-lib/tone';
import { DashboardSection } from '../../-presentation';

export interface AttentionPanelProps {
  /** Used to name the machine behind an agent or execution ID. */
  servers: DTOs.MachineV1[];
  failures: ActivityItem[];
  unreachableAgents: DTOs.AgentV2[];
  unhealthyServers: DTOs.MachineV1[];
  isLoading: boolean;
  hasFailed: boolean;
  isUnauthorized: boolean;
  onRetry: () => void;
}

/**
 * The one panel that answers "is anything wrong?". It stays quiet and green
 * when nothing needs doing, so a non-empty panel always means real work.
 */
export default function AttentionPanel(props: AttentionPanelProps) {
  const {
    failures,
    hasFailed,
    isLoading,
    isUnauthorized,
    onRetry,
    servers,
    unhealthyServers,
    unreachableAgents,
  } = props;
  const t = useDevetekTranslations('page.dashboard.attention');

  const hostnameByMachineId = useMemo(() => {
    const names = new Map<string, string>();
    for (const server of servers) {
      if (server.id == null) continue;
      names.set(String(server.id), server.hostname || String(server.id));
    }
    return names;
  }, [servers]);

  const itemCount =
    failures.length + unreachableAgents.length + unhealthyServers.length;

  if (isUnauthorized) {
    return (
      <DashboardSection title={t('title')} description={t('failedDescription')}>
        <ServerManagementState
          state="failed"
          title={t('unauthorizedTitle')}
          description={t('unauthorizedDescription')}
        />
      </DashboardSection>
    );
  }

  if (hasFailed) {
    return (
      <DashboardSection title={t('title')} description={t('failedDescription')}>
        <ServerManagementState
          state="failed"
          title={t('failedTitle')}
          description={t('failedDetail')}
          action={
            <button
              type="button"
              onClick={onRetry}
              className="inline-flex h-9 items-center gap-2 rounded-lg border bg-background px-3 text-xs font-semibold text-primary transition hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
            >
              <RefreshCwIcon className="size-3.5" />
              {t('retry')}
            </button>
          }
        />
      </DashboardSection>
    );
  }

  if (isLoading) {
    return (
      <DashboardSection
        title={t('title')}
        description={t('checkingDescription')}
      >
        <ServerManagementState state="loading" title={t('checkingTitle')} />
      </DashboardSection>
    );
  }

  if (!itemCount) {
    return (
      <DashboardSection
        title={t('title')}
        description={t('healthyDescription')}
      >
        <div
          className={cn(
            'flex items-center gap-3 rounded-lg border px-3 py-3',
            toneClass('green'),
          )}
        >
          <CheckCircle2Icon className="size-5 shrink-0" aria-hidden />
          <p className="min-w-0 text-sm font-semibold">{t('healthy')}</p>
        </div>
      </DashboardSection>
    );
  }

  return (
    <DashboardSection
      title={t('title')}
      description={t('description', { count: itemCount })}
    >
      <ul className="grid gap-2">
        {unhealthyServers.map((server) => (
          <li key={`server-${server.id ?? server.hostname}`}>
            <AttentionRow
              icon={ServerIcon}
              tone="red"
              title={t('serverUnhealthy', {
                server: server.hostname || t('unknownServer'),
              })}
              detail={t('serverUnhealthyDetail', {
                status: server.status || t('unknownStatus'),
              })}
              actionLabel={t('openServer')}
              to={server.id ? '/servers/$id' : undefined}
              params={server.id ? { id: String(server.id) } : undefined}
            />
          </li>
        ))}

        {unreachableAgents.map((agent) => (
          <li key={`agent-${agent.machine_id ?? agent.id}`}>
            <AttentionRow
              icon={WifiOffIcon}
              tone="amber"
              title={t('agentUnreachable', {
                server:
                  (agent.machine_id &&
                    hostnameByMachineId.get(agent.machine_id)) ||
                  t('unknownServer'),
              })}
              detail={t('agentUnreachableDetail')}
              actionLabel={t('openServer')}
              to={agent.machine_id ? '/servers/$id' : undefined}
              params={agent.machine_id ? { id: agent.machine_id } : undefined}
            />
          </li>
        ))}

        {failures.map((item) => (
          <li key={`execution-${item.id}`}>
            <FailureRow item={item} />
          </li>
        ))}
      </ul>
    </DashboardSection>
  );
}

function FailureRow(props: { item: ActivityItem }) {
  const { item } = props;
  const t = useDevetekTranslations('page.dashboard.attention');
  const tType = useDevetekTranslations('page.dashboard.activityType');

  const typeLabel = item.typeKey
    ? tType(item.typeKey)
    : item.typeFallback || t('unknownActivity');

  return (
    <AttentionRow
      icon={item.lifecycle === 'cancelled' ? AlertTriangleIcon : XCircleIcon}
      tone={item.lifecycle === 'cancelled' ? 'amber' : 'red'}
      title={
        item.target
          ? t('executionFailed', { activity: typeLabel, target: item.target })
          : t('executionFailedNoTarget', { activity: typeLabel })
      }
      detail={item.failureSummary || t('noFailureDetail')}
      actionLabel={item.machineId ? t('openServer') : undefined}
      to={item.machineId ? '/servers/$id' : undefined}
      params={item.machineId ? { id: item.machineId } : undefined}
    />
  );
}

function AttentionRow(props: {
  icon: LucideIcon;
  tone: Tone;
  title: string;
  detail: string;
  actionLabel?: string;
  to?: string;
  params?: Record<string, string>;
}) {
  const { actionLabel, detail, icon: Icon, params, title, to, tone } = props;

  return (
    <div className="flex min-w-0 items-start gap-3 rounded-lg border bg-background px-3 py-2.5">
      <span
        aria-hidden
        className={cn(
          'mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-md border',
          toneClass(tone),
        )}
      >
        <Icon className="size-4" />
      </span>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-primary">{title}</p>
        <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
          {detail}
        </p>
      </div>

      {to && actionLabel && (
        <Link
          to={to}
          params={params}
          className="shrink-0 rounded-lg border bg-card px-2.5 py-1.5 text-xs font-semibold text-primary transition hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
          title={actionLabel}
          aria-label={actionLabel}
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
