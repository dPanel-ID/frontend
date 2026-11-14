export interface ServerModulesDiscoverSidepanelProps {
  serverId: string;
  serverName?: string;
  hostGroupId?: string;
  onHostGroupOperationQueued?: (groupId: string, operationId: string) => void;
  /** Called once an install on this server is queued, to show its row. */
  onModuleQueued?: () => void;
}
