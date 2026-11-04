import { useDevetekTranslations } from '@/services/i18n';

import { StatusPill } from '@/shared/presentation/molecules/StatusPill';
import { CLUSTER_STATUSES } from '@/shared/rules/cluster';

import { clusterStatusTone } from '../shared/lib/cluster';

/** A cluster's status as a colored pill; it pulses while it changes. */
export function ClusterStatusPill(props: {
  status?: string;
  size?: 'sm' | 'md';
}) {
  const t = useDevetekTranslations('page.serverGroups.clusterStatus');
  const { pulse, tone } = clusterStatusTone(props.status);
  const known = (CLUSTER_STATUSES as readonly string[]).includes(
    props.status ?? '',
  );

  return (
    <StatusPill
      tone={tone}
      pulse={pulse}
      size={props.size}
      label={
        known
          ? t(props.status as (typeof CLUSTER_STATUSES)[number])
          : props.status || t('unknown')
      }
    />
  );
}
