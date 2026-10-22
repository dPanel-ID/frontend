import { LockKeyholeIcon } from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

import type { ProviderContract } from '@/shared/api/domain.providers';
import { Card } from '@/shared/presentation/atoms/Card';

import { getCredentialFields } from '../../-lib/providers';

export function SecurityCard() {
  const t = useDevetekTranslations();

  return (
    <Card className="rounded-lg border-primary/20 bg-primary/5">
      <div className="flex items-start gap-3 p-4">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-md border bg-background text-primary">
          <LockKeyholeIcon className="size-4" />
        </span>
        <div className="min-w-0">
          <h2 className="text-sm font-semibold">
            {t('page.domainCreate.security.title')}
          </h2>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            {t('page.domainCreate.security.description')}
          </p>
        </div>
      </div>
    </Card>
  );
}

export function FieldLabel(props: {
  htmlFor: string;
  label: string;
  description?: string;
  required?: boolean;
}) {
  const { description, htmlFor, label, required } = props;

  return (
    <label className="mb-1.5 block" htmlFor={htmlFor}>
      <span className="block text-sm font-semibold">
        {label}
        {required && <span className="text-destructive">*</span>}
      </span>
      {description && (
        <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
          {description}
        </span>
      )}
    </label>
  );
}

export function renderCredentialRequirement(
  provider: ProviderContract,
  t: ReturnType<typeof useDevetekTranslations>,
) {
  const requiredFields = getCredentialFields(provider).filter(
    (field) => field.required,
  );

  if (requiredFields.length < 1) {
    return t('page.domainCreate.providerMetadata.noRequired');
  }

  return t('page.domainCreate.providerMetadata.requiredCount', {
    count: requiredFields.length,
  });
}
