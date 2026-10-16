import { useDevetekTranslations } from '@/services/i18n';
import { useToaster } from '@/services/toaster';

import { ApiOwnership } from '@/shared/api';
import type { ResourceType } from '@/shared/api/ownership.transfer';

import { usePropsModel } from '../-models';
import { useEmit, useSubscribe } from '../-models/events';
import { useMigrateOwnershipForm } from '../-models/form';
import type { SupportedModule } from '../-rules/types';

const resourceTypes: Record<SupportedModule, ResourceType> = {
  server: 'server',
  application: 'application',
  domain: 'domain',
  'cloud-project': 'cloud-project',
};

export default function useFormSubmissionUsecase() {
  const [openToaster] = useToaster();
  const t = useDevetekTranslations();

  const emit = useEmit();

  const { mod, onSuccess } = usePropsModel();

  const form = useMigrateOwnershipForm();

  const handleSubmit = form.handleSubmit(async (values) => {
    const response = await ApiOwnership.Transfer.doPost({
      resourceType: resourceTypes[mod.type],
      resourceId: mod.moduleId,
      target: values.target,
      includeDependencies: values.includeDependencies,
    });

    if (response.$status === 'success') {
      const moved = response.moved.length;
      openToaster({
        variant: 'success',
        message:
          moved > 1
            ? t('modal.migrateOwnership.toaster.successWithDependencies', {
                count: moved,
              })
            : t('modal.migrateOwnership.toaster.success'),
      });
      emit('#migrate-ownership-modal/modal-close');
      onSuccess?.();
      return;
    }

    // The API explains forbidden and dependency conflicts in plain words.
    openToaster({
      variant: 'error',
      message:
        response.error.message || t('modal.migrateOwnership.toaster.error'),
    });
  });

  useSubscribe('#migrate-ownership-modal/form-submit', () => {
    handleSubmit();
  });
}
