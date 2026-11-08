import { createQueryParams, useApiGet } from '@/shared/libs/api-client';
import type {
  GetRequestRecipe,
  WithApiGetOptions,
} from '@/shared/libs/api-client/rules/types';

import type { BuildProgressV1 } from './-dtos/application';

export interface RecipeParams {
  applicationId: string;
  artifactId: string;
  machineId?: string;
}

export function recipe(params: RecipeParams): GetRequestRecipe {
  const { applicationId, artifactId, machineId } = params;
  const queryParams = createQueryParams({
    artifact_id: artifactId,
    machine_id: machineId,
  });

  return {
    url: `/v1/application/${applicationId}/build-progress?${queryParams.toString()}`,
  };
}

/** The latest run of a build on one server, stage by stage. */
export function useGet(params: WithApiGetOptions<RecipeParams>) {
  return useApiGet<BuildProgressV1>(recipe(params), params.options);
}
