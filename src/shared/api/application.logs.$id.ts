import {
  apiDoGet,
  createQueryParams,
  useApiGet,
} from '@/shared/libs/api-client';
import type {
  GetRequestRecipe,
  WithApiGetOptions,
} from '@/shared/libs/api-client/rules/types';

import type {
  ApplicationLogsResponseV1,
  ApplicationLogsV1,
} from './-dtos/application';

// =============================================================================
//   Recipe
// =============================================================================

export interface RecipeParams {
  applicationId: string;
  artifactId?: string;
  deploymentId?: string;
  machineId?: string;
  /** Every server the application is deployed to, merged newest first. */
  allMachines?: boolean;
  line?: number;
  limit?: number;
  /** 1-based, newest first; keep timeGte/timeLt fixed while paging. */
  page?: number;
  timeGte?: string;
  timeLt?: string;
}

export function recipe(params: RecipeParams): GetRequestRecipe {
  const {
    applicationId,
    artifactId,
    deploymentId,
    machineId,
    allMachines,
    line,
    limit,
    page,
    timeGte,
    timeLt,
  } = params;
  const queryParams = createQueryParams({
    artifact_id: artifactId,
    deployment_id: deploymentId,
    machine_id: machineId,
    all_machines: allMachines ? 'true' : undefined,
    line,
    limit,
    page: page && page > 1 ? page : undefined,
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

/** One page outside a hook, e.g. while downloading every page. */
export function get(params: RecipeParams, options?: { signal?: AbortSignal }) {
  return apiDoGet<ApplicationLogsV1>(recipe(params), options);
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
