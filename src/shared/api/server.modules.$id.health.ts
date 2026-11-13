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

/** The release a module really runs, read from its package on the server. */
export interface ModuleVersionDto {
  package: string;
  /** Release installed, such as 12.3.3; empty when the package is gone. */
  installed?: string;
  package_version?: string;
  /** Release chosen at install, such as 12.3. */
  chosen?: string;
  /** The server runs another release than the one chosen. */
  mismatch: boolean;
  missing?: boolean;
}

export interface ModuleHealthDto {
  installation_id: string;
  module_name: string;
  needs_attention: boolean;
  services: ModuleServiceDto[];
  version?: ModuleVersionDto;
}

export interface Dto {
  /** False when the server's agent could not be asked. */
  checked: boolean;
  /** False when the agent cannot read package versions (older agent). */
  versions_checked?: boolean;
  modules: ModuleHealthDto[];
}

export function useGet(params: WithApiGetOptions<RecipeParams>) {
  return useApiGet<Dto>(recipe(params), params.options);
}
