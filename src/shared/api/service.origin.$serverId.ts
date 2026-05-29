import {
  createQueryParams,
  useAdapter,
  useApiGet,
} from '@/shared/libs/api-client';
import type {
  GetRequestRecipe,
  WithApiGetOptions,
} from '@/shared/libs/api-client/rules/types';

import type { DTOs } from '.';

// =============================================================================
//   Recipe
// =============================================================================

export interface RecipeParams {
  serverId?: string;
  page?: number;
  pageSize?: number;
  searchByName?: string;
}

export function recipe(params: RecipeParams): GetRequestRecipe {
  const { serverId, page, pageSize, searchByName } = params;

  const queryString = createQueryParams({
    page,
    limit: pageSize,
    name: searchByName,
  });

  return {
    url: `/v1/service/origin/${serverId}?${queryString.toString()}`,
  };
}

// =============================================================================
//   Method
// =============================================================================

export interface Dto {
  services: DTOs.ServiceOriginV1[];
  pagination: DTOs.Pagination;
}

type ContractDto = Dto | Dto[];

const EMPTY_PAGINATION: DTOs.Pagination = {
  page: 1,
  size: 0,
  total_item: 0,
  total_page: 1,
};

export function normalizeServiceOriginResponse(raw: ContractDto): Dto {
  const response = Array.isArray(raw) ? raw[0] : raw;

  return {
    services: response?.services ?? [],
    pagination: response?.pagination ?? EMPTY_PAGINATION,
  };
}

export function useGet(params: WithApiGetOptions<RecipeParams>) {
  const [response, refresh] = useApiGet<ContractDto>(
    recipe(params),
    params.options,
  );

  return [
    useAdapter(response, normalizeServiceOriginResponse),
    refresh,
  ] as const;
}
