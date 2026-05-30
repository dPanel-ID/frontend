import { useParams } from '@tanstack/react-router';

import { useOrganizationMemberRolesModal } from '@/features/organization-member-roles-modal';

import useHandler from '@/shared/libs/react-hooks/useHandler';

import type { MemberManageRolesPayload as Payload } from '../-rules/usecase-types';

interface Params {
  onSuccess: () => void;
}

export default function useManageMemberRolesUsecase(params: Params) {
  const { onSuccess } = params;

  const [openModal] = useOrganizationMemberRolesModal();
  const { id: orgId } = useParams({ from: '/_with-app-layout/teams/$id/' });

  const handleUsecase = useHandler((payload: Payload) => {
    openModal({
      organizationId: orgId,
      memberId: payload.id,
      memberName: payload.name,
      initialRoleIds: payload.roleIds,
      onSubmitSuccess: onSuccess,
    });
  });

  return [handleUsecase] as const;
}
