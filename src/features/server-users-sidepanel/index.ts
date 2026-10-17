import { lazy } from 'react';

import { registerSidepanel } from '@/services/sidepanel';

const ServerUsersSidepanel = lazy(() => import('./view'));

export const useServerUsersSidepanel = registerSidepanel(ServerUsersSidepanel);

/** The same panel, rendered inline by a page; wrap it in Suspense. */
export const ServerUsersPanel = ServerUsersSidepanel;
