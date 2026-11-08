import { useEffect, useState } from 'react';

import {
  CheckCircle2Icon,
  ChevronRightIcon,
  CircleDashedIcon,
  CircleMinusIcon,
  LoaderCircleIcon,
  XCircleIcon,
} from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

import { ApiApplication } from '@/shared/api';
import type {
  BuildProgressStatusV1,
  BuildStageV1,
} from '@/shared/api/-dtos/application';
import { cn } from '@/shared/libs/tailwind/cn';
import { DataPanelState } from '@/shared/presentation/organisms/DataPanel';
import { FailedState } from '@/widgets/failed-state';

import {
  BUILD_PROGRESS_POLL_MS,
  buildStepNumber,
  elapsedMs,
  focusStage,
  formatBuildDuration,
  isBuildActive,
  ranSteps,
  runElapsedMs,
} from '../../lib/describe-progress';
import type { ArtifactLogsModalProps } from '../../rules/types';

/** Where a build is, stage by stage, refreshed while it runs. */
export default function BuildSteps(props: ArtifactLogsModalProps) {
  const { applicationId, artifactId, serverId } = props;
  const t = useDevetekTranslations(
    'page.applicationDetail.releases.buildProgress',
  );

  const [response, refresh] = ApiApplication.BuildProgress.$Id.useGet({
    applicationId,
    artifactId,
    machineId: serverId,
  });
  const progress =
    response.$status === 'success'
      ? response
      : response.$status === 'loading'
        ? response.prevData
        : undefined;
  const active = isBuildActive(progress);

  useEffect(() => {
    if (!active) return;
    const timer = window.setInterval(refresh, BUILD_PROGRESS_POLL_MS);
    return () => window.clearInterval(timer);
  }, [active, refresh]);

  const nowMs = useTickingNow(active);
  // A stage opens by itself when it needs attention, until the reader decides.
  const [toggled, setToggled] = useState<Record<string, boolean>>({});

  if (response.$status === 'failed') {
    return <FailedState.BannerRetryable onClickRetry={refresh} />;
  }
  if (!progress) {
    return <DataPanelState state="loading" title={t('loading')} />;
  }
  if (progress.stages.length === 0) {
    return (
      <section className="rounded-2xl border bg-card">
        <DataPanelState
          state={progress.status === 'waiting' ? 'loading' : 'empty'}
          title={progress.status === 'waiting' ? t('waiting') : t('none')}
        />
      </section>
    );
  }

  const stageTitle = (stage: BuildStageV1) =>
    stage.kind === 'build_step'
      ? stage.name || t('buildStep', { number: buildStepNumber(stage) })
      : t(`stages.${stage.kind}`);

  const focus = focusStage(progress);
  const duration = formatBuildDuration(runElapsedMs(progress.stages, nowMs));
  // Between two steps a running build has no stage in progress.
  const summary =
    progress.status === 'running'
      ? focus
        ? t('summaryRunning', { stage: stageTitle(focus) })
        : t('summary.running')
      : progress.status === 'failed'
        ? focus
          ? t('summaryFailed', { stage: stageTitle(focus) })
          : t('summary.failed')
        : t('summary.done');
  // A stage where every task was skipped did nothing worth a row.
  const stages = progress.stages.filter((stage) => stage.status !== 'skipped');

  return (
    <section className="overflow-hidden rounded-2xl border bg-card">
      <div className="flex items-center gap-2 border-b p-3 text-sm">
        <StatusIcon status={progress.status} />
        <span className="font-semibold">{summary}</span>
        <span className="ml-auto font-mono text-xs tabular-nums text-muted-foreground">
          {duration}
        </span>
      </div>

      <ol className="max-h-[65vh] overflow-auto overscroll-contain">
        {stages.map((stage) => {
          const ran = ranSteps(stage);
          const skipped = stage.steps.length - ran.length;
          const expanded =
            toggled[stage.key] ??
            (stage.status === 'running' || stage.status === 'failed');

          return (
            <li key={stage.key} className="border-b last:border-b-0">
              <button
                type="button"
                aria-expanded={expanded}
                onClick={() =>
                  setToggled((current) => ({
                    ...current,
                    [stage.key]: !expanded,
                  }))
                }
                className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-sky-500/5 focus-visible:bg-sky-500/10 focus-visible:outline-none"
              >
                <ChevronRightIcon
                  aria-hidden
                  className={cn(
                    'size-4 shrink-0 text-muted-foreground transition-transform',
                    expanded && 'rotate-90',
                  )}
                />
                <StatusIcon status={stage.status} />
                <span
                  className={cn(
                    'min-w-0 flex-1 truncate text-sm font-medium',
                    stage.status === 'skipped' && 'text-muted-foreground',
                  )}
                  title={stageTitle(stage)}
                >
                  {stageTitle(stage)}
                </span>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {t('stepCount', { count: ran.length })}
                </span>
                <span className="w-16 shrink-0 text-right font-mono text-xs tabular-nums text-muted-foreground">
                  {formatBuildDuration(elapsedMs(stage, nowMs))}
                </span>
              </button>

              {expanded && (
                <ul className="border-t bg-background/40 py-1">
                  {ran.map((step, index) => (
                    <li
                      key={`${index}:${step.name}`}
                      className="flex items-center gap-3 py-1.5 pl-11 pr-4"
                    >
                      <StatusIcon status={step.status} size="sm" />
                      <span
                        className={cn(
                          'min-w-0 flex-1 truncate font-mono text-xs',
                          step.status === 'failed' &&
                            'text-red-600 dark:text-red-300',
                        )}
                        title={step.name}
                      >
                        {step.name}
                      </span>
                      <span className="w-16 shrink-0 text-right font-mono text-xs tabular-nums text-muted-foreground">
                        {formatBuildDuration(elapsedMs(step, nowMs))}
                      </span>
                    </li>
                  ))}
                  {skipped > 0 && (
                    <li className="py-1.5 pl-11 pr-4 text-xs text-muted-foreground">
                      {t('skippedCount', { count: skipped })}
                    </li>
                  )}
                  {stage.status === 'running' &&
                    stage.kind === 'build_step' && (
                      <li className="py-1.5 pl-11 pr-4 text-xs text-muted-foreground">
                        {t('outputAfterStep')}
                      </li>
                    )}
                </ul>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}

function StatusIcon(props: {
  status: BuildProgressStatusV1;
  size?: 'sm' | 'md';
}) {
  const { size = 'md', status } = props;
  const className = size === 'sm' ? 'size-3.5 shrink-0' : 'size-4 shrink-0';

  switch (status) {
    case 'succeeded':
      return (
        <CheckCircle2Icon
          aria-hidden
          className={cn(className, 'text-emerald-500')}
        />
      );
    case 'failed':
      return (
        <XCircleIcon aria-hidden className={cn(className, 'text-red-500')} />
      );
    case 'running':
      return (
        <LoaderCircleIcon
          aria-hidden
          className={cn(className, 'animate-spin text-sky-500')}
        />
      );
    case 'skipped':
      return (
        <CircleMinusIcon
          aria-hidden
          className={cn(className, 'text-muted-foreground')}
        />
      );
    default:
      return (
        <CircleDashedIcon
          aria-hidden
          className={cn(className, 'text-muted-foreground')}
        />
      );
  }
}

/** The current time, ticking each second while a build is under way. */
function useTickingNow(ticking: boolean) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!ticking) return;
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [ticking]);

  return now;
}
