import { lazy } from 'react';

import { registerModal } from '@/services/modal';

const WorkspaceRolesDetailModal = lazy(() => import('./view'));

export const useWorkspaceRolesDetailModal = registerModal(
  WorkspaceRolesDetailModal,
);
