import type { useForm } from 'react-hook-form';

import { useDevetekTranslations } from '@/services/i18n';

import { ErrorInline } from '@/shared/presentation/atoms/ErrorInline';
import { Input } from '@/shared/presentation/atoms/Input';
import { TextArea } from '@/shared/presentation/atoms/TextArea';

import type { DomainCreateForm } from '../-rules/form';
import { FieldLabel } from '../-view/-presentation/fields';

export function DomainIdentitySection(props: {
  form: ReturnType<typeof useForm<DomainCreateForm>>;
  isSubmitting: boolean;
}) {
  const { form, isSubmitting } = props;
  const t = useDevetekTranslations();
  const tAll = useDevetekTranslations();

  return (
    <>
      <div className="grid gap-4">
        <div>
          <FieldLabel
            htmlFor="domain-create-domain"
            label={t('page.domainCreate.fields.domain.label')}
            description={t('page.domainCreate.fields.domain.description')}
            required
          />
          <Input
            id="domain-create-domain"
            placeholder={t('page.domainCreate.fields.domain.placeholder')}
            autoComplete="off"
            disabled={isSubmitting}
            aria-invalid={Boolean(form.formState.errors.domain)}
            {...form.register('domain')}
          />
          <ErrorInline
            t={tAll}
            message={form.formState.errors.domain?.message}
          />
        </div>

        <div>
          <FieldLabel
            htmlFor="domain-create-description"
            label={t('page.domainCreate.fields.description.label')}
            description={t('page.domainCreate.fields.description.description')}
          />
          <TextArea
            id="domain-create-description"
            className="min-h-24 resize-y"
            placeholder={t('page.domainCreate.fields.description.placeholder')}
            disabled={isSubmitting}
            {...form.register('description')}
          />
        </div>
      </div>
    </>
  );
}
