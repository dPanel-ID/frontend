import {
  CrownIcon,
  LayoutDashboardIcon,
  Share2Icon,
  UsersIcon,
} from 'lucide-react';

import { useAuthModel } from '@/services/auth/model';
import { useDevetekTranslations } from '@/services/i18n';

import { workspaceToOrganizationId } from '@/shared/api/-dtos';
import { selectedWorkspaceOrganizationId } from '@/shared/libs/api-client/config';
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
  // The workspace the sidebar shows and requests are sent for. The
  // profile's active_workspace is the identity provider's default, which
  // stays "personal" after switching to a team in this browser.
  const selectedId = selectedWorkspaceOrganizationId();
  const active = selectedId
    ? teams.find((team) => workspaceToOrganizationId(team.id) === selectedId)
    : undefined;
  const activeName = !selectedId
    ? t('personal')
    : active?.name || `#${selectedId}`;

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
