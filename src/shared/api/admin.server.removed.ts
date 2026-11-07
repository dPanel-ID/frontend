import { useApiGet } from '@/shared/libs/api-client';
import type {
  GetRequestRecipe,
  WithApiGetOptions,
} from '@/shared/libs/api-client/rules/types';

import type { ReturnedServerDto } from './server.removed';

// =============================================================================
//   Recipe
// =============================================================================

export function recipe(): GetRequestRecipe {
  return { url: '/v2/admin/servers/removed' };
}

// =============================================================================
//   Method
// =============================================================================

/** A removed server of any workspace whose agent called in the last 7 days. */
export interface AdminReturnedServerDto extends ReturnedServerDto {
  workspace_type?: string;
  workspace_id?: string;
  /** When its old agent was last sent agent.upgrade. */
  upgrade_offered_at?: string;
}

export type Dto = AdminReturnedServerDto[];

export function useGet(params: WithApiGetOptions = {}) {
  return useApiGet<Dto>(recipe(), params.options);
}
