import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { buildContext } from '@/shared/libs/react-factories/buildContext';

import { schemaServerEdit } from '../rules/form-schema';
import type { ServerEditSidepanelProps } from '../rules/types';

export const [ServerEditModelProvider, useServerEditModel] = buildContext(
  'ServerEditModel',
  (props: ServerEditSidepanelProps) => {
    const { serverId, onSuccess = () => {} } = props;

    const form = useForm({
      resolver: zodResolver(schemaServerEdit),
      // Validate as the user types so Save can stay disabled until the form is valid.
      mode: 'onChange',
      defaultValues: {
        agent: {
          // An undefined default reads back as '' and would mark the form dirty.
          domain: props.agent.domain ?? '',
          httpPort: props.agent.httpPort,
        },
        serverAddress: props.serverAddress,
        ssh: {
          port: props.ssh.port,
          username: props.ssh.username,
        },
      },
    });

    return {
      serverId,
      form,
      onSuccess,
      isSubmitting: form.formState.isSubmitting,
      hasChanges: form.formState.isDirty,
      isValid: form.formState.isValid,
    };
  },
);
