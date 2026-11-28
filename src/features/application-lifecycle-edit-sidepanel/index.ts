import { lazy } from 'react';

import { registerSidepanel } from '@/services/sidepanel';

const ApplicationLifecycleEditSidepanel = lazy(() => import('./view'));

export const useApplicationLifecycleEditSidepanel = registerSidepanel(
  ApplicationLifecycleEditSidepanel,
);
