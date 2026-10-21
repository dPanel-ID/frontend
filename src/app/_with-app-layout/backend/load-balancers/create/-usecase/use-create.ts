import { useState } from 'react';

import { useNavigate } from '@tanstack/react-router';

import { useDevetekTranslations } from '@/services/i18n';
import { useToaster } from '@/services/toaster';

import type { LoadBalancerCreationFormValues } from '@/features/load-balancer-creation-sidepanel';

import { ApiLoadBalancer } from '@/shared/api';
import useHandler from '@/shared/libs/react-hooks/useHandler';

import { toCreateLoadBalancerPayload } from '../-lib/payload';
import type { LoadBalancerRuntimeItem } from '../-model/form';

/**
 * Sends the create request and routes to the list on success. The caller
 * keeps the form; this owns only the request and what the user is told.
 */
export default function useCreateLoadBalancer() {
  const t = useDevetekTranslations();
  const navigate = useNavigate();
  const [openToaster] = useToaster();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const create = useHandler(
    async (
      values: LoadBalancerCreationFormValues,
      runtimeItem?: LoadBalancerRuntimeItem,
    ) => {
      setIsSubmitting(true);

      try {
        const response = await ApiLoadBalancer.Create.doPost(
          toCreateLoadBalancerPayload(values, runtimeItem),
        );

        if (response.$status === 'failed') {
          openToaster({
            variant: 'error',
            title: t('toaster.loadBalancerCreate.error'),
            message: response.error.message,
          });
          return;
        }

        openToaster({
          variant: 'success',
          message: t('toaster.loadBalancerCreate.success'),
        });

        navigate({
          to: '/backend/load-balancers',
          search: { page: 1, viewMode: 'auto' },
          replace: true,
        });
      } finally {
        setIsSubmitting(false);
      }
    },
  );

  return { create, isSubmitting };
}
