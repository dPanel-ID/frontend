import { lazy } from 'react';

import { registerSidepanel } from '@/services/sidepanel';

const ServerLogEntrySidepanel = lazy(() => import('./view'));

export const useServerLogEntrySidepanel = registerSidepanel(
  ServerLogEntrySidepanel,
);

export { default as LogEntryDetails } from './view/LogEntryDetails';
