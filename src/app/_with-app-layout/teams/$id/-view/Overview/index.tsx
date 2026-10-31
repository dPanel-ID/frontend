import {
  ActivityIcon,
  CalendarIcon,
  ShieldIcon,
  UsersIcon,
} from 'lucide-react';

import { useDevetekLocale, useDevetekTranslations } from '@/services/i18n';

import { StatTile } from '@/shared/presentation/molecules/StatTile';

import { useMembersDataModel } from '../../-model/members-data';
import { TeamAccessBadge } from '../../../-presentation/TeamAccessBadge';
import { TeamStatusPill } from '../../../-presentation/TeamStatusPill';

/** Four facts about the team, above its members. */
export default function Overview() {
  const t = useDevetekTranslations('page.teamDetail.tiles');
  const locale = useDevetekLocale();
  const { members, organization } = useMembersDataModel();

  const team = members.$status === 'success' ? members : undefined;
  const org = organization.$status === 'success' ? organization : undefined;

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <StatTile
        icon={UsersIcon}
        tone="sky"
        label={t('members')}
        value={team?.total ?? '-'}
        hint={t('membersHint')}
        loading={!team && members.$status !== 'failed'}
      />
      <StatTile
        icon={ShieldIcon}
        tone="amber"
        label={t('yourRole')}
        value={
          team?.myAccess ? <TeamAccessBadge access={team.myAccess} /> : '-'
        }
        hint={t('yourRoleHint')}
        loading={!team && members.$status !== 'failed'}
      />
      <StatTile
        icon={ActivityIcon}
        tone="emerald"
        label={t('status')}
        value={org?.status ? <TeamStatusPill status={org.status} /> : '-'}
        loading={!org && organization.$status !== 'failed'}
      />
      <StatTile
        icon={CalendarIcon}
        label={t('created')}
        value={
          org?.createdAt
            ? new Date(org.createdAt).toLocaleDateString(locale, {
                dateStyle: 'medium',
              })
            : '-'
        }
        loading={!org && organization.$status !== 'failed'}
      />
    </div>
  );
}
