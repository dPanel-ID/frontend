import { ApiOrganization } from '@/shared/api';
import { useAdapter } from '@/shared/libs/api-client';
import buildSelector from '@/shared/libs/react-factories/buildSelector';

import { teamAccessOf } from '../../../-lib/team-roles';
import { useSubscribe } from '../events';
import { useFilterModel } from '../filters';

export const [MembersDataModelProvider, useMembersDataModel] = buildSelector(
  'TeamsMembersDataModel',
)((props: { orgId: string }) => {
  const { orgId } = props;
  const { currentPage } = useFilterModel();

  const [response, refresh] = ApiOrganization.Detail.$Id.Members.useGet({
    id: orgId,
    page: currentPage,
    pageSize: 10,
  });
  const [responseOrganization, refreshOrganization] =
    ApiOrganization.Detail.$Id.useGet({
      id: orgId,
    });

  useSubscribe('@team-members/data--refresh', () => {
    refresh();
    refreshOrganization();
  });

  return {
    organization: useAdapter(responseOrganization, (raw) => ({
      name: raw.name ?? null,
      description: raw.description ?? null,
      status: raw.status,
      createdAt: raw.created_at,
    })),
    members: useAdapter(response, (raw) => ({
      list: raw.org_peoples ?? [],
      pagination: raw.pagination,
      /** Members in the whole team, not only on this page. */
      total: raw.pagination.total_item,
      /** The signed-in user's access in this team. */
      myAccess: raw.workspace?.roles
        ? teamAccessOf(raw.workspace.roles)
        : undefined,
      orgName:
        raw.organization?.name ??
        raw.org_peoples?.[0]?.organization?.name ??
        null,
      orgDescription:
        raw.organization?.description ??
        raw.org_peoples?.[0]?.organization?.description ??
        null,
    })),
    orgId,
    refresh,
  };
});
