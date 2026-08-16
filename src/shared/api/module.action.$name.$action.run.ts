import type { DoRequestRecipe } from '@/shared/libs/api-client/rules/types';
import type { PureResponse } from '@/shared/libs/api-client/rules/types';
import { processError } from '@/shared/libs/api-client/lib/processor';

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
  target?: DTOs.HostGroupActionTargetV1;
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

    if (params.payload.target?.type !== 'hostgroup') {
      return response as PureResponse<Dto>;
    }

    try {
      return {
        $status: 'success' as const,
        ...parseHostGroupModuleActionResponsePayload(response),
      } as PureResponse<DTOs.HostGroupModuleActionResponseV1>;
    } catch (error) {
      return {
        $status: 'failed' as const,
        ...processError(error),
      } as PureResponse<ModuleRunResponse>;
    }
  });
}
