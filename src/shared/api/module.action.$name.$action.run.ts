import type { DoRequestRecipe } from '@/shared/libs/api-client/rules/types';

import { apiDoPost } from '../libs/api-client';

export interface ModuleRunRefPayload {
  type?: string;
  name?: string;
  expected_commit?: string;
}

export interface ModuleRunPayload {
  server_id: string;
  ref?: ModuleRunRefPayload;
  variables?: Record<string, unknown>;
  persist_variables?: boolean;
  variable_scope?: string;
}

export interface RecipeParams {
  name: string;
  action: string;
  payload: ModuleRunPayload;
}

export interface Dto {
  execution_id: string;
  status: string;
  module: string;
  action: string;
}

export function recipe(params: RecipeParams): DoRequestRecipe {
  return {
    method: 'POST',
    url: `/v1/modules/${params.name}/actions/${params.action}/run`,
    data: params.payload,
  };
}

export function doPost(params: RecipeParams) {
  return apiDoPost<Dto>({
    ...recipe(params),
  });
}
