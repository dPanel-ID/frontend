import { ServerIcon } from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

import type { DTOs } from '@/shared/api';

import { statusTone } from '../../-lib/tone';
import { CompactResourceRow, EmptyLine } from '../../-presentation';
import CompactListSection from '../CompactListSection/CompactListSection';

export default function ServersList(props: {
  servers: DTOs.MachineV1[];
  limit: number;
}) {
  const { limit, servers } = props;
  const t = useDevetekTranslations('page.dashboard.lists.servers');

  return (
    <CompactListSection
      title={t('title')}
      description={t('description')}
      to="/servers"
    >
      {servers.length ? (
        servers
          .slice(0, limit)
          .map((server) => (
            <CompactResourceRow
              key={server.id || server.hostname}
              icon={ServerIcon}
              title={server.hostname || t('unknown')}
              subtitle={server.address || server.provider || t('noAddress')}
              status={server.status || t('unknownStatus')}
              statusTone={statusTone(server.status)}
              to={server.id ? '/servers/$id' : undefined}
              params={server.id ? { id: String(server.id) } : undefined}
            />
          ))
      ) : (
        <EmptyLine>{t('empty')}</EmptyLine>
      )}
    </CompactListSection>
  );
}
