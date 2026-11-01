import { useApiGet } from '@/shared/libs/api-client';
import type {
  GetRequestRecipe,
  WithApiGetOptions,
} from '@/shared/libs/api-client/rules/types';

// =============================================================================
//   Recipe
// =============================================================================

export interface RecipeParams {
  loadBalancerId: string;
}

export function recipe(params: RecipeParams): GetRequestRecipe {
  const { loadBalancerId } = params;

  return {
    url: `/v2/load-balancer/${loadBalancerId}/certificate`,
  };
}

// =============================================================================
//   Method
// =============================================================================

/**
 * none: plain HTTP. expiring: 14 days or less left, so renewal has been
 * failing. missing: no certificate on the server yet.
 */
export type CertificateStatus =
  | 'none'
  | 'valid'
  | 'expiring'
  | 'expired'
  | 'missing';

/** The certificate a load balancer serves, read from its server. */
export interface Dto {
  days_left?: number;
  domain: string;
  engine: string;
  issuer?: string;
  load_balancer_id: string;
  message?: string;
  not_after?: string;
  not_before?: string;
  status: CertificateStatus;
}

export function useGet(params: WithApiGetOptions<RecipeParams>) {
  return useApiGet<Dto>(recipe(params), params.options);
}
