import dayjs from 'dayjs';
import { Building2Icon, CalendarIcon, UsersIcon } from 'lucide-react';

import { useAuthLoggedIn } from '@/services/auth';
import { useAuthModel } from '@/services/auth/model';
import { useDevetekTranslations } from '@/services/i18n';

import { StatTile } from '@/shared/presentation/molecules/StatTile';

/**
 * The three numbers a profile actually answers: how many workspaces you can
 * see, how many of those are teams, and how long the account has existed.
 * They report rather than filter, because a profile has no list to narrow.
 */
export default function Overview() {
  const t = useDevetekTranslations();
  const { userProfile } = useAuthLoggedIn();
  const { resUserProfile } = useAuthModel();

  const profile = resUserProfile.$status === 'success' ? resUserProfile : null;
  const loading = resUserProfile.$status === 'loading';
  const workspaces = profile?.workspaces ?? [];
  const teamCount = workspaces.filter((w) => w.type !== 'personal').length;
  const joined = profile?.user?.created_at ?? userProfile.createAt;

  return (
    <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-3">
      <StatTile
        icon={UsersIcon}
        tone="sky"
        label={t('page.profile.access.totalWorkspaces')}
        value={workspaces.length || 1}
        loading={loading}
      />
      <StatTile
        icon={Building2Icon}
        tone={teamCount ? 'emerald' : 'neutral'}
        label={t('page.profile.access.teamWorkspaces')}
        value={teamCount}
        loading={loading}
      />
      <StatTile
        icon={CalendarIcon}
        tone="neutral"
        label={t('page.profile.identity.joined')}
        value={joined ? dayjs(joined).format('D MMM') : '—'}
        hint={joined ? dayjs(joined).format('YYYY-MM-DD') : undefined}
        loading={loading}
        className="max-lg:col-span-2"
      />
    </div>
  );
}
