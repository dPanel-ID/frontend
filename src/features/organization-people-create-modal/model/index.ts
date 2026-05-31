import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { buildContext } from '@/shared/libs/react-factories/buildContext';

import { formSchema } from './form';
import type { FormSchema } from './form';
import type { OrganizationPeopleCreateModalProps as Props } from './types';

export const [DcProvider, useDcContext] = buildContext(
  'OrganizationPeopleCreateModal',
  (props: Props) => {
    const form = useForm<FormSchema>({
      defaultValues: {
        organization_id: props.organization_id,
        user_id: '',
        roles: [],
      },
      resolver: zodResolver(formSchema),
    });

    return {
      props,
      form,
    };
  },
);
