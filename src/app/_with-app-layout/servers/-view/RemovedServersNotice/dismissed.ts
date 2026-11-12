import type { ReturnedServerDto } from '@/shared/api/server.removed';

const STORAGE_KEY = 'dpanel.removedServers.dismissed';

/** Dismissed servers by ID, with the agent call the viewer had seen then. */
export type DismissedRemovedServers = Record<string, string>;

export function readDismissed(): DismissedRemovedServers {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === 'object'
      ? (parsed as DismissedRemovedServers)
      : {};
  } catch {
    return {};
  }
}

export function writeDismissed(dismissed: DismissedRemovedServers) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(dismissed));
  } catch {
    // Storage blocked: the notice simply shows again next time.
  }
}

/**
 * The servers still worth showing: one the viewer dismissed comes back only
 * when its agent called again after the dismissal.
 */
export function visibleReturnedServers(
  servers: ReturnedServerDto[],
  dismissed: DismissedRemovedServers,
): ReturnedServerDto[] {
  return servers.filter((server) => {
    const seen = dismissed[server.machine_id];
    if (!seen) return true;
    const last = Date.parse(server.last_contact_at ?? '');
    const seenAt = Date.parse(seen);
    if (Number.isNaN(last) || Number.isNaN(seenAt)) return false;
    return last > seenAt;
  });
}

/** Marks every listed server as dismissed at its latest agent call. */
export function dismissAll(
  servers: ReturnedServerDto[],
  dismissed: DismissedRemovedServers,
): DismissedRemovedServers {
  const next = { ...dismissed };
  for (const server of servers) {
    next[server.machine_id] =
      server.last_contact_at ?? new Date().toISOString();
  }
  return next;
}
