import type { ComponentProps } from 'react';

import {
  CrownIcon,
  MailIcon,
  ShieldCheckIcon,
  Trash2Icon,
  UserCogIcon,
  UserIcon,
} from 'lucide-react';

import { useDevetekLocale, useDevetekTranslations } from '@/services/i18n';

import { getDistanceFromNow } from '@/shared/libs/browser/date';
import { Badge } from '@/shared/presentation/atoms/Badge';
import IconLastDateActive from '@/shared/presentation/icons/LastDateActive';
import { ResourceCard } from '@/widgets/resource-card';

import { useEmit } from '../../../-model/events';
import type { MemberTableData } from '../MemberTable';

export interface MemberCardProps {
  data: MemberTableData;
}

function getDisplayName(data: MemberTableData) {
  return data.fullname || data.username || data.email || data.userId || '—';
}

function getRoleLabel(
  data: MemberTableData,
  t: ReturnType<typeof useDevetekTranslations>,
) {
  if (data.isOwner) return t('page.teamDetail.roleOwner');
  if (data.isAdmin) return t('page.teamDetail.roleAdmin');

  const roleName = data.roleName?.trim();
  const roleId = data.roleId?.trim();
  const explicitRole = roleName || roleId;

  if (!explicitRole) return t('page.teamDetail.roleMember');
  if (explicitRole.toLowerCase().endsWith('-role-member')) {
    return t('page.teamDetail.roleMember');
  }

  return explicitRole;
}

function getRoleLabels(
  data: MemberTableData,
  t: ReturnType<typeof useDevetekTranslations>,
) {
  if (data.roleLabels.length > 0) return data.roleLabels;

  return [getRoleLabel(data, t)];
}

export default function MemberCard(props: MemberCardProps) {
  const { data } = props;
  const {
    id,
    fullname,
    username,
    email,
    avatarUrl,
    isAdmin,
    isOwner,
    joinedAt,
  } = data;

  const emit = useEmit();
  const t = useDevetekTranslations();
  const locale = useDevetekLocale();

  const displayName = getDisplayName(data);
  const joinedAtRelative = joinedAt
    ? getDistanceFromNow(joinedAt, locale)
    : null;
  const RoleIcon = isOwner ? CrownIcon : isAdmin ? ShieldCheckIcon : UserIcon;
  const roleHint = isOwner
    ? t('page.teamDetail.roleOwnerHint')
    : isAdmin
      ? t('page.teamDetail.roleAdminHint')
      : t('page.teamDetail.roleMemberHint');
  const roleLabels = getRoleLabels(data, t);
  const visibleRoles = roleLabels.slice(0, 2);
  const hiddenCount = Math.max(roleLabels.length - visibleRoles.length, 0);

  type Actions = ComponentProps<typeof ResourceCard.Compact.Actions>['actions'];
  const actions: Actions = [
    {
      label: t('page.teamDetail.manageRoles'),
      icon: UserCogIcon,
      onClick: () =>
        emit('@team-members/member--manage-roles', {
          id,
          name: displayName,
          roleIds: data.roleIds,
        }),
    },
    {
      variant: 'destructive',
      label: t('page.teamDetail.remove'),
      icon: Trash2Icon,
      onClick: () =>
        emit('@team-members/member--delete', {
          id,
          name: displayName,
        }),
    },
  ];

  return (
    <ResourceCard.Compact>
      <ResourceCard.Compact.Main className="flex-col items-center text-center gap-y-2.5 pb-2">
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 shrink-0 overflow-hidden ring-2 ring-primary/5">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={username ?? ''}
              className="size-12 object-cover"
            />
          ) : (
            <UserIcon className="size-6 text-primary/60" />
          )}
        </div>
        <div className="w-full flex flex-col items-center gap-0.5 overflow-hidden">
          <p className="font-semibold text-xs sm:text-sm break-all line-clamp-2 leading-snug w-full">
            {displayName}
          </p>
          {username && fullname && (
            <em className="text-primary/50 text-[0.6rem] not-italic">
              @{username}
            </em>
          )}
          {email && (
            <p className="text-primary/40 text-[0.6rem] flex items-center justify-center gap-0.5 mt-0.5 w-full">
              <MailIcon className="size-2.5 shrink-0" />
              <span className="truncate">{email}</span>
            </p>
          )}
          <div className="mt-1 flex max-w-full flex-wrap justify-center gap-1">
            {visibleRoles.map((label, index) => (
              <Badge
                key={`${label}-${index}`}
                variant={isAdmin ? 'default' : 'outline'}
                className="max-w-full"
                title={roleHint}
              >
                {index === 0 && <RoleIcon className="shrink-0" />}
                <span className="truncate">{label}</span>
              </Badge>
            ))}
            {hiddenCount > 0 && (
              <Badge variant="secondary">
                {t('page.teamDetail.moreRoles', { count: hiddenCount })}
              </Badge>
            )}
          </div>
        </div>
      </ResourceCard.Compact.Main>
      <ResourceCard.Compact.Actions
        visibleActionOnlyIcon
        actions={actions}
        labelMore={t('common.actions.more')}
      />
      {joinedAtRelative && (
        <ResourceCard.Compact.Footnote>
          <ResourceCard.Compact.Footnote.Item
            icon={IconLastDateActive}
            label={t('page.teamDetail.joinedLabel')}
            value={`${t('page.teamDetail.joinedDateLabel')}: ${joinedAtRelative}`}
          />
        </ResourceCard.Compact.Footnote>
      )}
    </ResourceCard.Compact>
  );
}
