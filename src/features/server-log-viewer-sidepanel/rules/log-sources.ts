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
