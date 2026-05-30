import { lazy } from 'react';

import { registerModal } from '@/services/modal';

const OrganizationMemberRolesModal = lazy(() => import('./view'));

export const useOrganizationMemberRolesModal = registerModal(
  OrganizationMemberRolesModal,
);
