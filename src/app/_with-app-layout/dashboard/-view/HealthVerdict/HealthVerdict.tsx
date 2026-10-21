import type { ReactNode } from 'react';

import {
  AlertTriangleIcon,
  CheckCircle2Icon,
  HelpCircleIcon,
  RefreshCwIcon,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

import { ServerManagementState } from '@/features/server-management-sidepanel-ui';

import { cn } from '@/shared/libs/tailwind/cn';
import Shimmer from '@/shared/presentation/atoms/Shimmer';

import { toneClass } from '../../-lib/tone';
import type { Tone } from '../../-lib/tone';
import type { Verdict, VerdictLevel } from '../../-lib/verdict';

export interface HealthVerdictProps {
  verdict: Verdict;
  isLoading: boolean;
  hasFailed: boolean;
  isUnauthorized: boolean;
  onRetry: () => void;
}

/**
 * The first thing on the page: one plain sentence answering "is anything
 * wrong?". Everything below it explains that sentence.
 */
export default function HealthVerdict(props: HealthVerdictProps) {
  const { hasFailed, isLoading, isUnauthorized, onRetry, verdict } = props;
  const t = useDevetekTranslations('page.dashboard.verdict');

  if (isUnauthorized) {
    return (
      <VerdictFrame>
        <ServerManagementState
          state="failed"
          title={t('unauthorizedTitle')}
          description={t('unauthorizedDescription')}
        />
      </VerdictFrame>
    );
  }

  if (hasFailed) {
    return (
      <VerdictFrame>
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
      </VerdictFrame>
    );
  }

  if (isLoading) {
    return (
      <VerdictFrame>
        <div className="flex items-center gap-4">
          <Shimmer className="size-11 shrink-0 rounded-lg" />
          <div className="min-w-0 flex-1">
            <Shimmer className="h-6 w-64 max-w-full" />
            <Shimmer className="mt-2 h-4 w-80 max-w-full" />
          </div>
        </div>
        <p className="sr-only">{t('loading')}</p>
      </VerdictFrame>
    );
  }

  const { icon: Icon, tone } = verdictPresentation(verdict.level);

  return (
    <VerdictFrame>
      <div className="flex items-start gap-4">
        <span
          aria-hidden
          className={cn(
            'flex size-11 shrink-0 items-center justify-center rounded-lg border',
            toneClass(tone),
          )}
        >
          <Icon
            className={cn(
              'size-5',
              verdict.level === 'working' && 'animate-spin',
            )}
          />
        </span>

        <div className="min-w-0 flex-1">
          <p
            role="status"
            aria-live="polite"
            className="text-lg font-bold leading-snug text-primary sm:text-xl"
          >
            {verdictHeadline(verdict, t)}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {verdictDetail(verdict, t)}
          </p>
          {verdict.degraded && (
            <p className="mt-2 text-xs font-medium text-muted-foreground">
              {t('degraded')}
            </p>
          )}
        </div>
      </div>
    </VerdictFrame>
  );
}

function VerdictFrame(props: { children: ReactNode }) {
  const { children } = props;
  const t = useDevetekTranslations('page.dashboard.verdict');

  return (
    <section
      aria-label={t('ariaLabel')}
      className="rounded-2xl border bg-card p-4"
    >
      {children}
    </section>
  );
}

function verdictHeadline(
  verdict: Verdict,
  t: ReturnType<typeof useDevetekTranslations>,
) {
  switch (verdict.level) {
    case 'attention':
      return t('attention', { count: verdict.attentionCount });
    case 'working':
      return t('working', { count: verdict.inFlight });
    case 'healthy':
      return t('healthy');
    default:
      return t('unknown');
  }
}

/** The second line: what the headline is counting, in the same plain words. */
function verdictDetail(
  verdict: Verdict,
  t: ReturnType<typeof useDevetekTranslations>,
) {
  if (verdict.level === 'healthy') return t('healthyDetail');
  if (verdict.level === 'working') return t('workingDetail');
  if (verdict.level === 'unknown') return t('unknownDetail');

  const parts: string[] = [];
  if (verdict.unhealthyServers > 0) {
    parts.push(t('partServers', { count: verdict.unhealthyServers }));
  }
  if (verdict.failedExecutions > 0) {
    parts.push(t('partExecutions', { count: verdict.failedExecutions }));
  }
  if (verdict.unreachableAgents > 0) {
    parts.push(t('partAgents', { count: verdict.unreachableAgents }));
  }

  return parts.length ? parts.join(' · ') : t('attentionDetail');
}

function verdictPresentation(level: VerdictLevel): {
  icon: LucideIcon;
  tone: Tone;
} {
  switch (level) {
    case 'attention':
      return { icon: AlertTriangleIcon, tone: 'red' };
    case 'working':
      return { icon: RefreshCwIcon, tone: 'blue' };
    case 'healthy':
      return { icon: CheckCircle2Icon, tone: 'green' };
    default:
      return { icon: HelpCircleIcon, tone: 'slate' };
  }
}
