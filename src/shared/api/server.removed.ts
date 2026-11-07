import { useApiGet } from '@/shared/libs/api-client';
import type {
  GetRequestRecipe,
  WithApiGetOptions,
} from '@/shared/libs/api-client/rules/types';

// =============================================================================
//   Recipe
// =============================================================================

export function recipe(): GetRequestRecipe {
  return { url: 'v1/server/removed' };
}

// =============================================================================
//   Method
// =============================================================================

/** A removed server whose agent called dPanel again in the last 7 days. */
export interface ReturnedServerDto {
  machine_id: string;
  hostname?: string;
  /** "deleted" or "forgotten". */
  reason?: string;
  removed_at?: string;
  last_contact_at?: string;
  contact_count?: number;
}

export type Dto = ReturnedServerDto[];

export function useGet(params: WithApiGetOptions = {}) {
  return useApiGet<Dto>(recipe(), params.options);
}
