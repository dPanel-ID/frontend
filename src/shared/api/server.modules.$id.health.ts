import { useApiGet } from '@/shared/libs/api-client';
import type {
  GetRequestRecipe,
  WithApiGetOptions,
} from '@/shared/libs/api-client/rules/types';

export interface RecipeParams {
  serverId: string;
}

export function recipe(params: RecipeParams): GetRequestRecipe {
  return { url: `/v1/server/${params.serverId}/modules/health` };
}

/** running, starting, failed, stopped or missing. */
export type ModuleServiceState =
  | 'running'
  | 'starting'
  | 'failed'
  | 'stopped'
  | 'missing';

export interface ModuleServiceDto {
  unit: string;
  state: ModuleServiceState;
  active?: string;
  sub?: string;
}

export interface ModuleHealthDto {
  installation_id: string;
  module_name: string;
  needs_attention: boolean;
  services: ModuleServiceDto[];
}

export interface Dto {
  /** False when the server's agent could not be asked. */
  checked: boolean;
  modules: ModuleHealthDto[];
}

export function useGet(params: WithApiGetOptions<RecipeParams>) {
  return useApiGet<Dto>(recipe(params), params.options);
}
