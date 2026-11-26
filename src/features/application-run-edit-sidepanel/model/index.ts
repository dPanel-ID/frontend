import { useMemo } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';

import {
  envVariablesToText,
  parseEnvText,
} from '@/entities/application/lib/env-text';

import { buildContext } from '@/shared/libs/react-factories/buildContext';

import { schemaApplicationRunEdit } from '../rules/form-schema';
import type { ApplicationRunEditSidepanelProps } from '../rules/types';

export const [ApplicationRunEditModelProvider, useApplicationRunEditModel] =
  buildContext(
    'ApplicationRunEditModel',
    (props: ApplicationRunEditSidepanelProps) => {
      const { onSuccess = () => {} } = props;

      const form = useForm({
        resolver: zodResolver(schemaApplicationRunEdit),
        defaultValues: {
          command: props.command,
          envText: envVariablesToText(
            props.envs
              .filter((env) => env.key)
              .map((env) => ({ key: env.key, value: env.value ?? '' })),
          ),
        },
      });

      const envText = useWatch({ control: form.control, name: 'envText' });
      const hasEnvErrors = useMemo(
        () => parseEnvText(envText).errors.length > 0,
        [envText],
      );

      return {
        props,
        form,
        onSuccess,
        isSubmitting: form.formState.isSubmitting,
        hasChanges: form.formState.isDirty,
        hasEnvErrors,
      };
    },
  );
