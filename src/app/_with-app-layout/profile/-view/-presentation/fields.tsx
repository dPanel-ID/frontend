import { Link } from '@tanstack/react-router';
import {
  Building2Icon,
  CheckCircle2Icon,
  ExternalLinkIcon,
  ListChecksIcon,
  UserIcon,
  UsersIcon,
} from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

import type { Dto as UserProfileDto } from '@/shared/api/user.profile';
import { cn } from '@/shared/libs/tailwind/cn';
import { Badge } from '@/shared/presentation/atoms/Badge';
import { Button } from '@/shared/presentation/atoms/ButtonV2';
import { StatusPill } from '@/shared/presentation/molecules/StatusPill';

import { getWorkspaceId, getWorkspaceRoleSummary } from '../../-lib/profile';

export type Workspace = NonNullable<UserProfileDto['workspaces']>[number];

export function DetailRow(props: {
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

export function WorkspaceRoleDetailRow(props: {
  hiddenCount: number;
  label: string;
  onOpenRoles: () => void;
  primaryRole: string;
  roles: string[];
}) {
  const { hiddenCount, label, onOpenRoles, primaryRole, roles } = props;
  const t = useDevetekTranslations();
  const canOpenRoles = roles.length > 1;

  return (
    <div className="flex min-w-0 items-start gap-3 rounded-md border bg-background p-3">
      <UsersIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium uppercase tracking-normal text-muted-foreground">
          {label}
        </p>
        <div className="mt-2 flex min-w-0 flex-wrap items-center gap-2">
          <Badge
            variant="secondary"
            className="max-w-full shrink truncate capitalize"
            title={primaryRole}
          >
            {primaryRole}
          </Badge>
          {canOpenRoles && (
            <Button
              size="xs"
              buttonStyle="outline"
              buttonColor="secondary"
              onClick={onOpenRoles}
              aria-label={t('page.profile.sidebar.viewRoleDetails')}
              title={t('page.profile.sidebar.viewRoleDetails')}
            >
              <ListChecksIcon />
              {t('page.profile.sidebar.moreRoles', { count: hiddenCount })}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export function ConnectionCard(props: {
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
      <StatusPill
        tone={connected ? 'success' : 'neutral'}
        label={
          statusLabel ||
          (connected
            ? t('page.profile.connections.connected')
            : t('page.profile.connections.notConnected'))
        }
      />
    </div>
  );
}

export function WorkspaceRow(props: {
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
  const roleSummary = getWorkspaceRoleSummary(workspace, t);

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
          {roleSummary.primaryRole}
        </Badge>
        {roleSummary.hiddenCount > 0 && (
          <Badge variant="secondary" className="shrink-0">
            +{roleSummary.hiddenCount}
          </Badge>
        )}
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

export function EmptyWorkspaces() {
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
