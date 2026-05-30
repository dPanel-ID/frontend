import { useDevetekTranslations } from '@/services/i18n';

import LayoutAutoGridList from '@/shared/presentation/atoms/LayoutAutoGridList';
import { EmptyState } from '@/shared/presentation/organisms/EmptyState';
import { buildResponseView } from '@/widgets/response-view-builder';

import { MemberListState } from '../-presentation/MemberListState';
import { useEmit } from '../../-model/events';
import { useFilterModel } from '../../-model/filters';
import { useMembersDataModel } from '../../-model/members-data';

import MemberCard from './MemberCard';
import MemberTable from './MemberTable';
import type { MemberTableData } from './MemberTable';

const ADMIN_ROLE_KEYS = ['admin', 'administrator', 'owner'];
const OWNER_ROLE_KEYS = ['owner'];

function normalizeRole(role?: string | null) {
  return role?.trim().toLowerCase() ?? '';
}

function roleMatches(role: string, roleKeys: string[]) {
  return roleKeys.some(
    (roleKey) =>
      role === roleKey ||
      role.endsWith(`-${roleKey}`) ||
      role.endsWith(`:${roleKey}`) ||
      role.endsWith(`-role-${roleKey}`) ||
      role.endsWith(`/${roleKey}`),
  );
}

function isRole(
  roleId: string | null | undefined,
  roleName: string | null | undefined,
  roleKeys: string[],
) {
  const candidates = [normalizeRole(roleId), normalizeRole(roleName)];

  return candidates.some((role) => {
    if (!role) return false;
    return roleMatches(role, roleKeys);
  });
}

function isAdminRole(roleId?: string | null, roleName?: string | null) {
  return isRole(roleId, roleName, ADMIN_ROLE_KEYS);
}

function isOwnerRole(roleId?: string | null, roleName?: string | null) {
  return isRole(roleId, roleName, OWNER_ROLE_KEYS);
}

function uniqueStrings(values: Array<string | null | undefined>) {
  return [...new Set(values.filter(Boolean) as string[])];
}

export default buildResponseView({
  useResponse: () => useMembersDataModel((s) => s.members),
  fallbackError: MemberListState.Error,
  fallbackLoading: MemberListState.Loading,
  render: function Render(props) {
    const { list } = props;

    const [derivedViewMode] = useFilterModel((s) => [s.derivedViewMode]);
    const t = useDevetekTranslations();
    const emit = useEmit();

    if (list.length < 1) {
      return (
        <EmptyState
          title={t('page.teamDetail.emptyState.title')}
          message={t('page.teamDetail.emptyState.message')}
          ctaText={t('page.teamDetail.emptyState.cta')}
          ctaOnClick={() => emit('@team-members/add-member', undefined)}
        />
      );
    }

    const tableData: MemberTableData[] = list.flatMap((member) => {
      const { id, user, role, roles, role_id, role_ids, user_id, created_at } =
        member;
      if (!id) return [];

      const roleName = role?.name ?? null;
      const derivedRoleIds = uniqueStrings([
        ...(role_ids ?? []),
        role_id,
        role?.id,
        ...(roles ?? []).map((item) => item.id),
      ]);
      const roleLabels = uniqueStrings([
        ...(roles ?? []).map((item) => item.name || item.id),
        roleName || role_id,
      ]);
      const roleCandidates = uniqueStrings([...derivedRoleIds, ...roleLabels]);

      return [
        {
          id,
          userId: user_id ?? (user?.id == null ? null : String(user.id)),
          fullname: user?.fullname ?? null,
          username: user?.username ?? null,
          email: user?.email ?? null,
          avatarUrl: user?.avatar_url ?? null,
          roleId: role_id ?? role?.id ?? null,
          roleName,
          roleIds: derivedRoleIds,
          roleLabels,
          isAdmin: roleCandidates.some((item) => isAdminRole(item, item)),
          isOwner: roleCandidates.some((item) => isOwnerRole(item, item)),
          joinedAt: created_at ?? null,
        },
      ];
    });

    if (derivedViewMode === 'table') {
      return <MemberTable data={tableData} />;
    }

    return (
      <LayoutAutoGridList viewMode={derivedViewMode as 'grid' | 'list'}>
        {tableData.map((member) => (
          <MemberCard key={member.id} data={member} />
        ))}
      </LayoutAutoGridList>
    );
  },
});
