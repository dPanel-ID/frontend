import { useDialog } from '@/services/dialog';
import { useDevetekTranslations } from '@/services/i18n';
import { useToaster } from '@/services/toaster';

import { ApiServer } from '@/shared/api';
import { BaseResponseError } from '@/shared/libs/api-client/lib/error';
import useHandler from '@/shared/libs/react-hooks/useHandler';

import type { MachineDeletePayload } from './types';

interface Params {
  onSuccess: () => void;
}

export default function useMachineDeleteUsecase(params: Params) {
  const { onSuccess } = params;

  const t = useDevetekTranslations();

  const [openToaster] = useToaster();
  const [openDialog] = useDialog();

  const handleUsecase = useHandler((payload: MachineDeletePayload) => {
    const { serverId, serverName } = payload;

    const action = async () => {
      const response = await ApiServer.Delete.$Id.doDelete({
        id: serverId,
      });

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
            <span>{getMachineDeleteErrorMessage(response.error)}</span>
            <br />
            <span>
              {t('toaster.machineDelete.blockingResources', blockingResources)}
            </span>
          </>
        ) : (
          getMachineDeleteErrorMessage(response.error)
        ),
      });
    };

    openDialog({
      title: t('dialog.machineDelete.title'),
      content: t.rich('dialog.machineDelete.message', {
        code: (chunks) => <code>{chunks}</code>,
        machineName: serverName || '',
        machineID: serverId,
      }),
      variant: 'warning',
      actions: {
        variant: 'YesNo',
        yes: action,
      },
    });
  });

  return [handleUsecase] as const;
}

function getMachineDeleteErrorMessage(error: Error) {
  if (error instanceof BaseResponseError) {
    return error.errorMessage || error.message;
  }

  return error.message;
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
