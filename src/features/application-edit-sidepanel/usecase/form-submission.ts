import { useDevetekTranslations } from '@/services/i18n';
import { useToaster } from '@/services/toaster';

import { ApiApplication } from '@/shared/api';

import { useApplicationEditModel } from '../model';
import { useEmit, useSubscribe } from '../model/events';

export default function useFormSubmissionUsecase() {
  const { props, form, onSuccess } = useApplicationEditModel();

  const t = useDevetekTranslations('toaster.updateApplication');

  const [openToaster] = useToaster();

  const sidepanelEmit = useEmit();

  const handleSubmit = form.handleSubmit(async (values) => {
    const { autoDeploy, buildTimeout, description } = values;
    const dirty = form.formState.dirtyFields;

    // The API merges what it receives over the stored definition, so only
    // the parts that changed are sent.
    const appDefinition: Record<string, unknown> = {};
    if (dirty.description) appDefinition.run = { description };
    if (dirty.buildTimeout) appDefinition.build = { timeout: buildTimeout };

    const response = await ApiApplication.Update.$Id.doPost({
      applicationId: String(props.applicationId),
      payload: {
        app_config: {
          auto_deploy: {
            enabled: autoDeploy.isEnabled,
            branch: autoDeploy.isEnabled ? autoDeploy.fromBranch : '',
          },
        },
        ...(Object.keys(appDefinition).length > 0
          ? { app_definition: appDefinition }
          : {}),
      },
    });

    if (response.$status === 'success') {
      openToaster({
        variant: 'success',
        message: t('success', { id: props.applicationId }),
      });

      sidepanelEmit('#application-edit-sidepanel/sidepanel-close', {
        bypass: true,
      });
      onSuccess();
      return;
    }

    openToaster({
      variant: 'error',
      title: t('error', { id: props.applicationId }),
      message: response.error.message,
    });
  });

  useSubscribe('#application-edit-sidepanel/form-submit', () => handleSubmit());
}
