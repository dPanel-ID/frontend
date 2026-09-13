export interface SyncDeploymentTargetSelectionParams {
  currentHostGroupId?: string;
  previousServerId?: string;
  nextServerId?: string;
  nextHostGroupId?: string;
  currentTargetMode: 'server' | 'hostgroup';
}

export function syncDeploymentTargetSelection(
  params: SyncDeploymentTargetSelectionParams,
) {
  const {
    currentHostGroupId,
    currentTargetMode,
    nextHostGroupId,
    nextServerId,
    previousServerId,
  } = params;

  const serverChanged = previousServerId !== nextServerId;
  const hostGroupId =
    nextHostGroupId ?? (serverChanged ? '' : currentHostGroupId ?? '');

  return {
    hostGroupId,
    targetMode: serverChanged ? 'server' : currentTargetMode,
  } as const;
}
