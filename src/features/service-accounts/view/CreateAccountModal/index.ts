import { lazy } from 'react';

import { registerModal } from '@/services/modal';

const CreateAccountModal = lazy(() => import('./CreateAccountModal'));

export const useCreateAccountModal = registerModal(CreateAccountModal);
