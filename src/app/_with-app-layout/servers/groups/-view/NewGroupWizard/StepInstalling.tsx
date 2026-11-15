import { useState } from 'react';

import {
  CircleAlertIcon,
  CircleCheckIcon,
  LoaderCircleIcon,
} from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

import {
  clusterEngineLabel,
  isClusterTransitioning,
} from '@/features/server-groups/shared/lib/cluster';
import { ClusterExecution } from '@/features/server-groups/view/ClusterExecution';
import { ClusterStatusPill } from '@/features/server-groups/view/ClusterStatusPill';

import { ApiCluster } from '@/shared/api';

import { SummaryList } from './SummaryList';
import type { CreatedCluster } from './use-new-group-wizard';

const POLL_MS = 3000;

/** A just-created cluster is pending until the install execution starts. */
function isStillChanging(status: string) {
  return isClusterTransitioning(status) || status === 'pending';
}

/** Step 4: the created cluster, polled while it installs. */
export function StepInstalling(props: { created: CreatedCluster }) {
  const { created } = props;
  const t = useDevetekTranslations('page.serverGroups.wizard.install');
  const tCluster = useDevetekTranslations('page.serverGroups.cluster');

  // The last status seen drives polling: on while it can still change.
  const [seenStatus, setSeenStatus] = useState(created.cluster.status);
  const keepPolling = isStillChanging(seenStatus);
  const [response] = ApiCluster.Detail.$Id.useGet({
    id: created.cluster.id,
    options: { refreshIntervalMs: keepPolling ? POLL_MS : 0 },
  });

  const latest =
    response.$status === 'success'
      ? response
      : response.$status === 'loading' && response.prevData
        ? response.prevData
        : created.cluster;
  const status = latest.status;
  const polling = isStillChanging(status);

  // Remember the latest status during render; the next render then polls
  // (or stops polling) according to it.
  if (seenStatus !== status) {
    setSeenStatus(status);
  }

  return (
    <div className="grid gap-4">
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-sky-400/30 bg-sky-500/10 text-sky-600 dark:text-sky-300">
          {status === 'ready' ? (
            <CircleCheckIcon className="size-5" />
          ) : status === 'failed' ? (
            <CircleAlertIcon className="size-5 text-red-600 dark:text-red-300" />
          ) : (
            <LoaderCircleIcon className="size-5 animate-spin" />
          )}
        </span>
        <div className="min-w-0">
          <p className="font-semibold text-primary">
            {t('heading', { name: latest.name || created.cluster.name })}
          </p>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {status === 'ready'
              ? t('done')
              : status === 'failed'
                ? t('failed')
                : t('queued')}
          </p>
        </div>
      </div>

      <SummaryList
        rows={[
          {
            label: tCluster('status'),
            value: <ClusterStatusPill status={status} />,
          },
          {
            label: tCluster('engine'),
            value: [clusterEngineLabel(latest.engine), latest.version]
              .filter(Boolean)
              .join(' '),
          },
          {
            label: tCluster('lastExecution'),
            value: <ClusterExecution execution={latest.last_execution} />,
          },
        ]}
      />

      {polling && (
        <p className="text-xs text-muted-foreground" aria-live="polite">
          {t('polling')}
        </p>
      )}

      {created.warnings.length > 0 && (
        <section className="grid gap-1.5">
          <h3 className="text-sm font-semibold text-primary">
            {t('warnings')}
          </h3>
          <ul className="grid gap-1.5">
            {created.warnings.map((warning) => (
              <li
                key={warning}
                className="rounded-lg border border-amber-400/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-700 dark:text-amber-300"
              >
                {warning}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
