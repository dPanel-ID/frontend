import { z } from 'zod';

export const schemaServerLogSourceCategory = z.enum([
  'overview',
  'system',
  'security',
  'provisioning',
  'dpanel',
  'network',
]);

export const schemaServerLogSource = z.object({
  id: z.string(),
  label: z.string(),
  path: z.string().optional(),
  category: schemaServerLogSourceCategory,
});

export type ServerLogSource = z.infer<typeof schemaServerLogSource>;
export type ServerLogSourceCategory = z.infer<
  typeof schemaServerLogSourceCategory
>;

export const schemaServerLogSourceDiscoveryEntry = z.object({
  name: z.string().catch(''),
  is_dir: z.boolean().catch(false),
});

export type ServerLogSourceDiscoveryEntry = z.infer<
  typeof schemaServerLogSourceDiscoveryEntry
>;

export const SERVER_LOG_DISCOVERY_PATHS = {
  root: '/var/log',
  apt: '/var/log/apt',
  caddy: '/var/log/caddy',
  dpanelAgent: '/var/log/dpanel-agent',
} as const;

export const SERVER_LOG_DISCOVERY_DIRECTORIES = [
  { path: SERVER_LOG_DISCOVERY_PATHS.root, category: 'system' },
  { path: SERVER_LOG_DISCOVERY_PATHS.apt, category: 'provisioning' },
  { path: SERVER_LOG_DISCOVERY_PATHS.caddy, category: 'network' },
  { path: SERVER_LOG_DISCOVERY_PATHS.dpanelAgent, category: 'dpanel' },
] as const satisfies ReadonlyArray<{
  path: string;
  category: ServerLogSourceCategory;
}>;

export const VM_LOG_SOURCES = schemaServerLogSource.array().parse([
  {
    id: 'all',
    label: 'All VM logs',
    category: 'overview',
  },
  {
    id: 'syslog',
    label: 'System',
    path: '/var/log/syslog',
    category: 'system',
  },
  {
    id: 'messages',
    label: 'Messages',
    path: '/var/log/messages',
    category: 'system',
  },
  {
    id: 'auth',
    label: 'Auth',
    path: '/var/log/auth.log',
    category: 'security',
  },
  {
    id: 'kernel',
    label: 'Kernel',
    path: '/var/log/kern.log',
    category: 'system',
  },
  {
    id: 'dmesg',
    label: 'Boot Ring Buffer',
    path: '/var/log/dmesg',
    category: 'system',
  },
  {
    id: 'cloud-init',
    label: 'Cloud Init',
    path: '/var/log/cloud-init.log',
    category: 'provisioning',
  },
  {
    id: 'cloud-init-output',
    label: 'Cloud Init Output',
    path: '/var/log/cloud-init-output.log',
    category: 'provisioning',
  },
  {
    id: 'dpkg',
    label: 'Package Changes',
    path: '/var/log/dpkg.log',
    category: 'provisioning',
  },
  {
    id: 'apt-history',
    label: 'APT History',
    path: '/var/log/apt/history.log',
    category: 'provisioning',
  },
  {
    id: 'apt-term',
    label: 'APT Terminal',
    path: '/var/log/apt/term.log',
    category: 'provisioning',
  },
  {
    id: 'dpanel-agent',
    label: 'dPanel Agent',
    path: '/var/log/dpanel-agent/all.log',
    category: 'dpanel',
  },
  {
    id: 'caddy-default',
    label: 'Caddy Default Access',
    path: '/var/log/caddy/default.access.log',
    category: 'network',
  },
]);

export const VM_LOG_SOURCE_CATEGORIES: Array<{
  id: ServerLogSourceCategory;
  label: string;
}> = [
  { id: 'overview', label: 'Overview' },
  { id: 'system', label: 'System' },
  { id: 'security', label: 'Security' },
  { id: 'provisioning', label: 'Provisioning' },
  { id: 'dpanel', label: 'dPanel' },
  { id: 'network', label: 'Network' },
];

const LOG_FILE_EXCLUDED_NAMES = new Set(['btmp', 'faillog', 'lastlog', 'wtmp']);

const LOG_FILE_EXCLUDED_EXTENSIONS = ['.gz', '.xz', '.zip', '.zst'];

const LOG_FILE_ALLOWLIST = new Set([
  'auth.log',
  'cloud-init-output.log',
  'cloud-init.log',
  'daemon.log',
  'debug',
  'dmesg',
  'dpkg.log',
  'history.log',
  'kern.log',
  'messages',
  'secure',
  'syslog',
  'term.log',
  'ufw.log',
]);

function joinLogPath(directory: string, name: string) {
  return `${directory.replace(/\/+$/, '')}/${name.replace(/^\/+/, '')}`;
}

function getKnownLogSource(path: string) {
  return VM_LOG_SOURCES.find((source) => source.path === path);
}

function titleCase(value: string) {
  return value.replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function labelFromPath(path: string) {
  const knownSource = getKnownLogSource(path);
  if (knownSource) return knownSource.label;

  const filename = path.split('/').at(-1) ?? path;
  const label = filename
    .replace(/\.log$/i, '')
    .replace(/[-_.]+/g, ' ')
    .trim();

  return titleCase(label || filename);
}

function categoryFromPath(
  path: string,
  fallback: ServerLogSourceCategory,
): ServerLogSourceCategory {
  const normalized = path.toLowerCase();

  if (normalized.includes('/dpanel-agent/')) return 'dpanel';
  if (
    normalized.includes('/apt/') ||
    normalized.includes('cloud-init') ||
    normalized.includes('dpkg') ||
    normalized.includes('bootstrap')
  ) {
    return 'provisioning';
  }
  if (
    normalized.includes('/caddy/') ||
    normalized.includes('/nginx/') ||
    normalized.includes('/apache') ||
    normalized.includes('ufw')
  ) {
    return 'network';
  }
  if (
    normalized.includes('auth') ||
    normalized.includes('audit') ||
    normalized.includes('secure')
  ) {
    return 'security';
  }

  return fallback;
}

function isDiscoverableLogFile(entry: ServerLogSourceDiscoveryEntry) {
  const fileName = entry.name.trim();
  if (!fileName || entry.is_dir) return false;

  const normalized = fileName.toLowerCase();
  if (normalized.startsWith('.')) return false;
  if (LOG_FILE_EXCLUDED_NAMES.has(normalized)) return false;
  if (LOG_FILE_EXCLUDED_EXTENSIONS.some((ext) => normalized.endsWith(ext))) {
    return false;
  }
  if (/\.\d+$/.test(normalized)) return false;

  return normalized.endsWith('.log') || LOG_FILE_ALLOWLIST.has(normalized);
}

export function buildServerLogSourcesFromDiscovery(
  discoveries: Array<{
    path: string;
    category: ServerLogSourceCategory;
    entries?: readonly unknown[];
  }>,
) {
  const sourcesByPath = new Map<string, ServerLogSource>();

  for (const discovery of discoveries) {
    for (const rawEntry of discovery.entries ?? []) {
      const parsedEntry =
        schemaServerLogSourceDiscoveryEntry.safeParse(rawEntry);
      if (!parsedEntry.success) continue;

      const entry = parsedEntry.data;
      if (!isDiscoverableLogFile(entry) || !entry.name) continue;

      const path = joinLogPath(discovery.path, entry.name);
      const knownSource = getKnownLogSource(path);

      sourcesByPath.set(path, {
        id: knownSource?.id ?? `file:${path}`,
        label: labelFromPath(path),
        path,
        category: categoryFromPath(path, discovery.category),
      });
    }
  }

  return schemaServerLogSource
    .array()
    .parse(
      Array.from(sourcesByPath.values()).sort((left, right) =>
        left.label.localeCompare(right.label),
      ),
    );
}
