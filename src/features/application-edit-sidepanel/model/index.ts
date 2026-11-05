import { useEffect, useMemo } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { ApiApplication } from '@/shared/api';
import type { DTOs } from '@/shared/api';
import { buildContext } from '@/shared/libs/react-factories/buildContext';

import { schemaApplicationEdit } from '../rules/form-schema';
import type { SchemaApplicationEdit } from '../rules/form-schema';
import type {
  ApplicationEditSidepanelProps,
  ApplicationFixedSettings,
} from '../rules/types';

const EMPTY_VALUES: SchemaApplicationEdit = {
  autoDeploy: { isEnabled: false, fromBranch: '' },
  buildTimeout: '',
  description: '',
};

function formValuesFrom(app: DTOs.ApplicationV1): SchemaApplicationEdit {
  const autoDeploy = app.app_config?.auto_deploy;
  return {
    autoDeploy: {
      isEnabled: !!autoDeploy?.enabled,
      fromBranch: autoDeploy?.enabled ? (autoDeploy.branch ?? '') : '',
    },
    buildTimeout: app.app_definition?.build?.timeout ?? '',
    description: app.app_definition?.run?.description ?? '',
  };
}

function fixedSettingsFrom(app: DTOs.ApplicationV1): ApplicationFixedSettings {
  return {
    repository:
      app.repo_org && app.repo_name ? `${app.repo_org}/${app.repo_name}` : '',
    repositoryUrl: app.repo_url,
    workdir: app.workdir ?? '',
    port: app.app_definition?.run?.port,
    serviceName: app.app_definition?.run?.name ?? '',
  };
}

export const [ApplicationEditModelProvider, useApplicationEditModel] =
  buildContext(
    'ApplicationEditModel',
    (props: ApplicationEditSidepanelProps) => {
      const { onSuccess = () => {} } = props;

      const [detail] = ApiApplication.Detail.$Id.useGet({
        applicationId: String(props.applicationId),
      });
      const application =
        detail.$status === 'success' ? (detail as DTOs.ApplicationV1) : null;

      const form = useForm<SchemaApplicationEdit>({
        resolver: zodResolver(schemaApplicationEdit),
        defaultValues: EMPTY_VALUES,
      });

      // Show the stored values once they arrive; Save stays off until the
      // person changes something.
      useEffect(() => {
        if (application) form.reset(formValuesFrom(application));
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [application?.id, application?.updated_at]);

      const fixed = useMemo(
        () => (application ? fixedSettingsFrom(application) : null),
        [application],
      );

      return {
        props,
        form,
        onSuccess,
        status: detail.$status,
        serverCount: application?.deploys?.length ?? 0,
        fixed,
        isSubmitting: form.formState.isSubmitting,
        hasChanges: form.formState.isDirty,
      };
    },
  );
