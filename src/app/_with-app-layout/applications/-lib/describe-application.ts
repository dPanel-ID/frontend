import type { ApplicationCard } from '@/entities/application/rules/schema';

import type { StatusTone } from '@/shared/presentation/molecules/StatusPill';

/** Which of the overview's buckets an application belongs to. */
export type AppBucket = 'running' | 'building' | 'attention' | 'other';

/**
 * An application carries two states: the last build and the running
 * service. What people want to know first is whether it is serving, so the
 * service wins, and a failed build only counts when nothing is running.
 */
export function applicationBucket(application: ApplicationCard): AppBucket {
  const service = application.state.service;
  const build = application.state.lastArtifact.status;

  if (service === 'running') return 'running';
  if (['dead', 'failed', 'exited'].includes(service)) return 'attention';
  if (build === 'failed' || build === 'cancelled') return 'attention';
  if (
    build === 'progress' ||
    service === 'restarting' ||
    service === 'reloading'
  ) {
    return 'building';
  }

  return 'other';
}

/** Colour family for the application's headline state. */
export function applicationTone(application: ApplicationCard): StatusTone {
  switch (applicationBucket(application)) {
    case 'running':
      return 'success';

    case 'building':
      return 'info';

    case 'attention':
      return 'danger';

    default:
      return 'neutral';
  }
}

/** True while something is still moving, so the pill's dot pulses. */
export function isApplicationMoving(application: ApplicationCard) {
  return applicationBucket(application) === 'building';
}

/** i18n key naming the application's headline state. */
export function applicationStatusKey(application: ApplicationCard) {
  return `page.applications.status.${applicationBucket(application)}`;
}

/** "github.com/org/repo" or the bundle type, whichever the app has. */
export function applicationSource(application: ApplicationCard) {
  const { identity } = application;

  if (identity.source === 'repository') {
    return `${identity.repoOrganization}/${identity.repoName}`;
  }

  return identity.bundleType;
}
