import { lazy } from 'react';

import { registerSidepanel } from '@/services/sidepanel';

const ServerModulesDiscoverSidepanel = lazy(() => import('./view'));

export const useServerModulesDiscoverSidepanel = registerSidepanel(
  ServerModulesDiscoverSidepanel,
);
