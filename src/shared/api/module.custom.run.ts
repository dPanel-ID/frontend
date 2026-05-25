import type { DoRequestRecipe } from '@/shared/libs/api-client/rules/types';

import { apiDoPost } from '../libs/api-client';

import type { ModuleRunRefPayload } from './module.action.$name.$action.run';

export interface CustomPlaybookRolePayload {
  name: string;
  variables?: Record<string, unknown>;
}

export interface CustomPlaybookRunPayload {
  server_id: string;
  name: string;
  ref?: ModuleRunRefPayload;
  roles: CustomPlaybookRolePayload[];
  variables?: Record<string, unknown>;
  persist_variables?: boolean;
  variable_scope?: string;
}

export interface RecipeParams {
  payload: CustomPlaybookRunPayload;
}

export interface Dto {
  execution_id: string;
  status: string;
  module: string;
  action: string;
  roles: string[];
}

export function recipe(params: RecipeParams): DoRequestRecipe {
  return {
    method: 'POST',
    url: '/v1/modules/custom/run',
    data: params.payload,
  };
}

export function doPost(params: RecipeParams) {
  return apiDoPost<Dto>({
    ...recipe(params),
  });
}
