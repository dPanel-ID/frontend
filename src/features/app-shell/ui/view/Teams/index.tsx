import { useMemo, useState } from 'react';

import { useNavigate } from '@tanstack/react-router';

import { useAuthModel } from '@/services/auth/model';
import { useDevetekTranslations } from '@/services/i18n';

import type { WorkspacePickerItem } from '@/features/app-shell/rules/types';
import { useOrganizationCreateModal } from '@/features/organization-create-modal';

import { ApiOrganization } from '@/shared/api';
import {
  organizationToWorkspaceId,
  workspaceToOrganizationId,
} from '@/shared/api/-dtos';
import { LS_ORGANIZATION_ID } from '@/shared/libs/api-client/config';
import { iife } from '@/shared/libs/browser/fn';
import { useDebounceValue } from '@/shared/libs/react-hooks/useDebounce';

import TeamsDropdown from '../../presentation/TeamsDropdown';
import WorkspacePickerModal from '../../presentation/WorkspacePickerModal';

interface TeamsProps {
  collapsed?: boolean;
}

const WORKSPACE_PICKER_PAGE_SIZE = 5;

export default function Teams(props: TeamsProps) {
  const { collapsed } = props;

  const navigate = useNavigate();
  const [openOrganizationCreateModal] = useOrganizationCreateModal();
  const [workspacePickerOpen, setWorkspacePickerOpen] = useState(false);
  const [workspaceSearchQuery, setWorkspaceSearchQuery] = useState('');
  const [workspacePage, setWorkspacePage] = useState(1);
  const [debouncedWorkspaceSearchQuery] =
    useDebounceValue(workspaceSearchQuery);
  const t = useDevetekTranslations();
  const { resUserProfile } = useAuthModel();

  const [resOrganizations, refreshOrganizations] = ApiOrganization.Find.useGet({
    page: workspacePage,
    pageSize: WORKSPACE_PICKER_PAGE_SIZE,
    name: debouncedWorkspaceSearchQuery.trim() || undefined,
  });

  const selectedTeamId = iife(() => {
    const stored = localStorage.getItem(LS_ORGANIZATION_ID) || null;
    if (!stored) return null;
    return workspaceToOrganizationId(stored);
  });

  const handleClickSelectWorkspace = (workspace: WorkspacePickerItem) => {
    if (workspace.type === 'personal') {
      if (!selectedTeamId) {
        setWorkspacePickerOpen(false);
        return;
      }

      localStorage.removeItem(LS_ORGANIZATION_ID);
      window.location.reload();
      return;
    }

    if (!workspace.workspaceId || selectedTeamId === workspace.workspaceId) {
      setWorkspacePickerOpen(false);
      return;
    }

    localStorage.setItem(LS_ORGANIZATION_ID, workspace.workspaceId);
    window.location.reload();
  };

  const handleClickAddNewTeams = () => {
    setWorkspacePickerOpen(false);

    openOrganizationCreateModal({
      onSubmitSuccess: () => {
        setWorkspacePage(1);
        refreshOrganizations();
        window.location.reload();
      },
    });
    return;
  };

  const handleClickWorkspaceDetails = (workspace: WorkspacePickerItem) => {
    if (workspace.type === 'personal' || !workspace.workspaceId) {
      setWorkspacePickerOpen(false);
      return;
    }

    setWorkspacePickerOpen(false);

    navigate({
      to: '/teams/$id',
      params: { id: workspaceToOrganizationId(workspace.workspaceId) },
      search: { page: 1 },
    });
  };

  const organizationData =
    resOrganizations.$status === 'success'
      ? resOrganizations
      : resOrganizations.$status === 'loading'
        ? resOrganizations.prevData
        : undefined;

  const profileWorkspaces =
    resUserProfile.$status === 'success'
      ? (resUserProfile.workspaces ?? [])
      : [];

  const selectedProfileWorkspace = profileWorkspaces.find(
    (workspace) => workspaceToOrganizationId(workspace.id) === selectedTeamId,
  );

  const workspaces = useMemo<WorkspacePickerItem[]>(() => {
    const personalWorkspace: WorkspacePickerItem = {
      id: 'personal',
      name: t('sidebar.workspacePicker.personalWorkspace'),
      type: 'personal',
      workspaceId: null,
      role: t('sidebar.workspacePicker.roleOwner'),
      description: t('sidebar.workspacePicker.personalDescription'),
    };

    const teamWorkspaces = (organizationData?.organizations ?? []).flatMap(
      (org) => {
        if (!org.id) return [];

        const workspaceId = organizationToWorkspaceId(org.id);

        return [
          {
            name: org.name || workspaceId,
            id: workspaceId,
            type: 'team' as const,
            workspaceId,
            role: t('sidebar.workspacePicker.roleMember'),
            status: t('sidebar.workspacePicker.isolatedResources'),
            description:
              org.description ||
              t('sidebar.workspacePicker.teamDescription', { workspaceId }),
          },
        ];
      },
    );

    const selectedProfileWorkspaceId = selectedProfileWorkspace?.id
      ? workspaceToOrganizationId(selectedProfileWorkspace.id)
      : '';

    if (
      !debouncedWorkspaceSearchQuery.trim() &&
      selectedProfileWorkspace &&
      selectedProfileWorkspace.type !== 'personal' &&
      selectedProfileWorkspaceId &&
      !teamWorkspaces.some(
        (workspace) => workspace.workspaceId === selectedProfileWorkspaceId,
      )
    ) {
      teamWorkspaces.unshift({
        id: selectedProfileWorkspaceId,
        name: selectedProfileWorkspace.name || selectedProfileWorkspaceId,
        type: 'team',
        workspaceId: selectedProfileWorkspaceId,
        role: selectedProfileWorkspace.roles?.some((role) =>
          role.includes('owner'),
        )
          ? t('sidebar.workspacePicker.roleOwner')
          : t('sidebar.workspacePicker.roleMember'),
        status: t('sidebar.workspacePicker.isolatedResources'),
        description: t('sidebar.workspacePicker.teamDescription', {
          workspaceId: selectedProfileWorkspaceId,
        }),
      });
    }

    return [personalWorkspace, ...teamWorkspaces];
  }, [
    debouncedWorkspaceSearchQuery,
    organizationData?.organizations,
    selectedProfileWorkspace,
    t,
  ]);

  const teamName = iife(() => {
    if (selectedProfileWorkspace?.name) return selectedProfileWorkspace.name;

    const organization = organizationData?.organizations?.find(
      (org) => org.id && organizationToWorkspaceId(org.id) === selectedTeamId,
    );
    if (!organization) return undefined;

    return organization.name!;
  });

  const pagination = organizationData?.pagination;
  const totalPages = Math.max(1, pagination?.total_page ?? 1);
  const currentPage = Math.min(workspacePage, totalPages);
  const totalItems = pagination?.total_item ?? 0;

  return (
    <>
      <TeamsDropdown
        collapsed={collapsed}
        teamName={teamName}
        onClick={() => setWorkspacePickerOpen(true)}
      />

      <WorkspacePickerModal
        open={workspacePickerOpen}
        selectedWorkspaceId={selectedTeamId}
        workspaces={workspaces}
        searchQuery={workspaceSearchQuery}
        pagination={{
          page: currentPage,
          totalPages,
          totalItems,
        }}
        isLoading={
          resOrganizations.$status === 'initial' ||
          (resOrganizations.$status === 'loading' &&
            resOrganizations.prevData == null)
        }
        onOpenChange={setWorkspacePickerOpen}
        onSearchQueryChange={(query) => {
          setWorkspaceSearchQuery(query);
          setWorkspacePage(1);
        }}
        onPageChange={setWorkspacePage}
        onClickCreateWorkspace={handleClickAddNewTeams}
        onClickWorkspace={handleClickSelectWorkspace}
        onClickWorkspaceDetails={handleClickWorkspaceDetails}
      />
    </>
  );
}
