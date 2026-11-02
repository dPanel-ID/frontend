import { useState } from 'react';

import { useDevetekTranslations } from '@/services/i18n';
import { useToaster } from '@/services/toaster';

import { ApiServer } from '@/shared/api';
import { getApiErrorDetail } from '@/shared/libs/api-client/lib/error';
import useHandler from '@/shared/libs/react-hooks/useHandler';

interface FirewallDockerFilteringPayload {
  serverId: string;
  version: number;
  enabled: boolean;
  /** Called after success and after a failure, so the page re-reads the policy. */
  onSettled?: () => void;
}

/** Stores whether Docker-published ports are filtered; applies on the next apply. */
export default function useFirewallDockerFiltering() {
  const t = useDevetekTranslations('page.serverDetail.network.firewall');
  const [isSaving, setIsSaving] = useState(false);
  const [openToaster] = useToaster();

  const setDockerFiltering = useHandler(
    async (payload: FirewallDockerFilteringPayload) => {
      const { enabled, onSettled, serverId, version } = payload;

      setIsSaving(true);
      const response = await ApiServer.Firewall.$Id.doPut({
        serverId,
        payload: { version, docker_filtering: enabled },
      });
      setIsSaving(false);
      onSettled?.();

      if (response.$status === 'failed') {
        openToaster({
          variant: 'error',
          title: t('dockerFiltering.errorTitle'),
          message: getApiErrorDetail(response.error),
        });
        return;
      }

      openToaster({
        variant: 'success',
        message: enabled
          ? t('dockerFiltering.enabled')
          : t('dockerFiltering.disabled'),
      });
    },
  );

  return { setDockerFiltering, isSaving };
}
