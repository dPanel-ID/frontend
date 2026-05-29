import { createQueryParams, useApiGet } from '@/shared/libs/api-client';
import type {
  GetRequestRecipe,
  WithApiGetOptions,
} from '@/shared/libs/api-client/rules/types';

import type { ApplicationLogsResponseV1 } from './-dtos/application';

// =============================================================================
//   Recipe
// =============================================================================

export interface RecipeParams {
  applicationId: string;
  artifactId?: string;
  deploymentId?: string;
  machineId?: string;
  line?: number;
  limit?: number;
  timeGte?: string;
  timeLt?: string;
}

export function recipe(params: RecipeParams): GetRequestRecipe {
  const {
    applicationId,
    artifactId,
    deploymentId,
    machineId,
    line,
    limit,
    timeGte,
    timeLt,
  } = params;
  const queryParams = createQueryParams({
    artifact_id: artifactId,
    deployment_id: deploymentId,
    machine_id: machineId,
    line,
    limit,
    time_gte: timeGte,
    time_lt: timeLt,
  });

  return {
    url: `/v1/application/${applicationId}/logs?${queryParams.toString()}`,
  };
}

// =============================================================================
//   Method
// =============================================================================

export function useGet(params: WithApiGetOptions<RecipeParams>) {
  return useApiGet<ApplicationLogsResponseV1>(recipe(params), params.options);
}

export function normalizeLogLines(raw: ApplicationLogsResponseV1): string[] {
  if (Array.isArray(raw)) {
    return raw.filter(isLogLine);
  }

  const lines = Array.isArray(raw.lines) ? raw.lines : [];
  const entries = Array.isArray(raw.entries) ? raw.entries : [];

  if (lines.length > 0) {
    return lines.filter(isLogLine);
  }

  return entries.map((entry) => entry?.line).filter(isLogLine);
}

function isLogLine(line: string | null | undefined): line is string {
  return typeof line === 'string';
}
