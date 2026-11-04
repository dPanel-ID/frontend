import { WorkersCard } from '@/features/workspace-workers';

import { useMembersDataModel } from '../../-model/members-data';

/**
 * This team's workers. Requests name the team, so the card acts on it even
 * when the app shell has another workspace selected. Owners and admins
 * change it; everyone else, and anyone whose access is not known yet, reads.
 */
export default function Workers() {
  const { members, orgId } = useMembersDataModel();

  const myAccess = members.$status === 'success' ? members.myAccess : undefined;
  const canManage = myAccess === 'owner' || myAccess === 'admin';

  return (
    <WorkersCard workspaceId={orgId} canManage={canManage} accent="violet" />
  );
}
