import { lazy } from 'react';

import { registerModal } from '@/services/modal';

const WorkerTokenModal = lazy(() => import('./WorkerTokenModal'));

export const useWorkerTokenModal = registerModal(WorkerTokenModal);
