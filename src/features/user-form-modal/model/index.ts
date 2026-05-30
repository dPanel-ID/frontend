import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { buildContext } from '@/shared/libs/react-factories/buildContext';

import { formSchema } from './form';
import type { FormSchema } from './form';
import type { UserFormModalProps as Props } from './types';

export const [DcProvider, useDcContext] = buildContext(
  'UserFormModal',
  (props: Props) => {
    const form = useForm<FormSchema>({
      resolver: zodResolver(formSchema),
      defaultValues: {
        fullname: props.user.fullname,
        avatar_url: props.user.avatar_url ?? '',
        password: '',
        confirmPassword: '',
      },
    });

    return {
      props,
      form,
    };
  },
);
