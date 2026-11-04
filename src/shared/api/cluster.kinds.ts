import { useApiGet } from '@/shared/libs/api-client';
import type {
  GetRequestRecipe,
  WithApiGetOptions,
} from '@/shared/libs/api-client/rules/types';

import { useClusterKindsAdapter } from './cluster.parsers';

export function recipe(): GetRequestRecipe {
  return {
    url: '/v1/clusters/kinds',
  };
}

/** Every cluster kind the backend knows, available or planned. */
export function useGet(params: WithApiGetOptions = {}) {
  const [response, refresh] = useApiGet<unknown>(recipe(), params.options);

  return [useClusterKindsAdapter(response), refresh] as const;
}
