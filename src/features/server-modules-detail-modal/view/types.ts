import type { ExplicitTarget } from '@/shared/rules/host-group';
import type { ServerModule } from '@/entities/server-modules/model/types';

export interface ServerModulesDetailModalProps {
  serverID?: string | number;
  moduleInfo: ServerModule;
  hostGroupTarget?: {
    id: string;
    label: string;
    memberCount: number;
  };
  onOperationQueued?: (operationId: string) => void;
}

export interface InstallModuleTargetConfig {
  target: ExplicitTarget;
  label: string;
  snapshotCount?: number;
}
