export interface ServerFirewallRuleSidepanelProps {
  serverId: string;
  serverName?: string;
  /** Docker rules only take effect while Docker filtering is on. */
  dockerFiltering: boolean;
  onSuccess?: () => void;
}
