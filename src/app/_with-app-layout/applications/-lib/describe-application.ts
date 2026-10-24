import type { ApplicationCard } from '@/entities/application/rules/schema';

import type { StatusTone } from '@/shared/presentation/molecules/StatusPill';

/** Which of the overview's buckets an application belongs to. */
export type AppBucket = 'running' | 'building' | 'attention' | 'other';

/**
 * An application carries two states: the last build and the running
 * service. What people want to know first is whether it is serving, so the
 * service wins, and a failed build only counts when nothing is running.
 *
 * `/v1/application/find` returns neither today — `deploys[].service` and
 * `artifacts[].installer_status` are both absent, so every application
 * read as "Not running" however healthy it was. What the response does
 * carry is how each release installed, which is the fallback below.
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

  return deploymentBucket(application);
}

/**
 * How the releases installed, for when nothing better is known. Anything
 * still moving outranks a finished one, and a failure only shows when
 * nothing else is installed.
 */
function deploymentBucket(application: ApplicationCard): AppBucket {
  const statuses = application.additionalInfo.servers
    .map((server) => server.deployStatus)
    .filter((status): status is string => Boolean(status));

  if (statuses.length === 0) return 'other';

  if (statuses.some((one) => one === 'progress' || one === 'pending')) {
    return 'building';
  }

  if (statuses.some((one) => one === 'ready')) return 'running';
  if (statuses.some((one) => one === 'failed')) return 'attention';

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
