/** True for a module's install action, worded "Install <module>". */
export function isInstallAction(action: string) {
  return action.trim().toLowerCase() === 'install';
}

/**
 * What the confirmation calls the target: the server's name when it is
 * known, else "server <id>"; a server group by its label.
 */
export function installTargetLabel(params: {
  type: 'server' | 'hostgroup';
  id: string;
  serverName?: string;
  groupLabel?: string;
  serverFallback: (id: string) => string;
}) {
  if (params.type === 'hostgroup') return params.groupLabel || params.id;
  return params.serverName?.trim() || params.serverFallback(params.id);
}
