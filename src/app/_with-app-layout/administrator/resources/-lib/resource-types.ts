import type { AdminResourceType } from '@/shared/api/admin.resource.find';
import type { StatusTone } from '@/shared/presentation/molecules/StatusPill';

/** The tabs, in the order they are shown. */
export const RESOURCE_TYPES: AdminResourceType[] = [
  'servers',
  'applications',
  'load_balancers',
  'domains',
  'ssh_keys',
];

/** Rows per page. */
export const RESOURCES_PAGE_SIZE = 50;

export function isResourceType(value: string): value is AdminResourceType {
  return (RESOURCE_TYPES as string[]).includes(value);
}

const SUCCESS = [
  'running',
  'active',
  'success',
  'succeeded',
  'online',
  'ready',
  'connected',
  'installed',
];
const WARNING = [
  'pending',
  'queued',
  'installing',
  'provisioning',
  'starting',
  'stopping',
  'progress',
  'in_progress',
];
const DANGER = [
  'failed',
  'error',
  'stopped',
  'terminated',
  'offline',
  'disconnected',
  'unavailable',
];

/** A status as the API spells it, in the product's status colours. */
export function statusTone(status: string): StatusTone {
  const value = status.trim().toLowerCase();
  if (SUCCESS.includes(value)) return 'success';
  if (WARNING.includes(value)) return 'warning';
  if (DANGER.includes(value)) return 'danger';
  return 'neutral';
}
