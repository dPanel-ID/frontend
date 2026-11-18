import type { AxiosError } from 'axios';

import type { AdapterError, BaseResponseError } from '../lib/error';

export interface BaseResponse<D> {
  code: number;
  data?: D;
  status: string;
  error?: unknown;
  error_detail?: ExecutionErrorDetail | null;
}

export interface ExecutionErrorDetail {
  action?: string;
  command?: string;
  detail?: string;
  event_type?: string;
  execution_id?: string;
  exit_code?: number | null;
  host?: string;
  machine_id?: string;
  message?: string;
  module?: string;
  module_id?: string;
  organization_id?: string;
  play?: string;
  playbook?: string;
  role?: string;
  stderr?: string;
  stdout?: string;
  summary?: string;
  task?: string;
  task_path?: string;
  traceparent?: string;
  type?: string;
}

export type ApiClientResponse<D> =
  | ({ $status: 'success'; $statusCode: number } & D)
  | ({ $status: 'failed'; $statusCode?: number } & ResponseError);

// =============================================================================
//   Response Unit
// =============================================================================

export type PureResponse<D, E = ResponseError> =
  ({ $status: 'success' } & D) | ({ $status: 'failed' } & E);

export type Response<D, E = ResponseError> =
  | { $status: 'initial' }
  | { $status: 'loading'; prevData?: D; prevError?: E }
  | PureResponse<D, E>;

export type ResponseError =
  | { kind: 'api'; error: AxiosError | BaseResponseError }
  | { kind: 'adapter'; error: AdapterError }
  | { kind: 'general'; error: Error };

export type ResponseErrors =
  | ResponseError
  | {
      kind: 'aggregate';
      errors: ResponseError[];
    };

export type Adapter<Raw, Data> = (raw: Raw) => Data;

// =============================================================================
//   Request Recipe
// =============================================================================

export interface BaseRequestRecipe {
  url: string;
  /**
   * Extra request headers. An explicit workspace header here wins over the
   * workspace selected in the app shell, for surfaces that act on one
   * workspace regardless of the selection (a team page, the profile).
   */
  headers?: Record<string, string>;
}

export type GetRequestRecipe = BaseRequestRecipe;

export interface DoRequestRecipe extends BaseRequestRecipe {
  method: 'POST' | 'DELETE' | 'PUT' | 'PATCH';
  data?: unknown;
}

// =============================================================================
//   useApiGet
// =============================================================================

export interface UseApiGetOptions {
  skip?: boolean;
  autoRetryWhenFails?: boolean;
  refreshIntervalMs?: number;
  /**
   * Background refreshes (the interval and refetchOnVisible) keep the last
   * successful answer on screen: no loading state in between, and a failed
   * background refresh keeps that answer instead of showing the error.
   */
  silentRefresh?: boolean;
  /**
   * Refetch when the tab comes back into view, and skip interval refreshes
   * while it is hidden.
   */
  refetchOnVisible?: boolean;
}

export type WithApiGetOptions<T = unknown> = T & {
  options?: UseApiGetOptions;
};

// =============================================================================
//   useApiGetWhen
// =============================================================================

export interface UseApiGetWhenParams {
  config?: GetRequestRecipe;
  options?: UseApiGetOptions;
}
