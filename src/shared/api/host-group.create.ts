import { apiClient } from '@/shared/libs/api-client/lib/client';
import { apiDoPost } from '@/shared/libs/api-client/lib/apiDoPost';
import type { PureResponse } from '@/shared/libs/api-client/rules/types';

import type { DTOs } from '.';

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
  return apiDoPost<DTOs.HostGroupV1>({
    method: 'POST',
    url: '/v1/host-groups',
    data: payload,
  });
}

export function doPatch(payload: UpdatePayload) {
  return apiClient<DTOs.HostGroupV1>({
    method: 'PATCH',
    url: `/v1/host-groups/${payload.id}`,
    data: {
      name: payload.name,
      description: payload.description,
    },
  });
}

export function doDelete(payload: DeletePayload) {
  return apiClient<boolean>({
    method: 'DELETE',
    url: `/v1/host-groups/${payload.id}`,
  }) as Promise<PureResponse<boolean>>;
}
