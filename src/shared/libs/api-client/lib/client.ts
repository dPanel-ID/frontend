import type { AxiosRequestConfig } from 'axios';
import axios, { AxiosError, AxiosHeaders } from 'axios';

import { isBrowser } from '../../browser/environment';
import { iife } from '../../browser/fn';
import {
  LS_ORGANIZATION_ID,
  X_AUTH_ORGANIZATION_ID,
  normalizeWorkspaceOrganizationId,
} from '../config';
import type { ApiClientResponse, BaseResponse } from '../rules/types';

import {
  BaseResponseError,
  isBaseResponseFailure,
  normalizeApiError,
} from './error';

export const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_BACKEND,
  withCredentials: true,
});

axiosClient.interceptors.request.use((config) => {
  const organizationId = iife(() => {
    if (!isBrowser()) return null;

    const storedOrganizationId =
      localStorage.getItem(LS_ORGANIZATION_ID) || null;
    const normalizedOrganizationId =
      normalizeWorkspaceOrganizationId(storedOrganizationId);

    if (
      storedOrganizationId &&
      normalizedOrganizationId !== storedOrganizationId
    ) {
      localStorage.setItem(LS_ORGANIZATION_ID, normalizedOrganizationId!);
    }

    return normalizedOrganizationId;
  });

  if (organizationId) {
    config.headers = new AxiosHeaders({
      ...config.headers,
      [X_AUTH_ORGANIZATION_ID]: organizationId,
    });
  }

  return config;
});

export async function apiClient<D>(
  config: AxiosRequestConfig,
): Promise<ApiClientResponse<D>> {
  try {
    const { data: baseData } = await axiosClient<BaseResponse<D>>(config);

    if (isBaseResponseFailure(baseData)) {
      throw new BaseResponseError(baseData);
    }

    if (baseData.data == null) {
      throw Error('Data is empty!');
    }

    const data = baseData.data as ApiClientResponse<D>;

    data.$status = 'success' as const;
    data.$statusCode = baseData.code;

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
        $statusCode:
          normalizedError instanceof AxiosError
            ? normalizedError.status
            : normalizedError.code,
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
