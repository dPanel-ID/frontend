import { lazy } from 'react';

import { registerSidepanel } from '@/services/sidepanel';

export * as LoadBalancerCreationRules from './-rules';
export {
  schemaCreationForm as schemaLoadBalancerCreationForm,
  type CreationFormValues as LoadBalancerCreationFormValues,
} from './-rules/schemas/form';

const LoadBalancerCreationSidepanel = lazy(() => import('./-view'));

export const useLoadBalancerCreationSidepanel = registerSidepanel(
  LoadBalancerCreationSidepanel,
);
