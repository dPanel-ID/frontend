import type { DTOs } from '@/shared/api';

interface ModuleRunResponseLike {
  operation_id?: string;
  target?: DTOs.HostGroupActionTargetV1;
}

export function isTerminalOperationStatus(status?: string) {
  return ['succeeded', 'failed', 'cancelled'].includes(
    String(status ?? '').toLowerCase(),
  );
}

export function getOperationRefreshInterval(
  operationId?: string,
  status?: string,
) {
  if (!operationId) return 0;

  return isTerminalOperationStatus(status) ? 0 : 3000;
}

export function getQueuedHostGroupOperationId(
  response:
    | Pick<DTOs.HostGroupActionResponseV1, 'operation_id' | 'target'>
    | ModuleRunResponseLike,
) {
  if (response.target?.type !== 'hostgroup') return undefined;

  return response.operation_id || undefined;
}
