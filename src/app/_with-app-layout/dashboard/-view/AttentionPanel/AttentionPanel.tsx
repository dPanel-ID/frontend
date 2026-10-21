import { useMemo } from 'react';

import { Link } from '@tanstack/react-router';
import {
  AlertTriangleIcon,
  CheckCircle2Icon,
  ServerIcon,
  WifiOffIcon,
  XCircleIcon,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

import { ApiAgent, ApiExecution } from '@/shared/api';
import type { DTOs } from '@/shared/api';
import { cn } from '@/shared/libs/tailwind/cn';

import {
  sortActivityItems,
  staleAgents,
  toActivityItem,
} from '../../-lib/activity';
import type { ActivityItem } from '../../-lib/activity';
import { toneClass } from '../../-lib/tone';
import type { Tone } from '../../-lib/tone';
import { DashboardSection } from '../../-presentation';

/** Failures older than this are history, not something to act on now. */
const ATTENTION_WINDOW = '24h';
const ATTENTION_LIMIT = 8;

export interface AttentionPanelProps {
  servers: DTOs.MachineV1[];
}

/**
 * The one panel that answers "is anything wrong?". It stays quiet and green
 * when nothing needs doing, so a non-empty panel always means real work.
 */
export default function AttentionPanel(props: AttentionPanelProps) {
  const { servers } = props;
  const t = useDevetekTranslations('page.dashboard.attention');

  const [failuresResponse] = ApiExecution.Find.useGet({
    status: ['failed', 'cancelled'],
    since: ATTENTION_WINDOW,
    limit: ATTENTION_LIMIT,
  });
  const [agentsResponse] = ApiAgent.Find.useGet({});

  const failures = useMemo(() => {
    if (failuresResponse.$status !== 'success') return [];
    return sortActivityItems(
      Array.from(failuresResponse).map(toActivityItem),
    ).slice(0, ATTENTION_LIMIT);
  }, [failuresResponse]);

  const unreachableAgents = useMemo(() => {
    if (agentsResponse.$status !== 'success') return [];
    return staleAgents(Array.from(agentsResponse));
  }, [agentsResponse]);

  const unhealthyServers = useMemo(
    () =>
      servers.filter((server) => {
        const status = String(server.status || '').toLowerCase();
        return status === 'failed' || status === 'cancelled';
      }),
    [servers],
  );

  const hostnameByMachineId = useMemo(() => {
    const names = new Map<string, string>();
    for (const server of servers) {
      if (server.id == null) continue;
      names.set(String(server.id), server.hostname || String(server.id));
    }
    return names;
  }, [servers]);

  const isLoading =
    failuresResponse.$status === 'initial' ||
    failuresResponse.$status === 'loading';
  const itemCount =
    failures.length + unreachableAgents.length + unhealthyServers.length;

  if (isLoading) {
    return (
      <DashboardSection
        title={t('title')}
        description={t('checkingDescription')}
      >
        <div className="h-16 animate-pulse rounded-lg border bg-background" />
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
