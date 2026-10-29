import { AxiosError } from 'axios';
import type { AxiosRequestConfig } from 'axios';

import type {
  BaseResponse,
  DoRequestRecipe,
  GetRequestRecipe,
  PureResponse,
} from '../rules/types';

import { axiosClient } from './client';
import {
  BaseResponseError,
  isBaseResponseFailure,
  normalizeApiError,
} from './error';

export function apiDoPost<D>(
  config: DoRequestRecipe,
): Promise<PureResponse<D>> {
  return apiRequest<D>(config);
}

/**
 * A one-off GET outside a hook, e.g. to walk through pages in a loop. Abort
 * the signal to stop a request that is no longer wanted.
 */
export function apiDoGet<D>(
  recipe: GetRequestRecipe,
  options: { signal?: AbortSignal } = {},
): Promise<PureResponse<D>> {
  return apiRequest<D>({ method: 'GET', url: recipe.url, ...options });
}

async function apiRequest<D>(
  config: AxiosRequestConfig,
): Promise<PureResponse<D>> {
  try {
    const axiosResponse = await axiosClient<BaseResponse<D>>({
      ...config,
    });

    const baseData = axiosResponse.data as unknown;

    if (baseData == null || typeof baseData !== 'object') {
      return {
        $status: 'success',
      } as PureResponse<D>;
    }

    const baseResponse = baseData as BaseResponse<D>;

    if (isBaseResponseFailure(baseResponse)) {
      throw new BaseResponseError(baseResponse);
    }

    const responseData = baseResponse.data;

    if (responseData == null) {
      return {
        $status: 'success',
      } as PureResponse<D>;
    }

    if (typeof responseData !== 'object') {
      return {
        $status: 'success',
        value: responseData,
      } as unknown as PureResponse<D>;
    }

    const data = responseData as PureResponse<D>;
    data.$status = 'success';

    return data;
  } catch (error) {
    const normalizedError = normalizeApiError(error);

    if (
      normalizedError instanceof AxiosError ||
      normalizedError instanceof BaseResponseError
    ) {
      return {
        $status: 'failed',
        kind: 'api',
        error: normalizedError,
      };
    }

    return {
      $status: 'failed',
      kind: 'general',
      error:
        normalizedError instanceof Error
          ? normalizedError
          : Error(String(normalizedError)),
    };
  }
}
