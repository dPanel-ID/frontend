import type { DoRequestRecipe } from '@/shared/libs/api-client/rules/types';

import { apiDoPost } from '../libs/api-client';

import type { DTOs } from '.';

// =============================================================================
//   Recipe
// =============================================================================

export type MachineCreatePayloadV1 = Omit<
  DTOs.MachineV1,
  'cloud_id' | 'secret_id'
> & {
  cloud_project_id?: number | string;
  cpu_core?: number;
  default_password?: string;
  disk?: number;
  os_template?: string;
  secret_id?: number | string;
  private_subnet?: string;
  ram?: number;
  vm?: {
    billing_account_id?: number;
    console_password?: string;
    cycle?: string;
    description?: string;
    disks?: number;
    keypair_id?: number;
    keypair_name?: string;
    disk_size_gb?: number;
    machine_type?: string;
    name?: string;
    network_uuid?: string;
    os_name?: string;
    os_template_id?: string;
    os_version?: string;
    pay_invoice_with_cc?: 'no' | 'yes';
    password?: string;
    product_id?: number;
    promocode?: string;
    public_key?: string;
    public_keys?: string[];
    ram?: number;
    region?: string;
    reserve_public_ip?: boolean;
    select_os?: string;
    source_image?: string;
    ssh_and_console_user?: string;
    subnetwork?: string;
    username?: string;
    vcpu?: number;
    vm_name?: string;
    zone?: string;
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
