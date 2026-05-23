import { useNavigate } from '@tanstack/react-router';

import type { TeamPopupItem } from '@/features/app-shell/rules/types';

import { useOrganizationCreateModal } from '@/features/organization-create-modal';
import { ApiOrganization } from '@/shared/api';
import {
  organizationToWorkspaceId,
  workspaceToOrganizationId,
} from '@/shared/api/-dtos';
import { iife } from '@/shared/libs/browser/fn';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/presentation/atoms/Popover';

import TeamsDropdown from '../../presentation/TeamsDropdown';
import TeamsPopup from '../../presentation/TeamsPopup';

interface TeamsProps {
  collapsed?: boolean;
}

export default function Teams(props: TeamsProps) {
  const { collapsed } = props;

  const navigate = useNavigate();
  const [openOrganizationCreateModal] = useOrganizationCreateModal();

  const [resOrganizations, refreshOrganizations] = ApiOrganization.Find.useGet({
    page: 1,
    pageSize: 100,
  });

  const selectedTeamId = iife(() => {
    const stored = localStorage.getItem('organization_id') || null;
    if (!stored) return null;
    return organizationToWorkspaceId(stored);
  });

  const handleClickSelectTeam = (teamId: string) => {
    if (selectedTeamId === teamId) {
      localStorage.removeItem('organization_id');
    } else {
      localStorage.setItem('organization_id', teamId);
    }

    window.location.reload();
  };

  const handleClickPersonal = () => {
    localStorage.removeItem('organization_id');
    window.location.reload();
  };

  const handleClickAddNewTeams = () => {
    openOrganizationCreateModal({
      onSubmitSuccess: () => {
        refreshOrganizations();
        window.location.reload();
      },
    });
    return;
  };

  const handleClickTeamDetails = (teamId: string) => {
    navigate({
      to: '/teams/$id',
      params: { id: workspaceToOrganizationId(teamId) },
      search: { page: 1 },
    });
  };

  const teams: TeamPopupItem[] = iife(() => {
    if (resOrganizations.$status !== 'success') return [];

    return (resOrganizations.organizations ?? []).flatMap((org) => {
      if (!org.id) return [];

      return [
        {
          name: org.name || org.id,
          id: organizationToWorkspaceId(org.id),
        },
      ];
    });
  });

  const teamName = iife(() => {
    if (resOrganizations.$status !== 'success') return undefined;

    const organization = resOrganizations.organizations?.find(
      (org) => org.id && organizationToWorkspaceId(org.id) === selectedTeamId,
    );
    if (!organization) return undefined;

    return organization.name!;
  });

  return (
    <Popover>
      <PopoverTrigger asChild>
        <div>
          <TeamsDropdown collapsed={collapsed} teamName={teamName} />
        </div>
      </PopoverTrigger>
      <PopoverContent
        className="ml-2 data-[collapsed=true]:ml-5 p-0 overflow-hidden"
        data-collapsed={collapsed}
      >
        <TeamsPopup
          teams={teams}
          onClickAddNewTeams={handleClickAddNewTeams}
          selectedTeamId={selectedTeamId}
          onClickTeam={handleClickSelectTeam}
          onClickTeamDetails={handleClickTeamDetails}
          onClickPersonal={handleClickPersonal}
        />
      </PopoverContent>
    </Popover>
  );
}
