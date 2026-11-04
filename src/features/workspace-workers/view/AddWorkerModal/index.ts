import { lazy } from 'react';

import { registerModal } from '@/services/modal';

const AddWorkerModal = lazy(() => import('./AddWorkerModal'));

export const useAddWorkerModal = registerModal(AddWorkerModal);
