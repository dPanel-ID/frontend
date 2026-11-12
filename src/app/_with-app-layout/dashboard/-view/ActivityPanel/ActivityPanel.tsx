import { useMemo, useState } from 'react';

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

import { UserLink } from '@/entities/user/ui/UserLink';

import { ServerManagementState } from '@/features/server-management-sidepanel-ui';

import { ApiExecution } from '@/shared/api';
import {
  getDistanceFromNow,
  humanizeSeconds,
} from '@/shared/libs/browser/date';
import { cn } from '@/shared/libs/tailwind/cn';

import {
  shortHostLabel,
  sortActivityItems,
  toActivityItem,
} from '../../-lib/activity';
import type { ActivityItem, ExecutionLifecycle } from '../../-lib/activity';
import { toneClass } from '../../-lib/tone';
import type { Tone } from '../../-lib/tone';
import { DashboardSection } from '../../-presentation';

/** How far back the feed looks. */
const ACTIVITY_WINDOW = '48h';
const ACTIVITY_LIMIT = 12;
/** Rows shown before "Show more", so the rail stays beside the charts. */
const COLLAPSED_COUNT = 5;

export interface ActivityPanelProps {
  /** Shown when the workspace has no servers at all, which explains an empty feed. */
  hasServers: boolean;
  /** The signed-in user's subject, so their own runs read "by you". */
  currentUserId?: string;
}

/**
 * What changed recently, read from durable execution records rather than
 * from server logs: every row is one platform operation with its outcome,
 * who ran it and how long it took.
 */
export default function ActivityPanel(props: ActivityPanelProps) {
  const { currentUserId, hasServers } = props;
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
        currentUserId={currentUserId}
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
  currentUserId?: string;
  onRetry: () => void;
}) {
  const { currentUserId, hasFailed, hasServers, isLoading, items, onRetry } =
    props;
  const t = useDevetekTranslations('page.dashboard.activity');
  const [expanded, setExpanded] = useState(false);

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

  // Grid items default to min-width:auto, so a row refuses to shrink below
  // its content and the whole list outgrows the card however much its text
  // truncates. min-w-0 on each item is what lets the truncation apply.
  const visibleItems = expanded ? items : items.slice(0, COLLAPSED_COUNT);
  const hiddenCount = items.length - visibleItems.length;

  return (
    <div className="grid gap-2">
      <ol className="grid gap-2">
        {visibleItems.map((item) => (
          <li key={item.id} className="min-w-0">
            <ActivityRow item={item} currentUserId={currentUserId} />
          </li>
        ))}
      </ol>
      {(hiddenCount > 0 || expanded) && items.length > COLLAPSED_COUNT && (
        <button
          type="button"
          aria-expanded={expanded}
          onClick={() => setExpanded((value) => !value)}
          className="h-8 rounded-lg border border-dashed text-xs font-semibold text-muted-foreground transition hover:border-primary/40 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
        >
          {expanded ? t('showLess') : t('showMore', { count: hiddenCount })}
        </button>
      )}
    </div>
  );
}

function ActivityRow(props: { item: ActivityItem; currentUserId?: string }) {
  const { currentUserId, item } = props;
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
  // Cloud host names run long ("web-01.asia-southeast2-a.c.acme.internal");
  // the first label names the server, and the whole name is on hover.
  const headline = item.target
    ? t('headline', {
        activity: typeLabel,
        target: shortHostLabel(item.target),
      })
    : typeLabel;
  const fullHeadline = item.target
    ? t('headline', { activity: typeLabel, target: item.target })
    : typeLabel;

  return (
    <article className="rounded-lg border bg-background px-3 py-2.5">
      <div className="flex min-w-0 items-start gap-2.5">
        <span
          aria-hidden
          className={cn(
            'mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md border',
            toneClass(tone),
          )}
        >
          <Icon className={cn('size-3.5', item.inFlight && 'animate-spin')} />
        </span>

        <div className="min-w-0 flex-1">
          {/*
            Not flex-wrap: a headline too long for the row wrapped onto a
            line of its own at full content width and ran past the card
            instead of truncating. It shrinks and ellipsises now, with the
            whole value on hover, and the status keeps its place.
          */}
          <div className="flex min-w-0 items-center gap-2">
            <h3
              className="min-w-0 flex-1 truncate text-sm font-bold text-primary"
              title={fullHeadline}
            >
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

          <p className="mt-0.5 flex min-w-0 items-center gap-1 text-xs text-muted-foreground">
            {showActorPerson(item, currentUserId) && item.actorPerson && (
              <>
                <span className="shrink-0">{t('byPerson')}</span>
                <UserLink {...item.actorPerson} className="shrink-0" />
                <span className="shrink-0">·</span>
              </>
            )}
            <span className="truncate">
              {activityMeta(item, t, locale, currentUserId)}
            </span>
          </p>

          {item.failureSummary && (
            <p
              className="mt-1.5 line-clamp-2 break-words rounded-md border border-destructive/25 bg-destructive/5 px-2 py-1 text-xs text-destructive"
              title={item.failureSummary}
            >
              {item.failureSummary}
            </p>
          )}

          <details className="mt-1">
            <summary className="cursor-pointer text-[11px] font-semibold text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35">
              {t('technicalDetails')}
            </summary>
            <dl className="mt-2 grid gap-1 rounded-md border bg-card px-3 py-2 text-xs">
              <TechnicalRow
                label={t('field.failedTask')}
                value={item.errorTask}
              />
              <TechnicalRow
                label={t('field.error')}
                value={item.errorOutput}
                wrap
              />
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

function TechnicalRow(props: {
  label: string;
  value?: string;
  /** Show the whole value on several lines instead of cutting it off. */
  wrap?: boolean;
}) {
  const { label, value, wrap } = props;
  if (!String(value ?? '').trim()) return null;

  return (
    <div className="flex min-w-0 items-baseline gap-2">
      <dt className="shrink-0 font-medium text-muted-foreground">{label}</dt>
      <dd
        className={cn(
          'min-w-0 font-mono text-primary',
          wrap
            ? 'max-h-40 overflow-y-auto whitespace-pre-wrap break-words'
            : 'truncate',
        )}
      >
        {value}
      </dd>
    </div>
  );
}

/** Whether to link the actor as a person rather than say "by you". */
function showActorPerson(item: ActivityItem, currentUserId?: string) {
  return Boolean(item.actorPerson) && item.actor !== currentUserId;
}

/** The secondary line: who, when and how long. */
function activityMeta(
  item: ActivityItem,
  t: ReturnType<typeof useDevetekTranslations>,
  locale: Locale,
  currentUserId?: string,
) {
  const parts: string[] = [];

  // The signed-in user's own runs read "by you"; anyone the API resolved is
  // linked beside this line instead. An unresolved numeric subject is left
  // out rather than shown as "by 7897268911411869309".
  if (item.actor && item.actor === currentUserId) {
    parts.push(t('byYou'));
  } else if (
    !showActorPerson(item, currentUserId) &&
    item.actor &&
    !/^\d+$/.test(item.actor)
  ) {
    parts.push(t('byActor', { actor: item.actor }));
  }

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
