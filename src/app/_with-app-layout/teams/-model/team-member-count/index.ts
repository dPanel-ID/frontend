import { ApiOrganization } from '@/shared/api';

/**
 * How many members a team has. Team listings carry no count, so each team
 * asks for one member and reads the total, as server cards fetch their own
 * live usage.
 */
export function useTeamMemberCount(teamId: string) {
  const [response] = ApiOrganization.Detail.$Id.Members.useGet({
    id: teamId,
    page: 1,
    pageSize: 1,
  });

  if (response.$status !== 'success') {
    return { loading: response.$status !== 'failed', count: undefined };
  }
  return { loading: false, count: response.pagination.total_item };
}
