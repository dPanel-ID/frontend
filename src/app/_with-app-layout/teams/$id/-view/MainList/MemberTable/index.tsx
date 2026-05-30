import type { ComponentProps } from 'react';

import dayjs from 'dayjs';
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
import { Button } from '@/shared/presentation/atoms/ButtonV2';
import IconThreeDots from '@/shared/presentation/icons/ThreeDots';
import ActionPopover from '@/shared/presentation/molecules/ActionPopover';
import { buildResourceTable } from '@/widgets/resource-table';

import { useEmit } from '../../../-model/events';

export interface MemberTableData {
  id: string;
  userId?: string | null;
  fullname?: string | null;
  username?: string | null;
  email?: string | null;
  avatarUrl?: string | null;
  roleId?: string | null;
  roleName?: string | null;
  roleIds: string[];
  roleLabels: string[];
  isAdmin: boolean;
  isOwner: boolean;
  joinedAt?: string | null;
}

export interface MemberTableProps {
  data: MemberTableData[];
}

function getDisplayName(row: MemberTableData) {
  return row.fullname || row.username || row.email || row.userId || '—';
}

function getRoleLabel(
  row: MemberTableData,
  t: ReturnType<typeof useDevetekTranslations>,
) {
  if (row.isOwner) return t('page.teamDetail.roleOwner');
  if (row.isAdmin) return t('page.teamDetail.roleAdmin');

  const roleName = row.roleName?.trim();
  const roleId = row.roleId?.trim();
  const explicitRole = roleName || roleId;

  if (!explicitRole) return t('page.teamDetail.roleMember');
  if (explicitRole.toLowerCase().endsWith('-role-member')) {
    return t('page.teamDetail.roleMember');
  }

  return explicitRole;
}

function getRoleLabels(
  row: MemberTableData,
  t: ReturnType<typeof useDevetekTranslations>,
) {
  if (row.roleLabels.length > 0) return row.roleLabels;

  return [getRoleLabel(row, t)];
}

function RoleBadges(props: { row: MemberTableData }) {
  const { row } = props;
  const t = useDevetekTranslations();
  const Icon = row.isOwner
    ? CrownIcon
    : row.isAdmin
      ? ShieldCheckIcon
      : UserIcon;
  const hint = row.isOwner
    ? t('page.teamDetail.roleOwnerHint')
    : row.isAdmin
      ? t('page.teamDetail.roleAdminHint')
      : t('page.teamDetail.roleMemberHint');
  const description = row.isOwner
    ? t('page.teamDetail.roleOwnerDescription')
    : row.isAdmin
      ? t('page.teamDetail.roleAdminDescription')
      : t('page.teamDetail.roleMemberDescription');
  const roleLabels = getRoleLabels(row, t);
  const visibleRoles = roleLabels.slice(0, 3);
  const hiddenCount = Math.max(roleLabels.length - visibleRoles.length, 0);

  return (
    <div className="flex min-w-0 flex-col justify-center gap-1.5">
      <div className="flex min-w-0 flex-wrap gap-1">
        {visibleRoles.map((label, index) => (
          <Badge
            key={`${label}-${index}`}
            variant={row.isAdmin ? 'default' : 'outline'}
            className="max-w-full"
            title={hint}
          >
            {index === 0 && <Icon className="shrink-0" />}
            <span className="truncate">{label}</span>
          </Badge>
        ))}
        {hiddenCount > 0 && (
          <Badge variant="secondary">
            {t('page.teamDetail.moreRoles', { count: hiddenCount })}
          </Badge>
        )}
      </div>
      <p className="truncate text-[0.6rem] text-primary/50">{description}</p>
    </div>
  );
}

const Table = buildResourceTable<MemberTableData>({
  columns: [
    {
      key: 'avatar',
      width: '32px',
      header: (
        <div className="flex items-center justify-center w-8">
          <UserIcon className="size-4 text-primary/70" />
        </div>
      ),
      content: ({ row }) => (
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 shrink-0">
          {row.avatarUrl ? (
            <img
              src={row.avatarUrl}
              alt={row.username ?? ''}
              className="size-8 rounded-full object-cover"
            />
          ) : (
            <UserIcon className="size-4 text-primary/70" />
          )}
        </div>
      ),
    },
    {
      key: 'name',
      width: '2fr',
      header: '@page.teamDetail.memberColumn',
      content: ({ row }) => (
        <div className="flex flex-col justify-center">
          <p className="text-primary tracking-tight text-sm font-medium">
            {getDisplayName(row)}
          </p>
          {row.username && row.fullname && (
            <em className="text-primary/70 text-[0.6rem]">@{row.username}</em>
          )}
          {row.email && (
            <p className="text-primary/50 text-[0.6rem] flex items-center gap-0.5 mt-0.5">
              <MailIcon className="size-2.5" />
              {row.email}
            </p>
          )}
        </div>
      ),
    },
    {
      key: 'role',
      width: '0.7fr',
      header: '@page.teamDetail.roleColumn',
      content: RoleBadges,
    },
    {
      key: 'joinedAt',
      header: '@page.teamDetail.joinedColumn',
      content: function Content({ row }) {
        const locale = useDevetekLocale();

        if (!row.joinedAt) {
          return <p className="text-primary/40 text-xs">—</p>;
        }

        const relative = getDistanceFromNow(row.joinedAt, locale);

        return (
          <div className="flex flex-col justify-center">
            <p className="text-primary text-sm">{relative}</p>
            <p className="text-primary/70 text-[0.6rem]">
              {dayjs(row.joinedAt).format('YYYY/MM/DD HH:mm')}
            </p>
          </div>
        );
      },
    },
    {
      key: 'actions',
      content: function Content({ row }) {
        const emit = useEmit();
        const t = useDevetekTranslations();
        const displayName = getDisplayName(row);

        type Actions = ComponentProps<typeof ActionPopover>['actions'];
        const actions: Actions = [
          {
            icon: UserCogIcon,
            label: t('page.teamDetail.manageRoles'),
            onClick: () => {
              emit('@team-members/member--manage-roles', {
                id: row.id,
                name: displayName,
                roleIds: row.roleIds,
              });
            },
          },
          {
            variant: 'danger',
            icon: Trash2Icon,
            label: t('page.teamDetail.removeFromTeam'),
            onClick: () => {
              emit('@team-members/member--delete', {
                id: row.id,
                name: displayName,
              });
            },
          },
        ];

        return (
          <div className="flex justify-end items-center gap-x-1">
            <ActionPopover actions={actions}>
              <Button
                size="icon-sm"
                buttonColor="secondary"
                buttonStyle="ghost"
                aria-label={t('common.actions.more')}
                title={t('common.actions.more')}
              >
                <IconThreeDots className="size-4" />
              </Button>
            </ActionPopover>
          </div>
        );
      },
    },
  ],
});

export default function MemberTable(props: MemberTableProps) {
  return <Table data={props.data} />;
}
