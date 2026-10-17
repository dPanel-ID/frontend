import { useState } from 'react';

import { useDevetekTranslations } from '@/services/i18n';
import { useToaster } from '@/services/toaster';

import { ApiServer } from '@/shared/api';
import {
  BaseResponseError,
  getApiErrorDetail,
} from '@/shared/libs/api-client/lib/error';
import useHandler from '@/shared/libs/react-hooks/useHandler';

import type { DeleteServerPayload } from '../rules/types';

interface Params {
  onSuccess: () => void;
}

/**
 * Holds the server waiting for a typed confirmation and performs the delete
 * once it is given. The view renders the dialog from the returned state.
 */
export default function useDeleteServer(params: Params) {
  const { onSuccess } = params;

  const t = useDevetekTranslations();
  const [openToaster] = useToaster();

  const [target, setTarget] = useState<DeleteServerPayload | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleUsecase = useHandler((payload: DeleteServerPayload) => {
    setTarget(payload);
  });

  const close = useHandler(() => {
    if (!isDeleting) setTarget(null);
  });

  const confirm = useHandler(async () => {
    if (!target || isDeleting) return;
    const { serverId, serverName } = target;

    setIsDeleting(true);
    try {
      const response = await ApiServer.Delete.$Id.doDelete({ id: serverId });

      if (response.$status === 'success') {
        const messageKey = response.permanent_deleted
          ? 'toaster.machineDelete.permanentSuccess'
          : 'toaster.machineDelete.deleteQueued';

        openToaster({
          variant: 'success',
          message: t.rich(messageKey, {
            code: (chunks) => <code>{chunks}</code>,
            machineName: serverName || '',
            machineID: serverId,
          }),
        });
        onSuccess();
        return;
      }

      const blockingResources = getBlockingResourceCounts(response.error);

      openToaster({
        variant: 'error',
        title: t.rich('toaster.machineDelete.error', {
          code: (chunks) => <code>{chunks}</code>,
          machineName: serverName || '',
          machineID: serverId,
        }),
        message: blockingResources ? (
          <>
            <span>{getApiErrorDetail(response.error)}</span>
            <br />
            <span>
              {t('toaster.machineDelete.blockingResources', blockingResources)}
            </span>
          </>
        ) : (
          getApiErrorDetail(response.error)
        ),
      });
    } finally {
      setIsDeleting(false);
      setTarget(null);
    }
  });

  return [handleUsecase, { target, isDeleting, confirm, close }] as const;
}

function getBlockingResourceCounts(error: Error) {
  const data = error instanceof BaseResponseError ? error.data : undefined;

  if (data == null || typeof data !== 'object') return null;

  const record = data as Partial<
    Record<
      | 'application_deployments'
      | 'application_artifacts'
      | 'load_balancers'
      | 'total_blocking_resources',
      unknown
    >
  >;

  const totalBlockingResources = toNumber(record.total_blocking_resources);
  if (totalBlockingResources < 1) return null;

  return {
    deployments: toNumber(record.application_deployments),
    artifacts: toNumber(record.application_artifacts),
    loadBalancers: toNumber(record.load_balancers),
  };
}

function toNumber(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}
