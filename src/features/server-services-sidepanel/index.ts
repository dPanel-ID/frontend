import { lazy } from 'react';

import { registerSidepanel } from '@/services/sidepanel';

const ServerServicesSidepanel = lazy(() => import('./view'));

export const useServerServicesSidepanel = registerSidepanel(
  ServerServicesSidepanel,
);

/** The same panel, rendered inline by a page; wrap it in Suspense. */
export const ServerServicesPanel = ServerServicesSidepanel;
