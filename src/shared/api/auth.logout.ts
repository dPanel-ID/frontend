import { AxiosError } from 'axios';

import { axiosClient } from '@/shared/libs/api-client';
import type {
  GetRequestRecipe,
  PureResponse,
} from '@/shared/libs/api-client/rules/types';

import {
  BaseResponseError,
  normalizeApiError,
} from '../libs/api-client/lib/error';

import type { DTOs } from '.';

export function recipe(): GetRequestRecipe {
  return {
    url: `/v1/auth/logout`,
  };
}

export interface Dto {
  artifacts?: DTOs.ArtifactV1[];
  pagination: DTOs.Pagination;
}

export async function doLogout(): Promise<PureResponse<{}>> {
  const { url } = recipe();

  try {
    const response = await axiosClient({
      url,
      method: 'GET',
    });

    if (response.data.code !== 200) {
      throw new BaseResponseError(response.data);
    }

    return {
      $status: 'success',
    };
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
