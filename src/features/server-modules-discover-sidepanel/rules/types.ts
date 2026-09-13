export interface ServerModulesDiscoverSidepanelProps {
  serverId: string;
  serverName?: string;
  hostGroupId?: string;
  onHostGroupOperationQueued?: (groupId: string, operationId: string) => void;
}
