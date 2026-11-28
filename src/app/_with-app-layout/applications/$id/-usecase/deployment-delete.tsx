import { useState } from 'react';

import { useDialog } from '@/services/dialog';
import { useDevetekTranslations } from '@/services/i18n';
import { useToaster } from '@/services/toaster';

import { ApiDeploy } from '@/shared/api';
import { getApiErrorDetail } from '@/shared/libs/api-client/lib/error';
import useHandler from '@/shared/libs/react-hooks/useHandler';
import { Checkbox } from '@/shared/presentation/atoms/Checkbox';

import type { DeploymentDeletePayload } from '../-rules/usecase-types';

interface Params {
  onSuccess: () => void;
}

/** The "also delete the data" choice, kept by the dialog's own state. */
function DeleteDataChoice(props: {
  label: string;
  hint: string;
  onChange: (checked: boolean) => void;
}) {
  const [checked, setChecked] = useState(false);

  return (
    <div className="flex items-start gap-3 rounded-lg border bg-muted/30 p-3">
      <Checkbox
        id="deployment-delete-data"
        checked={checked}
        aria-describedby="deployment-delete-data-hint"
        onCheckedChange={(next) => {
          setChecked(next === true);
          props.onChange(next === true);
        }}
      />
      <span className="grid gap-1">
        <label
          htmlFor="deployment-delete-data"
          className="cursor-pointer text-sm font-semibold"
        >
          {props.label}
        </label>
        <span
          id="deployment-delete-data-hint"
          className="text-xs leading-relaxed text-muted-foreground"
        >
          {props.hint}
        </span>
      </span>
    </div>
  );
}

export default function useDeploymentDeleteUsecase(params: Params) {
  const { onSuccess } = params;
  const t = useDevetekTranslations('page.applicationDetail.deploymentDelete');

  const [openDialog] = useDialog();
  const [openToaster] = useToaster();

  const handleUsecase = useHandler((payload: DeploymentDeletePayload) => {
    const { deploymentId, usesReleaseFolders } = payload;
    const id = String(deploymentId);
    // Read when the person confirms; unticked unless they choose it.
    let deleteData = false;

    const handleDeleteDeployment = async () => {
      const response = await ApiDeploy.Delete.$Id.doDelete({
        id,
        deleteData: usesReleaseFolders ? deleteData : undefined,
      });

      if (response.$status === 'success') {
        openToaster({ variant: 'success', message: t('deleted', { id }) });
        onSuccess();
        return;
      }
      openToaster({
        variant: 'error',
        title: t('failed', { id }),
        message: getApiErrorDetail(response.error),
      });
    };

    openDialog({
      title: t('title'),
      content: (
        <div className="grid gap-3 text-sm">
          <p>{t('body', { id })}</p>
          {usesReleaseFolders && (
            <>
              <p className="text-xs leading-relaxed text-muted-foreground">
                {t('keepsData')}
              </p>
              <DeleteDataChoice
                label={t('deleteData')}
                hint={t('deleteDataHint')}
                onChange={(checked) => {
                  deleteData = checked;
                }}
              />
            </>
          )}
        </div>
      ),
      variant: 'warning',
      actions: {
        variant: 'YesNo',
        yes: handleDeleteDeployment,
      },
    });
  });

  return [handleUsecase] as const;
}
