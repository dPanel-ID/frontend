import { zodResolver } from '@hookform/resolvers/zod';
import { useForm as useReactHookForm } from 'react-hook-form';

import { buildContext } from '@/shared/libs/react-factories/buildContext';
import useHandler from '@/shared/libs/react-hooks/useHandler';

import { formSchema } from './form';

export const [FormProvider, useForm] = buildContext('Form', () => {
  const form = useReactHookForm({
    resolver: zodResolver(formSchema),
    mode: 'onTouched',
    defaultValues: {
      provider: '',
      cloud: {
        billingAccountID: undefined,
        projectID: undefined,
        sshKeyID: undefined,
      },
      login: {
        username: 'dpanel',
        password: '',
      },
      regionSlug: '',
      spec: {
        billingCycle: '',
        cpuCore: 2,
        description: '',
        diskSizeGB: 20,
        keypairName: '',
        osName: '',
        osTemplate: '',
        osVersion: '',
        payInvoiceWithCC: 'no',
        productID: undefined,
        promocode: '',
        ramSizeGB: 2,
        reservePublicIP: true,
        vmName: '',
      },
      vpcBulk: {
        id: '',
        subnet: '',
      },
    },
  });

  const handleFormReset = useHandler(() => {
    form.reset({
      cloud: {
        billingAccountID: undefined,
        projectID: undefined,
        sshKeyID: undefined,
      },
      login: {
        username: 'dpanel',
        password: '',
      },
      regionSlug: '',
      spec: {
        billingCycle: '',
        cpuCore: 2,
        description: '',
        diskSizeGB: 20,
        keypairName: '',
        osName: '',
        osTemplate: '',
        osVersion: '',
        payInvoiceWithCC: 'no',
        productID: undefined,
        promocode: '',
        ramSizeGB: 2,
        reservePublicIP: true,
        vmName: '',
      },
      provider: '',
      vpcBulk: {
        id: '',
        subnet: '',
      },
    });
  });

  return {
    form,
    formErrors: form.formState.errors,
    handleFormReset,
  };
});
