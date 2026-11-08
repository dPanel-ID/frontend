import type {
  BuildProgressV1,
  BuildStageV1,
  BuildStepV1,
} from '@/shared/api/-dtos/application';

/** How often the steps refresh while a build is under way. */
export const BUILD_PROGRESS_POLL_MS = 5_000;

/** Whether the build can still change, so the view should keep polling. */
export function isBuildActive(progress: BuildProgressV1 | undefined) {
  return progress?.status === 'running' || progress?.status === 'waiting';
}

/** "45s", "1m 20s", "1h 5m". */
export function formatBuildDuration(ms: number) {
  const seconds = Math.max(0, Math.round(ms / 1000));
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ${seconds % 60}s`;
  return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
}

/** Time spent so far, up to `nowMs` for what has not finished. */
export function elapsedMs(
  item: Pick<BuildStepV1, 'started_at' | 'finished_at'>,
  nowMs: number,
) {
  const start = Date.parse(item.started_at);
  const end = item.finished_at ? Date.parse(item.finished_at) : nowMs;
  return Number.isNaN(start) || Number.isNaN(end) ? 0 : end - start;
}

/** The whole run so far: first stage's start to the last stage's end. */
export function runElapsedMs(stages: BuildStageV1[], nowMs: number) {
  const first = stages[0];
  const last = stages[stages.length - 1];
  if (!first || !last) return 0;
  return elapsedMs(
    { started_at: first.started_at, finished_at: last.finished_at },
    nowMs,
  );
}

/** The build step's number, from a stage key such as "build_step_2". */
export function buildStepNumber(stage: Pick<BuildStageV1, 'key'>) {
  return Number(stage.key.replace('build_step_', '')) || 1;
}

/** The stage a reader should look at: the one running, or the one that failed. */
export function focusStage(progress: BuildProgressV1) {
  return (
    progress.stages.find((stage) => stage.status === 'failed') ??
    progress.stages.find((stage) => stage.status === 'running')
  );
}

/** Steps that did something; Ansible skips many on any given build. */
export function ranSteps(stage: BuildStageV1) {
  return stage.steps.filter((step) => step.status !== 'skipped');
}
