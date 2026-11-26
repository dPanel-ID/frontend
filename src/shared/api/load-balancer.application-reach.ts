import { createQueryParams, useApiGet } from '@/shared/libs/api-client';
import type {
  GetRequestRecipe,
  WithApiGetOptions,
} from '@/shared/libs/api-client/rules/types';

// =============================================================================
//   Recipe
// =============================================================================

export interface RecipeParams {
  applicationId: string;
  /** The load balancer's server (the gateway). */
  serverId: string;
}

export function recipe(params: RecipeParams): GetRequestRecipe {
  const queryParams = createQueryParams({
    application_id: params.applicationId,
    server_id: params.serverId,
  });

  return {
    url: `/v2/load-balancer/application-reach?${queryParams.toString()}`,
  };
}

// =============================================================================
//   Method
// =============================================================================

/** Why the API recommends an address mode. */
export type ReachReason =
  | 'same_server'
  | 'shared_private_network'
  | 'shared_public_address'
  | 'no_shared_network'
  | 'network_unknown';

/** One deployment's server, with the address each mode would use. */
export interface ReachTarget {
  machine_id: string;
  network_known: boolean;
  port: string;
  private_address?: string;
  registered_address?: string;
  same_server: boolean;
  server_name?: string;
  shared_private_network: boolean;
  shared_public_address: boolean;
}

/** How a gateway would reach an application, by address mode. */
export interface Dto {
  reason: ReachReason;
  recommended_mode: 'registered' | 'private';
  targets: ReachTarget[];
}

export function useGet(params: WithApiGetOptions<RecipeParams>) {
  return useApiGet<Dto>(recipe(params), params.options);
}
