import { useEffect, useState } from 'react';

import { ApiServer } from '@/shared/api';
import { useAdapter } from '@/shared/libs/api-client';

import { isAwaitingApply, toFirewallView } from '../-lib/firewall';

/** How often the page re-reads the firewall while an apply runs. */
export const FIREWALL_POLL_MS = 5_000;

/** Stop waiting for a queued job after this long; the strip still shows its status. */
const FIREWALL_POLL_LIMIT_MS = 10 * 60_000;

/**
 * The stored firewall of one server, re-read every few seconds while an
 * apply or disable job is running and until the API reports the job that
 * this page queued. Polling stops when the caller unmounts.
 */
export function useServerFirewall(serverId: string) {
  const [queuedExecutionId, setQueuedExecutionId] = useState<string | null>(
    null,
  );

  const [response, refresh] = ApiServer.Firewall.$Id.useGet({ serverId });
  const firewall = useAdapter(response, (raw) => toFirewallView(raw));

  const current =
    firewall.$status === 'success'
      ? firewall
      : firewall.$status === 'loading'
        ? firewall.prevData
        : undefined;
  const awaitingApply = current
    ? isAwaitingApply(current.policy, queuedExecutionId)
    : queuedExecutionId != null;

  useEffect(() => {
    if (!awaitingApply) return;

    const interval = window.setInterval(() => {
      refresh({ abortInFlight: false });
    }, FIREWALL_POLL_MS);

    return () => window.clearInterval(interval);
  }, [awaitingApply, refresh]);

  useEffect(() => {
    if (!queuedExecutionId) return;

    const timeout = window.setTimeout(
      () => setQueuedExecutionId(null),
      FIREWALL_POLL_LIMIT_MS,
    );

    return () => window.clearTimeout(timeout);
  }, [queuedExecutionId]);

  /** Call with the execution ID an apply or disable returned. */
  const trackExecution = (executionId: string | null | undefined) => {
    setQueuedExecutionId(executionId || null);
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
