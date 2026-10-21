import { NetworkIcon } from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

import type { DTOs } from '@/shared/api';

import { statusTone } from '../../-lib/tone';
import { CompactResourceRow, EmptyLine } from '../../-presentation';
import CompactListSection from '../CompactListSection/CompactListSection';

export default function LoadBalancersList(props: {
  loadBalancers: DTOs.LoadBalancerV2[];
  limit: number;
}) {
  const { limit, loadBalancers } = props;
  const t = useDevetekTranslations('page.dashboard.lists.loadBalancers');

  return (
    <CompactListSection
      title={t('title')}
      description={t('description')}
      to="/backend/load-balancers"
    >
      {loadBalancers.length ? (
        loadBalancers
          .slice(0, limit)
          .map((loadBalancer) => (
            <CompactResourceRow
              key={loadBalancer.id || loadBalancer.domain || loadBalancer.name}
              icon={NetworkIcon}
              title={loadBalancer.name || loadBalancer.domain || t('unknown')}
              subtitle={
                loadBalancer.domain ||
                loadBalancer.engine ||
                loadBalancer.machine?.hostname ||
                t('noDomain')
              }
              status={loadBalancer.installer_status || t('unknownStatus')}
              statusTone={statusTone(loadBalancer.installer_status)}
              to="/backend/load-balancers"
            />
          ))
      ) : (
        <EmptyLine>{t('empty')}</EmptyLine>
      )}
    </CompactListSection>
  );
}
