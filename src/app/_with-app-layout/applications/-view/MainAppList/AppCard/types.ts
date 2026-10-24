import type { ApplicationCard } from '@/entities/application/rules/schema';

import type { AppLoadBalancer } from '../../../-lib/load-balancer-index';

export interface AppCardProps {
  data: ApplicationCard;
  /** Routers pointing at this application, from the page-level lookup. */
  loadBalancers?: AppLoadBalancer[];

  onClickEdit?: () => void;
  onClickDetails?: () => void;
  onClickMigrateOwnership?: () => void;
  onClickDelete?: () => void;
}
