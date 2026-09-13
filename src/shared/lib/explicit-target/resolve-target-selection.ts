import type { ExplicitTarget } from '@/shared/rules/host-group';

type TargetMode = 'server' | 'hostgroup';

interface HostGroupOption {
  id: string;
  label: string;
  memberCount: number;
}

interface ResolveExplicitTargetSelectionParams {
  preferredMode: TargetMode;
  serverId?: string;
  hostGroup?: HostGroupOption;
}

interface TargetOption {
  mode: TargetMode;
  label: string;
  description?: string;
  target: ExplicitTarget;
}

export interface ExplicitTargetSelection {
  activeMode: TargetMode;
  options: TargetOption[];
  target: ExplicitTarget;
}

export function resolveExplicitTargetSelection(
  params: ResolveExplicitTargetSelectionParams,
): ExplicitTargetSelection {
  const { preferredMode, serverId, hostGroup } = params;

  const options: TargetOption[] = [];

  if (serverId) {
    options.push({
      mode: 'server',
      label: 'Selected server',
      target: {
        type: 'server',
        id: serverId,
      },
    });
  }

  if (hostGroup) {
    options.push({
      mode: 'hostgroup',
      label: hostGroup.label,
      description: `${hostGroup.memberCount} member${
        hostGroup.memberCount === 1 ? '' : 's'
      }`,
      target: {
        type: 'hostgroup',
        id: hostGroup.id,
      },
    });
  }

  const activeMode =
    options.some((option) => option.mode === preferredMode)
      ? preferredMode
      : options[0]?.mode ?? 'server';

  const selectedOption = options.find((option) => option.mode === activeMode);

  if (!selectedOption) {
    return {
      activeMode: 'server',
      options: [],
      target: {
        type: 'server',
        id: '',
      },
    };
  }

  return {
    activeMode,
    options,
    target: selectedOption.target,
  };
}
