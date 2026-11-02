import { lazy } from 'react';

import { registerSidepanel } from '@/services/sidepanel';

const ServerFirewallRuleSidepanel = lazy(() => import('./view'));

export const useServerFirewallRuleSidepanel = registerSidepanel(
  ServerFirewallRuleSidepanel,
);
