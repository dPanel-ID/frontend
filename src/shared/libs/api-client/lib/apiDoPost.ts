import { AxiosError } from 'axios';

import type {
  BaseResponse,
  DoRequestRecipe,
  PureResponse,
} from '../rules/types';

import { axiosClient } from './client';
import { BaseResponseError } from './error';

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
    if (error instanceof AxiosError || error instanceof BaseResponseError) {
      return {
        $status: 'failed',
        kind: 'api',
        error,
      };
    }

    return {
      $status: 'failed',
      kind: 'general',
      error: error instanceof Error ? error : Error(String(error)),
    };
  }
}
