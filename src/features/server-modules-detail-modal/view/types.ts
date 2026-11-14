import type { ServerModule } from '@/entities/server-modules/model/types';

import type { ExplicitTarget } from '@/shared/rules/host-group';

export interface ServerModulesDetailModalProps {
  serverID?: string | number;
  /** The server's name, for the confirmation ("Install Go on web-01?"). */
  serverName?: string;
  moduleInfo: ServerModule;
  hostGroupTarget?: {
    id: string;
    label: string;
    memberCount: number;
  };
  onOperationQueued?: (operationId: string) => void;
  /** Called once an action on the single server is queued. */
  onServerInstallQueued?: () => void;
}

export interface InstallModuleTargetConfig {
  target: ExplicitTarget;
  label: string;
  snapshotCount?: number;
}
