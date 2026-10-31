import { Trash2Icon, UserCogIcon } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

import { cn } from '@/shared/libs/tailwind/cn';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/shared/presentation/atoms/Avatar';

import { useEmit } from '../../-model/events';
import { TeamAccessBadge } from '../../../-presentation/TeamAccessBadge';
import { teamInitials } from '../../../-presentation/TeamMark';

import type { MemberRow } from './types';

const VISIBLE_ROLES = 2;

/** Avatar, name, handle and email of a member. */
export function MemberIdentity(props: { member: MemberRow }) {
  const { member } = props;

  return (
    <div className="flex min-w-0 items-center gap-3">
      <Avatar className="size-9 shrink-0">
        {member.avatarUrl && (
          <AvatarImage src={member.avatarUrl} alt={member.name} />
        )}
        <AvatarFallback className="bg-violet-500/15 text-xs font-semibold text-violet-700 dark:text-violet-300">
          {teamInitials(member.name)}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold">{member.name}</p>
        <p className="truncate text-xs text-muted-foreground">
          {[member.username && `@${member.username}`, member.email]
            .filter(Boolean)
            .join(' · ')}
        </p>
      </div>
    </div>
  );
}

/**
 * The member's access, then the named roles behind it. Owners and admins are
 * plain from the badge; the rest of the roles sit in a tooltip past two.
 */
export function MemberRoles(props: { member: MemberRow }) {
  const { member } = props;
  const t = useDevetekTranslations('page.teamDetail');

  const roles = member.roleLabels.filter(
    (label) => label.toLowerCase() !== member.access,
  );
  const visible = roles.slice(0, VISIBLE_ROLES);
  const hidden = roles.slice(VISIBLE_ROLES);

  return (
    <div className="flex min-w-0 flex-wrap items-center gap-1">
      <TeamAccessBadge access={member.access} />
      {visible.map((label) => (
        <span
          key={label}
          className="max-w-40 truncate rounded-md border bg-background px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground"
        >
          {label}
        </span>
      ))}
      {hidden.length > 0 && (
        <span
          title={hidden.join(', ')}
          className="rounded-md border border-dashed px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground"
        >
          {t('moreRoles', { count: hidden.length })}
        </span>
      )}
    </div>
  );
}

/** Manage roles or remove, as icon buttons in the servers' style. */
export function MemberActions(props: {
  member: MemberRow;
  className?: string;
}) {
  const { className, member } = props;
  const emit = useEmit();
  const t = useDevetekTranslations('page.teamDetail');

  return (
    <div className={cn('flex items-center justify-end gap-1.5', className)}>
      <ActionIcon
        icon={UserCogIcon}
        title={t('manageRoles')}
        onClick={() =>
          emit('@team-members/member--manage-roles', {
            id: member.id,
            name: member.name,
            roleIds: member.roleIds,
          })
        }
      />
      <ActionIcon
        icon={Trash2Icon}
        title={t('removeFromTeam')}
        tone="danger"
        onClick={() =>
          emit('@team-members/member--delete', {
            id: member.id,
            name: member.name,
          })
        }
      />
    </div>
  );
}

function ActionIcon(props: {
  icon: LucideIcon;
  title: string;
  tone?: 'default' | 'danger';
  onClick: () => void;
}) {
  const { icon: Icon, onClick, title, tone = 'default' } = props;

  return (
    <button
      type="button"
      aria-label={title}
      title={title}
      onClick={onClick}
      className={cn(
        'inline-flex size-8 items-center justify-center rounded-lg border bg-background/50 transition-colors hover:bg-border/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35',
        tone === 'danger'
          ? 'text-red-500 hover:border-red-400/40 hover:bg-red-500/10 dark:text-red-300'
          : 'text-primary/65 hover:text-primary',
      )}
    >
      <Icon className="size-4" />
    </button>
  );
}
