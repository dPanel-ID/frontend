import { Link } from '@tanstack/react-router';
import {
  Building2Icon,
  CalendarIcon,
  CheckCircle2Icon,
  Clock3Icon,
  ExternalLinkIcon,
  GithubIcon,
  KeyRoundIcon,
  MailIcon,
  PencilIcon,
  ShieldCheckIcon,
  UserIcon,
  UsersIcon,
} from 'lucide-react';
import type { Locale } from 'use-intl';

import { useAuthLoggedIn } from '@/services/auth';
import { useAuthModel } from '@/services/auth/model';
import { useDevetekLocale, useDevetekTranslations } from '@/services/i18n';

import { workspaceToOrganizationId } from '@/shared/api/-dtos';
import type { Dto as UserProfileDto } from '@/shared/api/user.profile';
import { LS_ORGANIZATION_ID } from '@/shared/libs/api-client/config';
import { getDistanceFromNow } from '@/shared/libs/browser/date';
import { cn } from '@/shared/libs/tailwind/cn';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/shared/presentation/atoms/Avatar';
import { Badge } from '@/shared/presentation/atoms/Badge';
import { Button } from '@/shared/presentation/atoms/ButtonV2';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/presentation/atoms/Card';
import { Separator } from '@/shared/presentation/atoms/Separator';

interface PersonalProps {
  onEditProfile: () => void;
}

type Workspace = NonNullable<UserProfileDto['workspaces']>[number];

function getInitials(value: string) {
  const initials = value
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return initials || 'U';
}

function getStoredWorkspaceId() {
  if (typeof window === 'undefined') return '';

  return workspaceToOrganizationId(localStorage.getItem(LS_ORGANIZATION_ID));
}

function formatRelativeDate(value: string | undefined, locale: Locale) {
  if (!value) return '';

  try {
    const formatted = getDistanceFromNow(value, locale);

    if (formatted.toLowerCase().includes('invalid')) return '';

    return formatted;
  } catch {
    return '';
  }
}

function formatRole(role: string) {
  return role.replace(/[_-]/g, ' ');
}

function getWorkspaceId(workspace: Workspace) {
  return workspaceToOrganizationId(workspace.id);
}

function getWorkspaceRoleLabel(
  workspace: Workspace | undefined,
  t: ReturnType<typeof useDevetekTranslations>,
) {
  const roles = workspace?.roles ?? [];

  if (roles.some((role) => role.toLowerCase().includes('owner'))) {
    return t('page.profile.workspaces.owner');
  }

  if (roles.length > 0) return roles.map(formatRole).join(', ');

  return t('page.profile.workspaces.member');
}

function DetailRow(props: {
  icon: typeof UserIcon;
  label: string;
  value: string;
  muted?: boolean;
}) {
  const { icon: Icon, label, muted, value } = props;

  return (
    <div className="flex min-w-0 items-start gap-3 rounded-md border bg-background p-3">
      <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-normal text-muted-foreground">
          {label}
        </p>
        <p
          className={cn(
            'mt-1 truncate text-sm font-medium',
            muted && 'text-muted-foreground',
          )}
          title={value}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

function ConnectionCard(props: {
  icon: typeof UserIcon;
  title: string;
  detail: string;
  connected: boolean;
  statusLabel?: string;
}) {
  const { connected, detail, icon: Icon, statusLabel, title } = props;
  const t = useDevetekTranslations();

  return (
    <div className="flex min-w-0 items-start justify-between gap-3 rounded-md border bg-background p-3">
      <div className="flex min-w-0 items-start gap-3">
        <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{title}</p>
          <p
            className="mt-1 truncate text-xs text-muted-foreground"
            title={detail}
          >
            {detail}
          </p>
        </div>
      </div>
      <Badge
        variant={connected ? 'secondary' : 'outline'}
        className={cn(
          connected &&
            'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300',
        )}
      >
        {statusLabel ||
          (connected
            ? t('page.profile.connections.connected')
            : t('page.profile.connections.notConnected'))}
      </Badge>
    </div>
  );
}

function WorkspaceRow(props: {
  activeWorkspaceId: string;
  workspace: Workspace;
}) {
  const { activeWorkspaceId, workspace } = props;
  const t = useDevetekTranslations();
  const workspaceId = getWorkspaceId(workspace);
  const isPersonal = workspace.type === 'personal';
  const isActive = isPersonal
    ? !activeWorkspaceId || workspaceId === activeWorkspaceId
    : Boolean(workspaceId && workspaceId === activeWorkspaceId);
  const roleLabel = getWorkspaceRoleLabel(workspace, t);

  return (
    <div className="grid gap-3 rounded-md border bg-background p-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
      <div className="flex min-w-0 items-start gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-md border bg-card">
          {isPersonal ? (
            <UserIcon className="size-4 text-muted-foreground" />
          ) : (
            <Building2Icon className="size-4 text-muted-foreground" />
          )}
        </div>
        <div className="min-w-0">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <p className="truncate text-sm font-semibold">
              {workspace.name ||
                (isPersonal
                  ? t('page.profile.workspaces.personal')
                  : t('page.profile.workspaces.unknown'))}
            </p>
            {isActive && (
              <Badge variant="secondary">
                <CheckCircle2Icon />
                {t('page.profile.workspaces.current')}
              </Badge>
            )}
          </div>
          <div className="mt-1 flex min-w-0 flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span className="capitalize">
              {isPersonal
                ? t('page.profile.workspaces.personalType')
                : t('page.profile.workspaces.teamType')}
            </span>
            {workspaceId && (
              <>
                <span>/</span>
                <span className="truncate font-mono">{workspaceId}</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 sm:justify-end">
        <Badge variant="outline" className="max-w-[14rem] truncate capitalize">
          {roleLabel}
        </Badge>
        {!isPersonal && workspaceId && (
          <Button
            asChild
            size="icon-sm"
            buttonStyle="ghost"
            buttonColor="secondary"
            aria-label={t('page.profile.workspaces.openTeam')}
            title={t('page.profile.workspaces.openTeam')}
          >
            <Link
              to="/teams/$id"
              params={{ id: workspaceId }}
              search={{ page: 1 }}
            >
              <ExternalLinkIcon />
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}

function EmptyWorkspaces() {
  const t = useDevetekTranslations();

  return (
    <div className="rounded-md border border-dashed bg-background p-6 text-center">
      <UsersIcon className="mx-auto size-6 text-muted-foreground" />
      <p className="mt-3 text-sm font-medium">
        {t('page.profile.workspaces.empty')}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        {t('page.profile.workspaces.emptyDesc')}
      </p>
    </div>
  );
}

export default function Personal(props: PersonalProps) {
  const { onEditProfile } = props;
  const { gitProfile, userProfile } = useAuthLoggedIn();
  const { resUserProfile } = useAuthModel();
  const t = useDevetekTranslations();
  const locale = useDevetekLocale();
  const profile = resUserProfile.$status === 'success' ? resUserProfile : null;
  const sessionUser = profile?.user;
  const workspaces = profile?.workspaces ?? [];
  const teamWorkspaceCount = workspaces.filter(
    (workspace) => workspace.type !== 'personal',
  ).length;
  const activeWorkspaceId =
    workspaceToOrganizationId(profile?.active_workspace) ||
    getStoredWorkspaceId();
  const activeWorkspace = activeWorkspaceId
    ? workspaces.find(
        (workspace) => getWorkspaceId(workspace) === activeWorkspaceId,
      )
    : workspaces.find((workspace) => workspace.type === 'personal');
  const displayName = userProfile.fullname || userProfile.username;
  const avatarUrl = userProfile.avatarSrc ?? '';
  const joinedAt = formatRelativeDate(
    sessionUser?.created_at ?? userProfile.createAt,
    locale,
  );
  const updatedAt = formatRelativeDate(sessionUser?.updated_at, locale);
  const githubName =
    gitProfile?.login || profile?.github?.nickname || profile?.github?.provider;
  const activeWorkspaceName =
    activeWorkspace?.name ||
    (activeWorkspaceId
      ? activeWorkspaceId
      : t('page.profile.workspaces.personal'));
  const notProvided = t('page.profile.notProvided');

  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-base">
                <UserIcon className="size-4" />
                {t('page.profile.identity.title')}
              </CardTitle>
              <CardDescription>
                {t('page.profile.identity.description')}
              </CardDescription>
            </div>
            <Button
              buttonStyle="outline"
              buttonColor="secondary"
              size="sm"
              onClick={onEditProfile}
              aria-label={t('page.profile.editProfile')}
              title={t('page.profile.editProfile')}
            >
              <PencilIcon />
              {t('page.profile.editProfile')}
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <Avatar className="size-16 ring-2 ring-primary/15">
              <AvatarImage
                src={avatarUrl || '/placeholder.svg'}
                alt={displayName}
              />
              <AvatarFallback className="text-lg font-semibold">
                {getInitials(displayName)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <div className="flex min-w-0 flex-wrap items-center gap-2">
                <p className="truncate text-lg font-semibold">{displayName}</p>
                <Badge variant="secondary">
                  {t('page.profile.identity.active')}
                </Badge>
              </div>
              <p className="mt-1 truncate text-sm text-muted-foreground">
                @{userProfile.username}
              </p>
            </div>
          </div>

          <Separator />

          <div className="grid gap-3 sm:grid-cols-2">
            <DetailRow
              icon={MailIcon}
              label={t('page.profile.identity.email')}
              value={userProfile.email || notProvided}
              muted={!userProfile.email}
            />
            <DetailRow
              icon={CalendarIcon}
              label={t('page.profile.identity.joined')}
              value={joinedAt || notProvided}
              muted={!joinedAt}
            />
            <DetailRow
              icon={Clock3Icon}
              label={t('page.profile.identity.lastUpdated')}
              value={updatedAt || notProvided}
              muted={!updatedAt}
            />
            <DetailRow
              icon={ShieldCheckIcon}
              label={t('page.profile.identity.activeWorkspace')}
              value={activeWorkspaceName}
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <KeyRoundIcon className="size-4" />
              {t('page.profile.connections.title')}
            </CardTitle>
            <CardDescription>
              {t('page.profile.connections.description')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <ConnectionCard
              icon={KeyRoundIcon}
              title={t('page.profile.connections.password')}
              detail={t('page.profile.connections.passwordHelp')}
              connected
              statusLabel={t('page.profile.connections.editable')}
            />
            <ConnectionCard
              icon={GithubIcon}
              title={t('page.profile.connections.github')}
              detail={
                githubName || t('page.profile.connections.githubFallback')
              }
              connected={Boolean(githubName)}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <UsersIcon className="size-4" />
              {t('page.profile.access.title')}
            </CardTitle>
            <CardDescription>
              {t('page.profile.access.description')}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <DetailRow
              icon={Building2Icon}
              label={t('page.profile.access.teamWorkspaces')}
              value={String(teamWorkspaceCount)}
            />
            <DetailRow
              icon={UsersIcon}
              label={t('page.profile.access.totalWorkspaces')}
              value={String(workspaces.length || 1)}
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Building2Icon className="size-4" />
            {t('page.profile.workspaces.title')}
          </CardTitle>
          <CardDescription>
            {t('page.profile.workspaces.description')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {workspaces.length > 0 ? (
            workspaces.map((workspace) => (
              <WorkspaceRow
                key={`${workspace.type}-${workspace.id}`}
                activeWorkspaceId={activeWorkspaceId}
                workspace={workspace}
              />
            ))
          ) : (
            <EmptyWorkspaces />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export function ProfileSidebar() {
  const { resUserProfile } = useAuthModel();
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
  const activeWorkspaceRole = getWorkspaceRoleLabel(activeWorkspace, t);
  const updatedAt = formatRelativeDate(user?.updated_at, locale);
  const notProvided = t('page.profile.notProvided');

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
            value={
              activeWorkspace?.name ||
              activeWorkspaceId ||
              t('page.profile.workspaces.personal')
            }
          />
          <DetailRow
            icon={UsersIcon}
            label={t('page.profile.sidebar.workspaceRole')}
            value={activeWorkspaceRole}
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
