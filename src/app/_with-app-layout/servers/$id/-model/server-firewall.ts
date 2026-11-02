import { useEffect } from 'react';

import { ApiServer } from '@/shared/api';
import { useAdapter } from '@/shared/libs/api-client';

import { isAwaitingApply, toFirewallView } from '../-lib/firewall';

/** How often the page re-reads the firewall while an apply runs. */
export const FIREWALL_POLL_MS = 5_000;

/**
 * The stored firewall of one server. It is re-read every few seconds only
 * while the API reports an apply or disable job in progress, and polling
 * stops as soon as the job finishes or the caller unmounts. The API claims
 * the policy before it answers an apply, so the next read already shows the
 * job as in progress.
 */
export function useServerFirewall(serverId: string) {
  const [response, refresh] = ApiServer.Firewall.$Id.useGet({ serverId });
  const firewall = useAdapter(response, (raw) => toFirewallView(raw));

  const current =
    firewall.$status === 'success'
      ? firewall
      : firewall.$status === 'loading'
        ? firewall.prevData
        : undefined;
  const awaitingApply = current ? isAwaitingApply(current.policy) : false;

  useEffect(() => {
    if (!awaitingApply) return;

    const interval = window.setInterval(() => {
      refresh({ abortInFlight: false });
    }, FIREWALL_POLL_MS);

    return () => window.clearInterval(interval);
  }, [awaitingApply, refresh]);

  /** Call after an apply or disable was queued, to show the running job. */
  const trackExecution = (_executionId?: string | null) => {
    refresh();
  };

  return {
    firewall,
    current,
    refresh,
    awaitingApply,
    trackExecution,
  };
}

export type ServerFirewallState = ReturnType<typeof useServerFirewall>;
