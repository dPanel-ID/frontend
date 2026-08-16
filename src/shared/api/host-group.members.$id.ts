import { apiClient } from '@/shared/libs/api-client/lib/client';
import { apiDoPost } from '@/shared/libs/api-client/lib/apiDoPost';
import type { PureResponse } from '@/shared/libs/api-client/rules/types';

export interface ReplacePayload {
  id: string;
  serverIds: string[];
}

export interface AddPayload {
  id: string;
  serverIds: string[];
}

export interface RemovePayload {
  id: string;
  serverId: string;
}

export function doPut(payload: ReplacePayload) {
  return apiClient<boolean>({
    method: 'PUT',
    url: `/v1/host-groups/${payload.id}/members`,
    data: {
      server_ids: payload.serverIds,
    },
  }) as Promise<PureResponse<boolean>>;
}

export function doPost(payload: AddPayload) {
  return apiDoPost<boolean>({
    method: 'POST',
    url: `/v1/host-groups/${payload.id}/members`,
    data: {
      server_ids: payload.serverIds,
    },
  });
}

export function doDelete(payload: RemovePayload) {
  return apiClient<boolean>({
    method: 'DELETE',
    url: `/v1/host-groups/${payload.id}/members/${payload.serverId}`,
  }) as Promise<PureResponse<boolean>>;
}
