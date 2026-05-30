import type { DoRequestRecipe } from '@/shared/libs/api-client/rules/types';

import { apiDoPost } from '../libs/api-client';

import type { DTOs } from '.';

// =============================================================================
//   Recipe
// =============================================================================

export type MachineCreatePayloadV1 = DTOs.MachineV1 & {
  cloud_project_id?: string;
  cpu_core?: number;
  default_password?: string;
  disk?: number;
  os_template?: string;
  private_subnet?: string;
  ram?: number;
  vm?: {
    billing_account_id?: number;
    disks?: number;
    name?: string;
    network_uuid?: string;
    os_name?: string;
    os_template_id?: string;
    os_version?: string;
    password?: string;
    public_key?: string;
    public_keys?: string[];
    ram?: number;
    region?: string;
    reserve_public_ip?: boolean;
    username?: string;
    vcpu?: number;
  };
  vpc_id?: string;
};

export interface RecipeParams {
  payload: MachineCreatePayloadV1;
}

export function recipe(params: RecipeParams): DoRequestRecipe {
  const { payload } = params;

  return {
    method: 'POST',
    url: `/v1/server/create`,
    data: payload,
  };
}

// =============================================================================
//   Method
// =============================================================================

export interface Response {
  id: number | string;
}

export function doPost(params: RecipeParams) {
  return apiDoPost<Response>({
    ...recipe(params),
  });
}
