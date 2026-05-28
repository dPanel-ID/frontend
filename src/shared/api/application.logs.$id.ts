import { createQueryParams, useApiGet } from '@/shared/libs/api-client';
import type {
  GetRequestRecipe,
  WithApiGetOptions,
} from '@/shared/libs/api-client/rules/types';

// =============================================================================
//   Recipe
// =============================================================================

export interface RecipeParams {
  applicationId: string;
  artifactId?: string;
  deploymentId?: string;
  machineId?: string;
  line?: number;
}

export function recipe(params: RecipeParams): GetRequestRecipe {
  const { applicationId, artifactId, deploymentId, machineId, line } = params;
  const queryParams = createQueryParams({
    artifact_id: artifactId,
    deployment_id: deploymentId,
    machine_id: machineId,
    line,
  });

  return {
    url: `/v1/application/${applicationId}/logs?${queryParams.toString()}`,
  };
}

// =============================================================================
//   Method
// =============================================================================

export function useGet(params: WithApiGetOptions<RecipeParams>) {
  return useApiGet<string[]>(recipe(params), params.options);
}
