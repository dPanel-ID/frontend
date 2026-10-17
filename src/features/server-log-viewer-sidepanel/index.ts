import { lazy } from 'react';

import { registerSidepanel } from '@/services/sidepanel';

const ServerLogViewerSidepanel = lazy(() => import('./view'));

export const useServerLogViewerSidepanel = registerSidepanel(
  ServerLogViewerSidepanel,
);

/** The log browser without the drawer, for embedding in a page. */
export const ServerLogViewer = lazy(() =>
  import('./view').then((module) => ({ default: module.ServerLogViewer })),
);
