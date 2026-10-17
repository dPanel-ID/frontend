import { lazy } from 'react';

import { registerSidepanel } from '@/services/sidepanel';

const ServerNetworksSidepanel = lazy(() => import('./view'));

export const useServerNetworksSidepanel = registerSidepanel(
  ServerNetworksSidepanel,
);

/** The same panel, rendered inline by a page; wrap it in Suspense. */
export const ServerNetworksPanel = ServerNetworksSidepanel;
