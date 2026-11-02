import { useState } from 'react';

import dayjs from 'dayjs';
import {
  CalendarIcon,
  ListTreeIcon,
  ServerCogIcon,
  UserIcon,
} from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

import { getDomainProviderLabel } from '@/entities/domain/ui/constants/provider';
import { OwnerLink } from '@/entities/user/ui/OwnerLink';

import { StatTile } from '@/shared/presentation/molecules/StatTile';

import { useDomainRecordsModel } from '../-model/domain-records';

/** Four facts about the domain, above its records. */
export default function Overview() {
  const t = useDevetekTranslations();
  const [domain, records, search, type] = useDomainRecordsModel((s) => [
    s.domain,
    s.records,
    s.search,
    s.type,
  ]);

  // The zone's size is the total of an unfiltered listing. Remember the last
  // one, so searching does not make the zone look smaller.
  const [zoneTotal, setZoneTotal] = useState<number>();
  const unfilteredTotal =
    records.$status === 'success' && !search && !type
      ? records.total
      : undefined;

  if (unfilteredTotal !== undefined && unfilteredTotal !== zoneTotal) {
    setZoneTotal(unfilteredTotal);
  }

  const isLoading = domain.$status !== 'success';
  const card = domain.$status === 'success' ? domain : undefined;

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <StatTile
        icon={ServerCogIcon}
        tone="sky"
        label={t('page.domainDetail.tiles.provider')}
        value={
          card
            ? getDomainProviderLabel(
                card.provider,
                t('page.domain.providerUnknown'),
              )
            : '-'
        }
        loading={isLoading}
      />
      <StatTile
        icon={ListTreeIcon}
        tone="emerald"
        label={t('page.domainDetail.tiles.records')}
        value={zoneTotal ?? '-'}
        hint={t('page.domainDetail.tiles.recordsHint')}
        // Opened straight onto a search, the zone's size is not known.
        loading={
          zoneTotal === undefined &&
          !search &&
          !type &&
          records.$status !== 'failed'
        }
      />
      <StatTile
        icon={UserIcon}
        label={t('page.domainDetail.tiles.owner')}
        value={card ? <OwnerLink ownership={card.ownership} preferTeam /> : '-'}
        loading={isLoading}
      />
      <StatTile
        icon={CalendarIcon}
        label={t('page.domainDetail.tiles.added')}
        value={
          card?.timestamp.created
            ? dayjs(card.timestamp.created).format('D MMM YYYY')
            : '-'
        }
        loading={isLoading}
      />
    </div>
  );
}
