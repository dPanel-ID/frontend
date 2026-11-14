import { useAuthModel } from '@/services/auth/model';
import { useDevetekTranslations } from '@/services/i18n';

import LayoutAutoGridList from '@/shared/presentation/atoms/LayoutAutoGridList';
import { EmptyState } from '@/shared/presentation/organisms/EmptyState';
import { buildResponseView } from '@/widgets/response-view-builder';

import { OrgListState } from '../-presentation/OrgListState';
import { myTeamAccess } from '../../-lib/team-roles';
import { useEmit } from '../../-model/events';
import { useFilterModel } from '../../-model/filters';
import { useOrgDataModel } from '../../-model/org-data';

import { TeamCard } from './TeamCard';
import { TeamTable } from './TeamTable';
import type { TeamRow } from './types';

export default buildResponseView({
  useResponse: () => useOrgDataModel((s) => s.organizations),
  fallbackError: OrgListState.Error,
  fallbackLoading: OrgListState.Loading,
  render: function Render(props) {
    const { list } = props;

    const [derivedViewMode] = useFilterModel((s) => [s.derivedViewMode]);
    const t = useDevetekTranslations();
    const emit = useEmit();
    const { resUserProfile } = useAuthModel();
    const profile =
      resUserProfile.$status === 'success' ? resUserProfile : undefined;

    if (list.length < 1) {
      return (
        <EmptyState
          title={t('page.teams.emptyState.title')}
          message={t('page.teams.emptyState.message')}
          ctaText={t('page.teams.emptyState.cta')}
          ctaOnClick={() => emit('@teams/add-new', undefined)}
        />
      );
    }

    const teams: TeamRow[] = list.flatMap((org) => {
      if (!org.id) return [];

      return [
        {
          id: org.id,
          name: org.name || org.id,
          status: org.status,
          createdAt: org.created_at,
          updatedAt: org.updated_at,
          access: profile
            ? myTeamAccess(profile.workspaces, org.id)
            : undefined,
          isActive: profile?.active_workspace === org.id,
        },
      ];
    });

    if (derivedViewMode === 'table') {
      return <TeamTable teams={teams} />;
    }

    return (
      <LayoutAutoGridList viewMode={derivedViewMode}>
        {teams.map((team) => (
          <TeamCard key={team.id} team={team} />
        ))}
      </LayoutAutoGridList>
    );
  },
});
