import type { DoRequestRecipe } from '@/shared/libs/api-client/rules/types';

import { apiDoPost } from '../libs/api-client';

import type { DTOs } from '.';

export interface RecipeParams {
  serverId: string;
  moduleName: string;
}

export interface Payload {
  dry_run: boolean;
}

export function recipe(params: RecipeParams): DoRequestRecipe {
  const { serverId, moduleName } = params;

  return {
    method: 'POST',
    url: `/v1/server/${serverId}/modules/${encodeURIComponent(moduleName)}/adopt`,
  };
}

export interface Dto {
  module: string;
  display_name: string;
  service: string;
  version?: string;
  port: number;
  dry_run: boolean;
  adopted: boolean;
  installation?: DTOs.ModuleInstallationV1;
}

export function doPost(params: RecipeParams & { payload: Payload }) {
  const { payload, ...recipeParams } = params;

  return apiDoPost<Dto>({
    ...recipe(recipeParams),
    data: payload,
  });
}
