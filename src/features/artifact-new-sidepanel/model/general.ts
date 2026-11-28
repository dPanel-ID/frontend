import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { buildContext } from '@/shared/libs/react-factories/buildContext';

import { schemaArtifactNewForm } from '../rules/schema/form';
import type { ArtifactNewSidepanelProps as Props } from '../rules/types';

/** The form's values when the panel opens. */
export function artifactNewDefaults(
  props: Pick<Props, 'currentServerId' | 'defaultBranch'>,
) {
  return {
    appConfigFile: 'default' as const,
    fromBranch: props.defaultBranch?.trim() || '',
    hostGroupId: '',
    targetMode: 'server' as const,
    workerId: props.currentServerId || '',
  };
}

export const [ArtifactNewGeneralModelProvider, useArtifactNewGeneralModel] =
  buildContext('ArtifactNewGeneralModel', (props: Props) => {
    const form = useForm({
      resolver: zodResolver(schemaArtifactNewForm),
      defaultValues: artifactNewDefaults(props),
    });

    return {
      props,
      form,
      isSubmitting: form.formState.isSubmitting,
      hasChanges: form.formState.isDirty,
    };
  });
