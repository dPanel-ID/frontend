import type { Target } from '@/entities/host-group/rules/schema';
import type { ServerModule } from '@/entities/server-modules/model/types';

export interface ServerModulesDetailModalProps {
  serverID?: string | number;
  moduleInfo: ServerModule;
  hostGroupTarget?: {
    id: string;
    label: string;
    memberCount: number;
  };
}

export interface InstallModuleTargetConfig {
  target: Target;
  label: string;
  snapshotCount?: number;
}
