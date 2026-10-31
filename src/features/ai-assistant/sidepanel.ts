import { lazy } from 'react';

import { registerSidepanel } from '@/services/sidepanel';

const AssistantSidepanel = lazy(() => import('./view'));

export const useAssistantSidepanel = registerSidepanel(AssistantSidepanel);
