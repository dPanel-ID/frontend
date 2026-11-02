import { useState } from 'react';

import { useDevetekTranslations } from '@/services/i18n';
import { useToaster } from '@/services/toaster';

import { ApiServer } from '@/shared/api';
import { getApiErrorDetail } from '@/shared/libs/api-client/lib/error';
import useHandler from '@/shared/libs/react-hooks/useHandler';

import { applyRequest } from '../-lib/firewall';
import type { FirewallPolicyView } from '../-lib/firewall';

interface FirewallApplyPayload {
  serverId: string;
  /** The policy the user reviewed; its version goes into the request. */
  policy: Pick<FirewallPolicyView, 'enabled' | 'version'>;
}

/** Queues the apply job; returns the execution ID, or null when it failed. */
export default function useFirewallApply() {
  const t = useDevetekTranslations('page.serverDetail.network.firewall');
  const [isApplying, setIsApplying] = useState(false);
  const [openToaster] = useToaster();

  const apply = useHandler(
    async (payload: FirewallApplyPayload): Promise<string | null> => {
      const { policy, serverId } = payload;

      setIsApplying(true);
      const response = await ApiServer.Firewall.$Id.Apply.doPost({
        serverId,
        payload: applyRequest(policy),
      });
      setIsApplying(false);

      if (response.$status === 'failed') {
        openToaster({
          variant: 'error',
          title: t('apply.errorTitle'),
          message: getApiErrorDetail(response.error),
        });
        return null;
      }

      openToaster({ variant: 'success', message: t('apply.queued') });
      return response.execution_id ?? '';
    },
  );

  return { apply, isApplying };
}
