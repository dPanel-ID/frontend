import {
  Building2Icon,
  CalendarIcon,
  Clock3Icon,
  GithubIcon,
  KeyRoundIcon,
  MailIcon,
  PencilIcon,
  ShieldCheckIcon,
  UserIcon,
  UsersIcon,
} from 'lucide-react';

import { useAuthLoggedIn } from '@/services/auth';
import { useAuthModel } from '@/services/auth/model';
import { useDevetekLocale, useDevetekTranslations } from '@/services/i18n';

import { workspaceToOrganizationId } from '@/shared/api/-dtos';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/shared/presentation/atoms/Avatar';
import { Button } from '@/shared/presentation/atoms/ButtonV2';
import { Separator } from '@/shared/presentation/atoms/Separator';
import { StatusPill } from '@/shared/presentation/molecules/StatusPill';

import {
  ConnectionCard,
  DetailRow,
  EmptyWorkspaces,
  WorkspaceRow,
} from '../-presentation/fields';
import {
  formatRelativeDate,
  getInitials,
  getStoredWorkspaceId,
  getWorkspaceId,
} from '../../-lib/profile';

interface PersonalProps {
  onEditProfile: () => void;
}

/** A section of the profile, in the house surface. */
function Section(props: {
  icon: typeof UserIcon;
  title: string;
  description: string;
  aside?: React.ReactNode;
  children: React.ReactNode;
}) {
  const { aside, children, description, icon: Icon, title } = props;

  return (
    <section className="overflow-hidden rounded-2xl border bg-card">
      <header className="flex flex-col gap-3 border-b p-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="flex items-center gap-2 text-base font-bold">
            <Icon className="size-4 text-muted-foreground" aria-hidden />
            {title}
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        </div>
        {aside && <div className="shrink-0">{aside}</div>}
      </header>
      <div className="p-5">{children}</div>
    </section>
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
  const activeWorkspaceId =
    workspaceToOrganizationId(profile?.active_workspace) ||
    getStoredWorkspaceId();
  const activeWorkspace = activeWorkspaceId
    ? workspaces.find((w) => getWorkspaceId(w) === activeWorkspaceId)
    : workspaces.find((w) => w.type === 'personal');

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
    activeWorkspaceId ||
    t('page.profile.workspaces.personal');
  const notProvided = t('page.profile.notProvided');

  return (
    <div className="grid gap-4">
      <Section
        icon={UserIcon}
        title={t('page.profile.identity.title')}
        description={t('page.profile.identity.description')}
        aside={
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
        }
      >
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <Avatar className="size-16 ring-2 ring-sky-400/25">
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
                <p className="truncate text-lg font-bold">{displayName}</p>
                <StatusPill
                  tone="success"
                  label={t('page.profile.identity.active')}
                />
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
        </div>
      </Section>

      <Section
        icon={KeyRoundIcon}
        title={t('page.profile.connections.title')}
        description={t('page.profile.connections.description')}
      >
        <div className="grid gap-3 lg:grid-cols-2">
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
            detail={githubName || t('page.profile.connections.githubFallback')}
            connected={Boolean(githubName)}
          />
        </div>
      </Section>

      <Section
        icon={Building2Icon}
        title={t('page.profile.workspaces.title')}
        description={t('page.profile.workspaces.description')}
        aside={
          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <UsersIcon className="size-3.5" aria-hidden />
            {t('page.profile.access.totalWorkspaces')}: {workspaces.length || 1}
          </span>
        }
      >
        <div className="flex flex-col gap-3">
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
        </div>
      </Section>
    </div>
  );
}
