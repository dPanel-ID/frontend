import { AppWindowIcon } from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

import type { DTOs } from '@/shared/api';

import { statusTone } from '../../-lib/tone';
import { CompactResourceRow, EmptyLine } from '../../-presentation';
import CompactListSection from '../CompactListSection/CompactListSection';

export default function ApplicationsList(props: {
  applications: DTOs.ApplicationV1[];
  limit: number;
}) {
  const { applications, limit } = props;
  const t = useDevetekTranslations('page.dashboard.lists.applications');

  return (
    <CompactListSection
      title={t('title')}
      description={t('description')}
      to="/applications"
    >
      {applications.length ? (
        applications.slice(0, limit).map((application) => {
          const latestStatus =
            application.artifacts?.[0]?.installer_status ||
            application.deploys?.[0]?.installer_status;

          return (
            <CompactResourceRow
              key={application.id || application.name}
              icon={AppWindowIcon}
              title={application.name || t('unknown')}
              subtitle={
                application.repo_name ||
                application.domain ||
                application.bundle_type ||
                t('noSource')
              }
              status={latestStatus || t('unknownStatus')}
              statusTone={statusTone(latestStatus)}
              to={application.id ? '/applications/$id' : undefined}
              params={
                application.id ? { id: String(application.id) } : undefined
              }
            />
          );
        })
      ) : (
        <EmptyLine>{t('empty')}</EmptyLine>
      )}
    </CompactListSection>
  );
}
