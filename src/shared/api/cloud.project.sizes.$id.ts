import { useApiGet } from '@/shared/libs/api-client';
import type {
  GetRequestRecipe,
  WithApiGetOptions,
} from '@/shared/libs/api-client/rules/types';

// =============================================================================
//   Recipe
// =============================================================================

export interface RecipeParams {
  cloudProjectId: string;
  /** Region for AWS and DigitalOcean, zone for Alibaba Cloud and Tencent. */
  zone?: string;
}

export function recipe(params: RecipeParams): GetRequestRecipe {
  const { cloudProjectId, zone } = params;
  const queryString = zone ? `?zone=${encodeURIComponent(zone)}` : '';

  return {
    url: `/v1/cloud/project/detail/${cloudProjectId}/sizes${queryString}`,
  };
}

// =============================================================================
//   Method
// =============================================================================

/**
 * flexible: CPU and memory are sent as numbers or a custom type.
 * fixed: each pair resolves to the cheapest instance type that fits.
 * catalog: the provider keeps its own product picker.
 */
export type SizeMode = 'flexible' | 'fixed' | 'catalog';

export interface SizeDisk {
  configurable: boolean;
  default_gb?: number;
  max_gb?: number;
  min_gb?: number;
  step_gb?: number;
}

/** One standard CPU and memory pair the provider can serve. */
export interface SizeChoice {
  memory_gb: number;
  rounded_up: boolean;
  /** Resolved instance type; empty when CPU and memory are sent as numbers. */
  value?: string;
  vcpu: number;
}

/** One instance type a pair resolves to, with its real specs. */
export interface SizeType {
  disk_gb?: number;
  family?: string;
  label: string;
  memory_gb: number;
  note?: string;
  price_monthly?: number;
  value: string;
  vcpu: number;
}

export interface Dto {
  cpu_options?: number[];
  disk?: SizeDisk;
  items?: SizeType[];
  memory_gb_options?: number[];
  mode?: SizeMode;
  provider?: string;
  sizes?: SizeChoice[];
}

export function useGet(params: WithApiGetOptions<RecipeParams>) {
  return useApiGet<Dto>(recipe(params), params.options);
}
