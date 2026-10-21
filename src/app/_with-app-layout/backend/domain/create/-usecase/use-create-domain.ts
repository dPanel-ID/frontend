import { useState } from 'react';

import { useNavigate } from '@tanstack/react-router';

import { useDevetekTranslations } from '@/services/i18n';
import { useToaster } from '@/services/toaster';

import { ApiDomain } from '@/shared/api';
import type { ProviderContract } from '@/shared/api/domain.providers';
import useHandler from '@/shared/libs/react-hooks/useHandler';

import { buildCredentialPayload } from '../-lib/providers';
import type { DomainCreateForm } from '../-rules/form';

/**
 * Sends the create request and routes back to the list on success. The
 * caller keeps the form; this owns only the request and what the user is
 * told about it.
 */
export default function useCreateDomain() {
  const t = useDevetekTranslations();
  const navigate = useNavigate();
  const [openToaster] = useToaster();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const backToDomains = useHandler(() => {
    navigate({
      to: '/backend/domain',
      search: { page: 1, viewMode: 'auto' },
    });
  });

  const create = useHandler(
    async (values: DomainCreateForm, provider: ProviderContract) => {
      setIsSubmitting(true);

      try {
        const response = await ApiDomain.Create.doPost({
          domain: values.domain,
          description: values.description?.trim() || undefined,
          provider: values.provider,
          credential: buildCredentialPayload(provider, values),
        });

        if (response.$status === 'failed') throw response.error;

        openToaster({
          variant: 'success',
          message: t('page.domainCreate.toaster.success'),
        });

        backToDomains();
      } catch (error) {
        openToaster({
          variant: 'error',
          title: t('page.domainCreate.toaster.errorTitle'),
          message: error instanceof Error ? error.message : String(error),
        });
      } finally {
        setIsSubmitting(false);
      }
    },
  );

  return { create, isSubmitting, backToDomains };
}
