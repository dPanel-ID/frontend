import { useCallback, useState } from 'react';

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
        zoneSlug: '',
      },
      login: {
        username: 'dpanel',
        password: '',
      },
      joinMethod: 'agent',
      contract: { agentJoin: false, publicIPChoice: false },
      regionSlug: '',
      spec: {
        billingCycle: '',
        cpuCore: 2,
        description: '',
        diskSizeGB: 20,
        keypairName: '',
        machineType: '',
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

  // Display names for IDs the form stores (project, SSH key, product), so
  // the review panel can show names without refetching.
  const [labels, setLabels] = useState<Record<string, string>>({});
  const setLabel = useCallback((key: string, label: string) => {
    setLabels((current) =>
      current[key] === label ? current : { ...current, [key]: label },
    );
  }, []);

  const handleFormReset = useHandler(() => {
    setLabels({});
    form.reset({
      cloud: {
        billingAccountID: undefined,
        projectID: undefined,
        sshKeyID: undefined,
        zoneSlug: '',
      },
      login: {
        username: 'dpanel',
        password: '',
      },
      joinMethod: 'agent',
      contract: { agentJoin: false, publicIPChoice: false },
      regionSlug: '',
      spec: {
        billingCycle: '',
        cpuCore: 2,
        description: '',
        diskSizeGB: 20,
        keypairName: '',
        machineType: '',
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
    labels,
    setLabel,
  };
});
