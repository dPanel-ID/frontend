import {
  CrownIcon,
  LayoutDashboardIcon,
  Share2Icon,
  UsersIcon,
} from 'lucide-react';

import { useAuthModel } from '@/services/auth/model';
import { useDevetekTranslations } from '@/services/i18n';

import { StatTile } from '@/shared/presentation/molecules/StatTile';

import { teamAccessOf, teamWorkspaces } from '../../-lib/team-roles';

/**
 * The teams you belong to, from your profile, so the counts cover every team
 * rather than the page on screen.
 */
export default function Overview() {
  const t = useDevetekTranslations('page.teams.overview');
  const { resUserProfile } = useAuthModel();

  const profile =
    resUserProfile.$status === 'success' ? resUserProfile : undefined;
  const loading = !profile;
  const teams = teamWorkspaces(profile?.workspaces);
  const owned = teams.filter(
    (team) => teamAccessOf(team.roles ?? []) === 'owner',
  ).length;
  const active = (profile?.workspaces ?? []).find(
    (workspace) => workspace.id === profile?.active_workspace,
  );
  const activeName =
    !active || active.type !== 'group' ? t('personal') : active.name;

  return (
    <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
      <StatTile
        icon={UsersIcon}
        tone="sky"
        label={t('teams')}
        value={teams.length}
        hint={t('teamsHint')}
        loading={loading}
      />
      <StatTile
        icon={CrownIcon}
        tone="amber"
        label={t('owned')}
        value={owned}
        hint={t('ownedHint')}
        loading={loading}
      />
      <StatTile
        icon={Share2Icon}
        tone="emerald"
        label={t('shared')}
        value={teams.length - owned}
        hint={t('sharedHint')}
        loading={loading}
      />
      <StatTile
        icon={LayoutDashboardIcon}
        label={t('active')}
        value={activeName}
        hint={t('activeHint')}
        loading={loading}
      />
    </div>
  );
}
