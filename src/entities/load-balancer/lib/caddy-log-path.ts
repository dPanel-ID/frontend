export function createCaddyAccessLogPath(domain: string) {
  const caddyLogName = domain
    .trim()
    .replace(/\/+$/, '')
    .replace(/:\/\//g, '-')
    .replace(/:/g, '-port-');

  return `/var/log/caddy/${caddyLogName}.access.log`;
}
