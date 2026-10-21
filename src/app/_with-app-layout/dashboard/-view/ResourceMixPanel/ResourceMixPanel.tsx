import { useDevetekTranslations } from '@/services/i18n';

import type {
  buildApplicationStats,
  buildLoadBalancerStats,
} from '../../-lib/stats';
import { DashboardSection, MeterRow } from '../../-presentation';

export default function ResourceMixPanel(props: {
  applicationStats: ReturnType<typeof buildApplicationStats>;
  loadBalancerStats: ReturnType<typeof buildLoadBalancerStats>;
  totalApplications?: number;
  totalLoadBalancers?: number;
  totalDomains?: number;
  totalDatabases?: number;
}) {
  const {
    applicationStats,
    loadBalancerStats,
    totalApplications,
    totalDatabases,
    totalDomains,
    totalLoadBalancers,
  } = props;
  const t = useDevetekTranslations('page.dashboard.resourceMix');

  return (
    <DashboardSection title={t('title')} description={t('description')}>
      <div className="grid gap-3">
        <MeterRow
          label={t('applicationsReady')}
          value={applicationStats.ready}
          total={totalApplications}
        />
        <MeterRow
          label={t('loadBalancersReady')}
          value={loadBalancerStats.ready}
          total={totalLoadBalancers}
        />
        <MeterRow
          label={t('domains')}
          value={totalDomains}
          total={(totalDomains ?? 0) + (totalDatabases ?? 0)}
        />
        <MeterRow
          label={t('databases')}
          value={totalDatabases}
          total={(totalDomains ?? 0) + (totalDatabases ?? 0)}
        />
      </div>
    </DashboardSection>
  );
}
