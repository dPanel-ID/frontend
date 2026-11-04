import { apiDoPost } from '@/shared/libs/api-client/lib/apiDoPost';
import type { ClusterCreatePayload } from '@/shared/rules/cluster';

import {
  adaptMutationResponse,
  parseClusterMutationPayload,
} from './cluster.parsers';

export type { ClusterCreatePayload as CreatePayload } from '@/shared/rules/cluster';

export interface ClusterIdPayload {
  id: string;
}

/** Creates the group and the cluster and queues the install. */
export function doPost(payload: ClusterCreatePayload) {
  return apiDoPost<unknown>({
    method: 'POST',
    url: '/v1/clusters',
    data: payload,
  }).then((response) =>
    adaptMutationResponse(response, parseClusterMutationPayload),
  );
}

/** Removes the engine from every node; the group stays. */
export function doUninstall(payload: ClusterIdPayload) {
  return apiDoPost<unknown>({
    method: 'POST',
    url: `/v1/clusters/${payload.id}/uninstall`,
  }).then((response) =>
    // The answer is `{ cluster }`; `warnings` defaults to empty.
    adaptMutationResponse(response, parseClusterMutationPayload),
  );
}

/**
 * Installs the cluster again on the same nodes, engine, version and roles,
 * after a failed install or an uninstall.
 */
export function doInstall(payload: ClusterIdPayload) {
  return apiDoPost<unknown>({
    method: 'POST',
    url: `/v1/clusters/${payload.id}/install`,
  }).then((response) =>
    adaptMutationResponse(response, parseClusterMutationPayload),
  );
}

/**
 * Deletes an uninstalled, failed or never-installed cluster. The group stays
 * as a generic group.
 */
export function doDelete(payload: ClusterIdPayload) {
  return apiDoPost<void>({
    method: 'DELETE',
    url: `/v1/clusters/${payload.id}`,
  });
}
