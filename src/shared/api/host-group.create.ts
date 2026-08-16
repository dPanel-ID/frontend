import { apiClient } from '@/shared/libs/api-client/lib/client';
import { apiDoPost } from '@/shared/libs/api-client/lib/apiDoPost';
import { processError } from '@/shared/libs/api-client/lib/processor';
import type { PureResponse } from '@/shared/libs/api-client/rules/types';

import { parseHostGroupDetailPayload } from './host-group.parsers';

export interface CreatePayload {
  name: string;
  description?: string;
  server_ids?: string[];
}

export interface UpdatePayload {
  id: string;
  name: string;
  description?: string;
}

export interface DeletePayload {
  id: string;
}

export function doPost(payload: CreatePayload) {
  return apiDoPost<unknown>({
    method: 'POST',
    url: '/v1/host-groups',
    data: payload,
  }).then((response) => {
    if (response.$status !== 'success') {
      return response;
    }

    try {
      return {
        $status: 'success' as const,
        ...parseHostGroupDetailPayload(response),
      };
    } catch (error) {
      return {
        $status: 'failed' as const,
        ...processError(error),
      };
    }
  });
}

export function doPatch(payload: UpdatePayload) {
  return apiClient<unknown>({
    method: 'PATCH',
    url: `/v1/host-groups/${payload.id}`,
    data: {
      name: payload.name,
      description: payload.description,
    },
  }).then((response) => {
    if (response.$status !== 'success') {
      return response;
    }

    try {
      return {
        $status: 'success' as const,
        ...parseHostGroupDetailPayload(response),
      };
    } catch (error) {
      return {
        $status: 'failed' as const,
        ...processError(error),
      };
    }
  });
}

export function doDelete(payload: DeletePayload) {
  return apiClient<boolean>({
    method: 'DELETE',
    url: `/v1/host-groups/${payload.id}`,
  }) as Promise<PureResponse<boolean>>;
}
