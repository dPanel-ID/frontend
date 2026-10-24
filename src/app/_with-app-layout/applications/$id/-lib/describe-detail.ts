import type { CicdArtifact } from '@/entities/cicd-artifact/rules/schema';
import type { CicdDeployment } from '@/entities/cicd-deployment/rules/schema';

import type { StatusTone } from '@/shared/presentation/molecules/StatusPill';

/**
 * How this page talks about the two halves of the story. A build turns a
 * commit into something installable; a release puts one build onto one
 * server. The user-facing words are "build" and "release" — "artifact" and
 * "deployment" stay in the code and in the API.
 */
export type ReleaseStatus =
  | 'pending'
  | 'progress'
  | 'deployed'
  | 'failed'
  | 'cancelled'
  | 'inactive';

interface ReleaseStatusParams {
  artifact: CicdArtifact;
  lastDeployment?: CicdDeployment | null;
}

/**
 * The state to show against a build: the state of the release that used it
 * when there is one, and otherwise the build's own state. A build that is
 * still running outranks a release that already finished, because the
 * release is about to be replaced.
 */
export function releaseStatusOfArtifact(
  params: ReleaseStatusParams,
): ReleaseStatus {
  const { artifact, lastDeployment } = params;

  if (lastDeployment?.pointerIds.artifact === artifact.id) {
    if (artifact.state.status === 'progress') return 'progress';

    switch (lastDeployment.state.status) {
      case 'ready':
        return 'deployed';
      case 'failed':
        return 'failed';
      case 'progress':
        return 'progress';
      case 'cancelled':
        return 'cancelled';
      default:
        return 'inactive';
    }
  }

  switch (artifact.state.status) {
    case 'progress':
      return 'progress';
    case 'failed':
      return 'failed';
    case 'cancelled':
      return 'cancelled';
    default:
      return 'inactive';
  }
}

/** Colour family for a release state. */
export function releaseTone(status: ReleaseStatus): StatusTone {
  switch (status) {
    case 'deployed':
      return 'success';
    case 'progress':
    case 'pending':
      return 'info';
    case 'failed':
      return 'danger';
    case 'cancelled':
      return 'warning';
    default:
      return 'neutral';
  }
}

/** Colour family for a build state. */
export function buildTone(status: CicdArtifact['state']['status']): StatusTone {
  switch (status) {
    case 'ready':
      return 'success';
    case 'progress':
      return 'info';
    case 'failed':
      return 'danger';
    case 'cancelled':
    case 'deleting':
      return 'warning';
    default:
      return 'neutral';
  }
}

/** Colour family for a deployment state. */
export function deploymentTone(
  status: CicdDeployment['state']['status'],
): StatusTone {
  switch (status) {
    case 'ready':
      return 'success';
    case 'progress':
    case 'pending':
      return 'info';
    case 'failed':
      return 'danger';
    case 'cancelled':
    case 'deleting':
    case 'deleted':
      return 'warning';
    default:
      return 'neutral';
  }
}

/** True while the state is still changing, so the pill's dot pulses. */
export function isMovingStatus(status: string) {
  return status === 'progress' || status === 'pending' || status === 'deleting';
}

/**
 * What the page says about the application as a whole, in one word. The
 * running release wins, because that is what visitors are hitting; a failed
 * build only becomes the headline when nothing is serving.
 */
export type HeadlineState = 'live' | 'building' | 'attention' | 'idle';

interface HeadlineParams {
  lastBuild?: CicdArtifact;
  deployments: CicdDeployment[];
}

export function headlineState(params: HeadlineParams): HeadlineState {
  const { lastBuild, deployments } = params;

  const live = deployments.filter((one) => one.state.status === 'ready');
  const moving =
    lastBuild?.state.status === 'progress' ||
    deployments.some((one) => isMovingStatus(one.state.status));

  if (moving) return 'building';
  if (live.length > 0) return 'live';

  if (
    lastBuild?.state.status === 'failed' ||
    deployments.some((one) => one.state.status === 'failed')
  ) {
    return 'attention';
  }

  return 'idle';
}

export function headlineTone(state: HeadlineState): StatusTone {
  switch (state) {
    case 'live':
      return 'success';
    case 'building':
      return 'info';
    case 'attention':
      return 'danger';
    default:
      return 'neutral';
  }
}

/** How many servers are currently serving a ready release. */
export function liveServerCount(deployments: CicdDeployment[]) {
  const ids = new Set(
    deployments
      .filter((one) => one.state.status === 'ready')
      .map((one) => one.serverSnapshot.id),
  );

  return ids.size;
}
