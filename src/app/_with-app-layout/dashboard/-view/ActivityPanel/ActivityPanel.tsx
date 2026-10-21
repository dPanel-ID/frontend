import { useMemo } from 'react';

import {
  AlertTriangleIcon,
  CheckCircle2Icon,
  CircleDashedIcon,
  RefreshCwIcon,
  XCircleIcon,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { Locale } from 'use-intl';

import { useDevetekLocale, useDevetekTranslations } from '@/services/i18n';

import { ServerManagementState } from '@/features/server-management-sidepanel-ui';

import { ApiExecution } from '@/shared/api';
import {
  getDistanceFromNow,
  humanizeSeconds,
} from '@/shared/libs/browser/date';
import { cn } from '@/shared/libs/tailwind/cn';

import { sortActivityItems, toActivityItem } from '../../-lib/activity';
import type { ActivityItem, ExecutionLifecycle } from '../../-lib/activity';
import { toneClass } from '../../-lib/tone';
import type { Tone } from '../../-lib/tone';
import { DashboardSection } from '../../-presentation';

/** How far back the feed looks. */
const ACTIVITY_WINDOW = '48h';
const ACTIVITY_LIMIT = 12;

export interface ActivityPanelProps {
  /** Shown when the workspace has no servers at all, which explains an empty feed. */
  hasServers: boolean;
}

/**
 * What changed recently, read from durable execution records rather than
 * from server logs: every row is one platform operation with its outcome,
 * who ran it and how long it took.
 */
export default function ActivityPanel(props: ActivityPanelProps) {
  const { hasServers } = props;
  const t = useDevetekTranslations('page.dashboard.activity');

  const [response, refresh] = ApiExecution.Find.useGet({
    since: ACTIVITY_WINDOW,
    limit: ACTIVITY_LIMIT,
  });

  const items = useMemo(() => {
    if (response.$status !== 'success') return [];
    // The api-client glues $status onto the payload, so copy the rows out
    // before mapping them.
    return sortActivityItems(Array.from(response).map(toActivityItem));
  }, [response]);

  const isLoading =
    response.$status === 'initial' || response.$status === 'loading';
  const hasFailed = response.$status === 'failed';

  return (
    <DashboardSection
      title={t('title')}
      description={t('description')}
      action={
        <button
          type="button"
          className="inline-flex h-9 items-center gap-2 rounded-lg border bg-background px-3 text-xs font-semibold text-primary transition hover:border-primary/40 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
          disabled={isLoading}
          onClick={() => refresh()}
          title={t('refresh')}
          aria-label={t('refreshAria')}
        >
          <RefreshCwIcon
            className={cn('size-3.5', isLoading && 'animate-spin')}
          />
          {t('refresh')}
        </button>
      }
    >
      <ActivityBody
        items={items}
        isLoading={isLoading}
        hasFailed={hasFailed}
        hasServers={hasServers}
        onRetry={() => refresh()}
      />
    </DashboardSection>
  );
}

function ActivityBody(props: {
  items: ActivityItem[];
  isLoading: boolean;
  hasFailed: boolean;
  hasServers: boolean;
  onRetry: () => void;
}) {
  const { hasFailed, hasServers, isLoading, items, onRetry } = props;
  const t = useDevetekTranslations('page.dashboard.activity');

  if (hasFailed) {
    return (
      <ServerManagementState
        state="failed"
        title={t('failedTitle')}
        description={t('failedDescription')}
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
    );
  }

  if (isLoading && !items.length) {
    return <ServerManagementState state="loading" title={t('loadingTitle')} />;
  }

  if (!items.length) {
    return (
      <ServerManagementState
        title={hasServers ? t('emptyTitle') : t('emptyNoServersTitle')}
        description={
          hasServers ? t('emptyDescription') : t('emptyNoServersDescription')
        }
      />
    );
  }

  return (
    <ol className="grid gap-2">
      {items.map((item) => (
        <li key={item.id}>
          <ActivityRow item={item} />
        </li>
      ))}
    </ol>
  );
}

function ActivityRow(props: { item: ActivityItem }) {
  const { item } = props;
  const t = useDevetekTranslations('page.dashboard.activity');
  const tStatus = useDevetekTranslations('page.dashboard.lifecycle');
  const tType = useDevetekTranslations('page.dashboard.activityType');
  const locale = useDevetekLocale();

  const { icon: Icon, tone } = lifecyclePresentation(item.lifecycle);
  const typeLabel = item.typeKey
    ? tType(item.typeKey)
    : item.typeFallback || t('unknownActivity');

  // "Set up web-01" reads as a sentence; without a resolvable machine the
  // activity label stands alone rather than naming an opaque ID.
  const headline = item.target
    ? t('headline', { activity: typeLabel, target: item.target })
    : typeLabel;

  return (
    <article className="rounded-lg border bg-background p-3">
      <div className="flex min-w-0 items-start gap-3">
        <span
          aria-hidden
          className={cn(
            'mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-md border',
            toneClass(tone),
          )}
        >
          <Icon className={cn('size-4', item.inFlight && 'animate-spin')} />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <h3 className="min-w-0 truncate text-sm font-bold text-primary">
              {headline}
            </h3>
            <span
              className={cn(
                'shrink-0 rounded-full border px-2 py-0.5 text-xs font-semibold',
                toneClass(tone),
              )}
            >
              {tStatus(item.lifecycle)}
            </span>
          </div>

          <p className="mt-1 text-xs text-muted-foreground">
            {activityMeta(item, t, locale)}
          </p>

          {item.failureSummary && (
            <p className="mt-2 rounded-md border border-destructive/25 bg-destructive/5 px-2 py-1.5 text-xs text-destructive">
              {item.failureSummary}
            </p>
          )}

          <details className="mt-2">
            <summary className="cursor-pointer text-xs font-semibold text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35">
              {t('technicalDetails')}
            </summary>
            <dl className="mt-2 grid gap-1 rounded-md border bg-card px-3 py-2 text-xs">
              <TechnicalRow label={t('field.type')} value={item.rawType} />
              <TechnicalRow label={t('field.status')} value={item.rawStatus} />
              <TechnicalRow label={t('field.module')} value={item.module} />
              <TechnicalRow
                label={t('field.machineId')}
                value={item.machineId}
              />
              <TechnicalRow label={t('field.traceId')} value={item.traceId} />
              <TechnicalRow label={t('field.executionId')} value={item.id} />
            </dl>
          </details>
        </div>
      </div>
    </article>
  );
}

function TechnicalRow(props: { label: string; value?: string }) {
  const { label, value } = props;
  if (!String(value ?? '').trim()) return null;

  return (
    <div className="flex min-w-0 items-baseline gap-2">
      <dt className="shrink-0 font-medium text-muted-foreground">{label}</dt>
      <dd className="min-w-0 truncate font-mono text-primary">{value}</dd>
    </div>
  );
}

/** The secondary line: who, when and how long. */
function activityMeta(
  item: ActivityItem,
  t: ReturnType<typeof useDevetekTranslations>,
  locale: Locale,
) {
  const parts: string[] = [];

  if (item.actor) parts.push(t('byActor', { actor: item.actor }));

  // getDistanceFromNow strict-parses strings in a legacy format, so hand it a
  // Date: execution timestamps are RFC3339 and would not survive that parse.
  const occurredAt = item.timestamp ? new Date(item.timestamp) : undefined;
  if (occurredAt && !Number.isNaN(occurredAt.getTime())) {
    parts.push(getDistanceFromNow(occurredAt, locale));
  }

  if (item.durationMs != null) {
    parts.push(
      t('took', {
        duration: humanizeSeconds(Math.round(item.durationMs / 1000)),
      }),
    );
  }
  if (item.warningCount > 0) {
    parts.push(t('warnings', { count: item.warningCount }));
  }

  return parts.length ? parts.join(' · ') : t('noMetadata');
}

function lifecyclePresentation(lifecycle: ExecutionLifecycle): {
  icon: LucideIcon;
  tone: Tone;
} {
  switch (lifecycle) {
    case 'succeeded':
      return { icon: CheckCircle2Icon, tone: 'green' };
    case 'failed':
      return { icon: XCircleIcon, tone: 'red' };
    case 'cancelled':
      return { icon: AlertTriangleIcon, tone: 'amber' };
    case 'running':
      return { icon: RefreshCwIcon, tone: 'blue' };
    case 'pending':
    case 'queued':
      return { icon: CircleDashedIcon, tone: 'blue' };
    default:
      return { icon: CircleDashedIcon, tone: 'slate' };
  }
}
