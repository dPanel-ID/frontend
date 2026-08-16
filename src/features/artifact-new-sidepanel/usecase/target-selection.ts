export interface SyncDeploymentTargetSelectionParams {
  previousServerId?: string;
  nextServerId?: string;
  nextHostGroupId?: string;
  currentTargetMode: 'server' | 'hostgroup';
}

export function syncDeploymentTargetSelection(
  params: SyncDeploymentTargetSelectionParams,
) {
  const {
    currentTargetMode,
    nextHostGroupId,
    nextServerId,
    previousServerId,
  } = params;

  const serverChanged = previousServerId !== nextServerId;

  return {
    hostGroupId: nextHostGroupId ?? '',
    targetMode: serverChanged ? 'server' : currentTargetMode,
  } as const;
}
