import { useEffect, useState } from 'react';

import { useDevetekTranslations } from '@/services/i18n';
import { useToaster } from '@/services/toaster';

import { ApiServer } from '@/shared/api';
import type { Dto as AgentInstallStatusDto } from '@/shared/api/server.agent-install-status.$id';
import { apiDoGet } from '@/shared/libs/api-client';
import { getApiErrorDetail } from '@/shared/libs/api-client/lib/error';
import useHandler from '@/shared/libs/react-hooks/useHandler';

import {
  agentInstallProgress,
  msUntilExpiry,
  toAgentInstallTicket,
} from '../-lib/agent-install';
import type { AgentInstallTicket } from '../-lib/agent-install';

/** How often the card asks whether the agent has connected. */
const STATUS_POLL_MS = 4000;

/**
 * Gets a one-line agent install command for a new server, then follows its
 * install: waiting for the machine, started there, connected, or stopped
 * with a reason. The command is kept in memory only, for the person who
 * asked for it.
 */
export default function useAgentInstall() {
  const t = useDevetekTranslations();
  const [openToaster] = useToaster();

  const [ticket, setTicket] = useState<AgentInstallTicket | null>(null);
  const [isRequesting, setIsRequesting] = useState(false);
  const [expired, setExpired] = useState(false);
  const [status, setStatus] = useState<AgentInstallStatusDto>();

  const progress = ticket ? agentInstallProgress(status, expired) : null;
  const phase = progress?.phase ?? null;
  const isWaiting = phase === 'waiting' || phase === 'started';

  // Follow the install while its agent has not connected: ready and failed
  // end the polling, and so does an expired code.
  useEffect(() => {
    if (!ticket || !isWaiting) return undefined;

    const controller = new AbortController();
    let timer: number | undefined;

    const poll = async () => {
      const response = await apiDoGet<AgentInstallStatusDto>(
        ApiServer.AgentInstallStatus.$Id.recipe({ serverId: ticket.serverId }),
        { signal: controller.signal },
      );
      if (controller.signal.aborted) return;
      // A failed read keeps the last known status and tries again.
      if (response.$status === 'success') setStatus(response);
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
      setStatus({ status: response.server?.status });
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

  return { ticket, phase, progress, isRequesting, request, reset } as const;
}
