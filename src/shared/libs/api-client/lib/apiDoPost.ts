import { AxiosError } from 'axios';

import type {
  BaseResponse,
  DoRequestRecipe,
  PureResponse,
} from '../rules/types';

import { axiosClient } from './client';
import { BaseResponseError, normalizeApiError } from './error';

export async function apiDoPost<D>(
  config: DoRequestRecipe,
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

    if (baseResponse.code !== 200) {
      throw new BaseResponseError(baseResponse);
    }

    const responseData = baseResponse.data;

    if (responseData == null || typeof responseData === 'string') {
      return {
        $status: 'success',
      } as PureResponse<D>;
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
