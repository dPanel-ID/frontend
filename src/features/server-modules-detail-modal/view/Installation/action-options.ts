import type { DTOs } from '@/shared/api';

const BLOCKED_HOST_GROUP_ACTIONS = new Set(['delete', 'reprovision']);

export function isBlockedHostGroupAction(actionName: string) {
  return BLOCKED_HOST_GROUP_ACTIONS.has(actionName.trim().toLowerCase());
}

export function getAvailableModuleActions(
  actions: DTOs.ModuleActionV1[] | undefined,
  isHostGroupTarget: boolean,
) {
  const availableActions = (actions ?? []).filter(
    (action) =>
      !isHostGroupTarget || !isBlockedHostGroupAction(action.name ?? ''),
  );

  const defaultAction =
    availableActions.find((action) => action.name === 'install') ??
    availableActions[0] ??
    null;

  return {
    actions: availableActions,
    defaultAction,
  } as const;
}
