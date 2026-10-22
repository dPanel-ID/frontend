import { lazy } from 'react';

import { registerSidepanel } from '@/services/sidepanel';

const UserEditSidepanel = lazy(() => import('./view'));

export const useUserEditSidepanel = registerSidepanel(UserEditSidepanel);
