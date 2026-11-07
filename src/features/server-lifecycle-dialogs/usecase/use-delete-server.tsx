import { useState } from 'react';

import { useDevetekTranslations } from '@/services/i18n';
import { useToaster } from '@/services/toaster';

import { ApiServer } from '@/shared/api';
import {
  BaseResponseError,
  getApiErrorDetail,
} from '@/shared/libs/api-client/lib/error';
import useHandler from '@/shared/libs/react-hooks/useHandler';

import type { DeleteServerPayload, ForgetServerOffer } from '../rules/types';

interface Params {
  onSuccess: () => void;
}

/**
 * Holds the server waiting for a typed confirmation and performs the delete
 * once it is given. The view renders the dialog from the returned state.
 *
 * A server that is gone and still holds resources cannot be deleted the usual
 * way; the dialog then stays open on `forgetOffer`, and confirming again
 * removes the server and its records from dPanel only.
 */
export default function useDeleteServer(params: Params) {
  const { onSuccess } = params;

  const t = useDevetekTranslations();
  const [openToaster] = useToaster();

  const [target, setTarget] = useState<DeleteServerPayload | null>(null);
  const [forgetOffer, setForgetOffer] = useState<ForgetServerOffer | null>(
    null,
  );
  const [isDeleting, setIsDeleting] = useState(false);

  const handleUsecase = useHandler((payload: DeleteServerPayload) => {
    setForgetOffer(null);
    setTarget(payload);
  });

  const close = useHandler(() => {
    if (isDeleting) return;
    setTarget(null);
    setForgetOffer(null);
  });

  const confirm = useHandler(async (vmDeleted?: boolean) => {
    if (!target || isDeleting) return;
    const { serverId, serverName } = target;
    const forget = forgetOffer != null;
    let keepOpen = false;

    setIsDeleting(true);
    try {
      const response = await ApiServer.Delete.$Id.doDelete({
        id: serverId,
        forget,
        // Only an explicit true counts: never an event object.
        vmDeleted: forget && vmDeleted === true,
      });

      if (response.$status === 'success') {
        const removed = response.forgotten;
        openToaster({
          variant: 'success',
          message: removed
            ? t('toaster.machineDelete.forgotten', {
                machineName: serverName || serverId,
                deployments: removed.application_deployments ?? 0,
                artifacts: removed.application_artifacts ?? 0,
                loadBalancers: removed.load_balancers ?? 0,
                jobs: removed.stopped_jobs ?? 0,
              })
            : t.rich(
                response.permanent_deleted
                  ? 'toaster.machineDelete.permanentSuccess'
                  : 'toaster.machineDelete.deleteQueued',
                {
                  code: (chunks) => <code>{chunks}</code>,
                  machineName: serverName || '',
                  machineID: serverId,
                },
              ),
        });
        onSuccess();
        return;
      }

      const offer = !forget ? getForgetOffer(response.error) : null;
      if (offer) {
        keepOpen = true;
        setForgetOffer(offer);
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
      if (!keepOpen) {
        setTarget(null);
        setForgetOffer(null);
      }
    }
  });

  return [
    handleUsecase,
    { target, forgetOffer, isDeleting, confirm, close },
  ] as const;
}

function errorData(error: Error) {
  const data = error instanceof BaseResponseError ? error.data : undefined;
  if (data == null || typeof data !== 'object') return null;
  return data as Record<string, unknown>;
}

function getBlockingResourceCounts(error: Error) {
  const record = errorData(error);
  if (!record) return null;

  const totalBlockingResources = toNumber(record.total_blocking_resources);
  if (totalBlockingResources < 1) return null;

  return {
    deployments: toNumber(record.application_deployments),
    artifacts: toNumber(record.application_artifacts),
    loadBalancers: toNumber(record.load_balancers),
  };
}

/** A 409 whose server is gone offers to remove it from dPanel only. */
export function getForgetOffer(error: Error): ForgetServerOffer | null {
  const record = errorData(error);
  if (!record || record.can_forget !== true) return null;
  const counts = getBlockingResourceCounts(error);
  if (!counts) return null;

  const reachability =
    record.reachability != null && typeof record.reachability === 'object'
      ? (record.reachability as Record<string, unknown>)
      : {};
  const cloudVM =
    record.cloud_vm != null && typeof record.cloud_vm === 'object'
      ? (record.cloud_vm as Record<string, unknown>)
      : {};
  return {
    ...counts,
    lastSeenAt:
      typeof reachability.last_seen_at === 'string'
        ? reachability.last_seen_at
        : undefined,
    reason:
      typeof reachability.reason === 'string' ? reachability.reason : undefined,
    unverifiedCloudProvider:
      cloudVM.result === 'unverifiable'
        ? String(cloudVM.provider || 'cloud')
        : undefined,
  };
}

function toNumber(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}
