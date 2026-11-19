import { useNavigate } from '@tanstack/react-router';

import { useDialog } from '@/services/dialog';
import { useDevetekTranslations } from '@/services/i18n';
import { useToaster } from '@/services/toaster';

import { ApiApplication } from '@/shared/api';
import {
  getApiErrorDetail,
  getApiErrorStatus,
} from '@/shared/libs/api-client/lib/error';
import useHandler from '@/shared/libs/react-hooks/useHandler';

import type { ApplicationDeletePayload as Payload } from '../-rules/usecase-types';

/** How long a failed delete stays on screen: long enough to read it. */
const ERROR_TOAST_MS = 8000;

interface Params {
  onSuccess: () => void;
}

/**
 * Asks before deleting an application, then deletes it.
 *
 * The API refuses (409) an application still released on a server; the
 * dialog then explains it and offers the Deployments tab, where each release
 * is removed (a job per server). It never removes releases by itself: that
 * stops a running service, which the person must choose release by release.
 * Every other failure closes the dialog and shows the API's message.
 */
export default function useApplicationDeleteUsecase(params: Params) {
  const { onSuccess } = params;
  const t = useDevetekTranslations('page.applications.delete');
  const navigate = useNavigate();
  const [openDialog, closeDialog] = useDialog();
  const [openToaster] = useToaster();

  const handleUsecase = useHandler((payload: Payload) => {
    const { appName, id } = payload;
    const name = appName;

    const showStillReleased = () => {
      openDialog({
        title: t('stillReleasedTitle'),
        content: t('stillReleasedDescription', { name }),
        variant: 'warning',
        actions: [
          {
            label: t('openDeployments'),
            isPrimary: true,
            onClick: () => {
              void navigate({
                to: '/applications/$id',
                params: { id: String(id) },
                search: { tab: 'deployments' },
              });
            },
          },
          { label: t('close') },
        ],
      });
    };

    const handleDelete = async () => {
      const response = await ApiApplication.Delete.$Id.doDelete({
        applicationId: String(id),
      });

      if (response.$status === 'success') {
        closeDialog();
        openToaster({ variant: 'success', message: t('deleted', { name }) });
        onSuccess();
        return;
      }

      if (getApiErrorStatus(response.error) === 409) {
        // Replaces the question in the same, still open dialog.
        showStillReleased();
        return;
      }

      closeDialog();
      openToaster({
        variant: 'error',
        title: t('failedTitle', { name }),
        message: getApiErrorDetail(response.error),
        duration: ERROR_TOAST_MS,
      });
    };

    openDialog({
      title: t('confirmTitle'),
      content: t('confirmDescription', { name }),
      variant: 'error',
      actions: {
        variant: 'YesNo',
        yes: handleDelete,
        // The outcome decides what the dialog does next.
        persistAfterYes: true,
      },
    });
  });

  return [handleUsecase] as const;
}
