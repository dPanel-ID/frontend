import { useEffect, useState } from 'react';

import { useDevetekTranslations } from '@/services/i18n';
import { useToaster } from '@/services/toaster';

import type { DTOs } from '@/shared/api';
import { ApiServer } from '@/shared/api';
import { apiDoGet } from '@/shared/libs/api-client';
import { getApiErrorDetail } from '@/shared/libs/api-client/lib/error';
import useHandler from '@/shared/libs/react-hooks/useHandler';

import {
  agentInstallPhase,
  msUntilExpiry,
  toAgentInstallTicket,
} from '../-lib/agent-install';
import type { AgentInstallTicket } from '../-lib/agent-install';

/** How often the card asks whether the agent has connected. */
const STATUS_POLL_MS = 4000;

/**
 * Gets a one-line agent install command for a new server, then follows the
 * server until its agent connects. The command is kept in memory only, for
 * the person who asked for it.
 */
export default function useAgentInstall() {
  const t = useDevetekTranslations();
  const [openToaster] = useToaster();

  const [ticket, setTicket] = useState<AgentInstallTicket | null>(null);
  const [isRequesting, setIsRequesting] = useState(false);
  const [expired, setExpired] = useState(false);
  const [status, setStatus] = useState<string>();

  const phase = ticket ? agentInstallPhase(status, expired) : null;
  const isWaiting = phase === 'waiting';

  // Follow the server while its agent has not connected: ready and failed
  // end the polling, and so does an expired code.
  useEffect(() => {
    if (!ticket || !isWaiting) return undefined;

    const controller = new AbortController();
    let timer: number | undefined;

    const poll = async () => {
      const response = await apiDoGet<DTOs.MachineV1>(
        ApiServer.Detail.$Id.recipe({ serverId: ticket.serverId }),
        { signal: controller.signal },
      );
      if (controller.signal.aborted) return;
      // A failed read keeps the last known status and tries again.
      if (response.$status === 'success') setStatus(response.status);
      timer = window.setTimeout(poll, STATUS_POLL_MS);
    };

    void poll();
    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [ticket, isWaiting]);

  useEffect(() => {
    if (!ticket) return undefined;
    const remaining = msUntilExpiry(ticket.expiresAt, Date.now());
    if (remaining == null) return undefined;

    const timer = window.setTimeout(() => setExpired(true), remaining);
    return () => window.clearTimeout(timer);
  }, [ticket]);

  const request = useHandler(async (hostname: string) => {
    if (isRequesting) return;
    setIsRequesting(true);
    try {
      const response = await ApiServer.AgentInstall.doPost({ hostname });
      if (response.$status !== 'success') {
        openToaster({
          variant: 'error',
          title: t('page.servers.create.chooser.agent.install.failed'),
          message: getApiErrorDetail(response.error),
        });
        return;
      }

      const next = toAgentInstallTicket(response);
      if (!next) {
        openToaster({
          variant: 'error',
          message: t('page.servers.create.chooser.agent.install.failed'),
        });
        return;
      }
      setExpired(false);
      setStatus(response.server?.status);
      setTicket(next);
    } finally {
      setIsRequesting(false);
    }
  });

  const reset = useHandler(() => {
    setTicket(null);
    setExpired(false);
    setStatus(undefined);
  });

  return { ticket, phase, isRequesting, request, reset } as const;
}
