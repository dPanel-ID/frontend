import { lazy } from 'react';

import { registerModal } from '@/services/modal';

const CreateTokenModal = lazy(() => import('./CreateTokenModal'));

export const useCreateTokenModal = registerModal(CreateTokenModal);
