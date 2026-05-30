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

const STALE_WORKSPACE_ERROR =
  'selected workspace is not assigned to the authenticated user';

type WorkspaceRetryRequestConfig = AxiosRequestConfig & {
  __retriedAfterStaleWorkspace?: boolean;
};

function isUserProfileRequest(config?: AxiosRequestConfig) {
  if (!config?.url) return false;

  const method = config.method?.toUpperCase();
  return method === 'GET' && config.url.includes('/v1/user/profile');
}

function getEnvelopeError(payload: unknown) {
  if (payload == null || typeof payload !== 'object') return null;

  const error = (payload as { error?: unknown }).error;
  return typeof error === 'string' ? error.trim() : null;
}

function getEnvelopeCode(payload: unknown, fallback?: number) {
  if (payload == null || typeof payload !== 'object') return fallback;

  const code = Number((payload as { code?: unknown }).code);
  return Number.isFinite(code) ? code : fallback;
}

function shouldRecoverStaleWorkspace(
  config: WorkspaceRetryRequestConfig | undefined,
  payload: unknown,
  fallbackStatus?: number,
) {
  if (!isBrowser()) return false;
  if (!isUserProfileRequest(config)) return false;
  if (config?.__retriedAfterStaleWorkspace) return false;

  return (
    getEnvelopeCode(payload, fallbackStatus) === 403 &&
    getEnvelopeError(payload) === STALE_WORKSPACE_ERROR
  );
}

function retryWithoutStoredWorkspace(config: WorkspaceRetryRequestConfig) {
  localStorage.removeItem(LS_ORGANIZATION_ID);

  const retryConfig: WorkspaceRetryRequestConfig = {
    ...config,
    __retriedAfterStaleWorkspace: true,
  };

  const headers = AxiosHeaders.from(
    retryConfig.headers as Parameters<typeof AxiosHeaders.from>[0],
  );
  headers.delete(X_AUTH_ORGANIZATION_ID);
  retryConfig.headers = headers;

  return axiosClient.request(retryConfig);
}

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

axiosClient.interceptors.response.use(
  (response) => {
    const config = response.config as WorkspaceRetryRequestConfig;

    if (shouldRecoverStaleWorkspace(config, response.data, response.status)) {
      return retryWithoutStoredWorkspace(config);
    }

    return response;
  },
  (error) => {
    if (error instanceof AxiosError) {
      const config = error.config as WorkspaceRetryRequestConfig | undefined;

      if (
        shouldRecoverStaleWorkspace(
          config,
          error.response?.data,
          error.response?.status ?? error.status,
        ) &&
        config
      ) {
        return retryWithoutStoredWorkspace(config);
      }
    }

    return Promise.reject(error);
  },
);

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
