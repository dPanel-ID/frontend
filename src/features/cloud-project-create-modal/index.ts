import { lazy } from 'react';

import { registerModal } from '@/services/modal';

const Lazy = lazy(() => import('./view'));

export const useCloudProjectCreateModal = registerModal(Lazy);

export type { CloudProjectCredentialTarget } from './view/types';
