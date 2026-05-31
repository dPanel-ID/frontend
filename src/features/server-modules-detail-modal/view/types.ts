import type { ServerModule } from '@/entities/server-modules/model/types';

export interface ServerModulesDetailModalProps {
  serverID?: string | number;
  moduleInfo: ServerModule;
}
