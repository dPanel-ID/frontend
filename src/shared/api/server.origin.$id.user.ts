import { useAdapter, useApiGet } from '@/shared/libs/api-client';
import type {
  GetRequestRecipe,
  WithApiGetOptions,
} from '@/shared/libs/api-client/rules/types';

import type { DTOs } from '.';

export interface RecipeParams {
  serverId?: string;
}

export function recipe(params: RecipeParams): GetRequestRecipe {
  const { serverId } = params;

  return {
    url: `/v1/server/origin/${serverId}/user`,
  };
}

export type UserDto = DTOs.MachineUserV1 | string;

type ContractDto = UserDto[] | UserDto[][];

export function normalizeServerUsers(raw: ContractDto): UserDto[] {
  return raw.flatMap((item) => (Array.isArray(item) ? item : [item]));
}

export function useGet(params: WithApiGetOptions<RecipeParams>) {
  const [response, refresh] = useApiGet<ContractDto>(
    recipe(params),
    params.options,
  );

  return [useAdapter(response, normalizeServerUsers), refresh] as const;
}
