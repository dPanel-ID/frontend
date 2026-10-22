import {
  Clock3Icon,
  GithubIcon,
  KeyRoundIcon,
  ShieldCheckIcon,
} from 'lucide-react';

import { useAuthModel } from '@/services/auth/model';
import { useDevetekLocale, useDevetekTranslations } from '@/services/i18n';

import { useWorkspaceRolesDetailModal } from '@/features/workspace-roles-detail-modal';

import { workspaceToOrganizationId } from '@/shared/api/-dtos';
import type { Dto as UserProfileDto } from '@/shared/api/user.profile';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/presentation/atoms/Card';

import {
  formatRelativeDate,
  getStoredWorkspaceId,
  getWorkspaceId,
  getWorkspaceRoleSummary,
} from '../-lib/profile';
import {
  DetailRow,
  WorkspaceRoleDetailRow,
} from '../-view/-presentation/fields';

export type Workspace = NonNullable<UserProfileDto['workspaces']>[number];

export function ProfileSidebar() {
  const { resUserProfile } = useAuthModel();
  const [openWorkspaceRolesDetailModal] = useWorkspaceRolesDetailModal();
  const t = useDevetekTranslations();
  const locale = useDevetekLocale();
  const profile = resUserProfile.$status === 'success' ? resUserProfile : null;
  const user = profile?.user;
  const workspaces = profile?.workspaces ?? [];
  const githubName =
    profile?.github?.nickname ||
    profile?.github?.provider ||
    profile?.github?.subject;
  const activeWorkspaceId =
    workspaceToOrganizationId(profile?.active_workspace) ||
    getStoredWorkspaceId();
  const activeWorkspace = activeWorkspaceId
    ? workspaces.find(
        (workspace) => getWorkspaceId(workspace) === activeWorkspaceId,
      )
    : workspaces.find((workspace) => workspace.type === 'personal');
  const activeWorkspaceName =
    activeWorkspace?.name ||
    activeWorkspaceId ||
    t('page.profile.workspaces.personal');
  const activeWorkspaceRole = getWorkspaceRoleSummary(activeWorkspace, t);
  const updatedAt = formatRelativeDate(user?.updated_at, locale);
  const notProvided = t('page.profile.notProvided');
  const handleOpenActiveWorkspaceRoles = () => {
    openWorkspaceRolesDetailModal({
      roles: activeWorkspaceRole.roles,
      workspaceName: activeWorkspaceName,
    });
  };

  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {t('page.profile.sidebar.sessionTitle')}
          </CardTitle>
          <CardDescription>
            {t('page.profile.sidebar.sessionDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <DetailRow
            icon={ShieldCheckIcon}
            label={t('page.profile.sidebar.activeWorkspace')}
            value={activeWorkspaceName}
          />
          <WorkspaceRoleDetailRow
            hiddenCount={activeWorkspaceRole.hiddenCount}
            label={t('page.profile.sidebar.workspaceRole')}
            onOpenRoles={handleOpenActiveWorkspaceRoles}
            primaryRole={activeWorkspaceRole.primaryRole}
            roles={activeWorkspaceRole.roles}
          />
          <DetailRow
            icon={Clock3Icon}
            label={t('page.profile.sidebar.profileUpdated')}
            value={updatedAt || notProvided}
            muted={!updatedAt}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {t('page.profile.sidebar.securityTitle')}
          </CardTitle>
          <CardDescription>
            {t('page.profile.sidebar.securityDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <DetailRow
            icon={KeyRoundIcon}
            label={t('page.profile.sidebar.passwordUpdate')}
            value={t('page.profile.sidebar.available')}
          />
          <DetailRow
            icon={GithubIcon}
            label={t('page.profile.sidebar.githubAccess')}
            value={
              githubName
                ? t('page.profile.connections.connected')
                : t('page.profile.connections.notConnected')
            }
            muted={!githubName}
          />
        </CardContent>
      </Card>
    </div>
  );
}
