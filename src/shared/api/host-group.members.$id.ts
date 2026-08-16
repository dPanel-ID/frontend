import { apiDoPost } from '@/shared/libs/api-client/lib/apiDoPost';

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
  return apiDoPost<void>({
    method: 'PUT',
    url: `/v1/host-groups/${payload.id}/members`,
    data: {
      server_ids: payload.serverIds,
    },
  });
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
  return apiDoPost<void>({
    method: 'DELETE',
    url: `/v1/host-groups/${payload.id}/members/${payload.serverId}`,
  });
}
