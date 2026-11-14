import { processError } from '@/shared/libs/api-client/lib/processor';
import type {
  DoRequestRecipe,
  PureResponse,
} from '@/shared/libs/api-client/rules/types';
import type { ExplicitTarget } from '@/shared/rules/host-group';

import { apiDoPost } from '../libs/api-client';

import { parseHostGroupModuleActionResponsePayload } from './host-group.parsers';

import type { DTOs } from '.';

export interface ModuleRunRefPayload {
  type?: string;
  name?: string;
  expected_commit?: string;
}

export interface ModuleRunPayload {
  server_id?: string;
  target?: ExplicitTarget;
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
  execution_id?: string;
  operation_id?: string;
  status?: string;
  module?: string;
  action?: string;
  target?: ExplicitTarget;
  repository?: DTOs.IACRepositoryV1;
}

export type ModuleRunResponse =
  | Dto
  | DTOs.HostGroupModuleActionResponseV1;

export function recipe(params: RecipeParams): DoRequestRecipe {
  return {
    method: 'POST',
    url: `/v1/modules/${params.name}/actions/${params.action}/run`,
    data: params.payload,
  };
}

export function doPost(
  params: RecipeParams,
): Promise<PureResponse<ModuleRunResponse>> {
  return apiDoPost<unknown>({
    ...recipe(params),
  }).then((response) => {
    if (response.$status !== 'success') {
      return response;
    }

    const hasLegacyServerId =
      typeof params.payload.server_id === 'string' &&
      params.payload.server_id.trim().length > 0;
    const isHostGroupTarget =
      !hasLegacyServerId && params.payload.target?.type === 'hostgroup';

    if (!isHostGroupTarget) {
      return response;
    }

    try {
      return {
        $status: 'success' as const,
        ...parseHostGroupModuleActionResponsePayload(response),
      };
    } catch (error) {
      return {
        $status: 'failed' as const,
        ...processError(error),
      };
    }
  });
}
